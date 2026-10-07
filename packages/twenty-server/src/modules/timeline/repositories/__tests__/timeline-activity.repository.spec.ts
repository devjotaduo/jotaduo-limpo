import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';
import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const RECORD_ID = '20202020-0000-4000-8000-000000000002';
const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000003';
const TIMELINE_ACTIVITY_TYPE_ID = '20202020-0000-4000-8000-000000000004';
const TIMELINE_ACTIVITY_TYPE_SNAPSHOT: TimelineActivityTypeSnapshot = {
  id: TIMELINE_ACTIVITY_TYPE_ID,
  universalIdentifier: '20202020-0000-4000-8000-000000000005',
  name: 'recordUpdated',
  label: 'was updated by',
  action: 'updated',
  icon: 'IconPencil',
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: null,
};

describe('TimelineActivityRepository', () => {
  it('merges and stamps a recent row written without a snapshot', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const insert = jest.fn().mockResolvedValue(undefined);
    const workspaceRepository = {
      find: jest.fn().mockResolvedValue([
        {
          id: '20202020-0000-4000-8000-000000000006',
          targetPersonId: RECORD_ID,
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
          timelineActivityTypeSnapshot: null,
          linkedRecordId: null,
          properties: {
            diff: { name: { before: 'Before', after: 'First' } },
          },
        },
      ]),
      update,
      insert,
    };
    const workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(
        async (callback: () => Promise<void>) => callback(),
      ),
      runInWorkspaceTransaction: jest.fn(
        async (
          callback: (transactionScope: {
            getRepository: () => typeof workspaceRepository;
            executeRawQuery: () => Promise<never[]>;
          }) => Promise<void>,
        ) =>
          callback({
            getRepository: () => workspaceRepository,
            executeRawQuery: jest.fn().mockResolvedValue([]),
          }),
      ),
    } as unknown as WorkspaceOrmManager;
    const repository = new TimelineActivityRepository(workspaceOrmManager);

    await repository.upsertTimelineActivities({
      objectSingularName: 'person',
      workspaceId: WORKSPACE_ID,
      payloads: [
        {
          happensAt: new Date('2026-08-23T09:00:00.000Z'),
          properties: {
            diff: { name: { before: 'First', after: 'Second' } },
          },
          recordId: RECORD_ID,
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
          timelineActivityTypeSnapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
        },
      ],
    });

    expect(insert).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      '20202020-0000-4000-8000-000000000006',
      {
        properties: {
          diff: { name: { before: 'Before', after: 'Second' } },
        },
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        timelineActivityTypeSnapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
      },
    );
  });

  it('locks merge identities in a stable order before reading recent rows', async () => {
    const executeRawQuery = jest.fn().mockResolvedValue([]);
    const workspaceRepository = {
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue(undefined),
      insert: jest.fn().mockResolvedValue(undefined),
    };
    const workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(
        async (callback: () => Promise<void>) => callback(),
      ),
      runInWorkspaceTransaction: jest.fn(
        async (
          callback: (transactionScope: {
            getRepository: () => typeof workspaceRepository;
            executeRawQuery: typeof executeRawQuery;
          }) => Promise<void>,
        ) =>
          callback({
            getRepository: () => workspaceRepository,
            executeRawQuery,
          }),
      ),
    } as unknown as WorkspaceOrmManager;
    const repository = new TimelineActivityRepository(workspaceOrmManager);

    await repository.upsertTimelineActivities({
      objectSingularName: 'person',
      workspaceId: WORKSPACE_ID,
      payloads: [
        {
          happensAt: new Date('2026-08-23T09:00:00.000Z'),
          properties: {},
          recordId: 'record-z',
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
          timelineActivityTypeSnapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
        },
        {
          happensAt: new Date('2026-08-23T09:00:00.000Z'),
          properties: {},
          recordId: 'record-a',
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
          timelineActivityTypeSnapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
        },
      ],
    });

    const lockStatement = `SELECT pg_advisory_xact_lock(hashtextextended("lockName", 0))
   FROM unnest($1::text[]) WITH ORDINALITY AS "locks"("lockName", "ordinality")
   ORDER BY "ordinality"`;

    expect(executeRawQuery).toHaveBeenCalledTimes(1);
    expect(executeRawQuery).toHaveBeenCalledWith(lockStatement, [
      [
        JSON.stringify([
          'timeline-activity-merge',
          WORKSPACE_ID,
          'person',
          'record-a',
          WORKSPACE_MEMBER_ID,
          TIMELINE_ACTIVITY_TYPE_ID,
        ]),
        JSON.stringify([
          'timeline-activity-merge',
          WORKSPACE_ID,
          'person',
          'record-z',
          WORKSPACE_MEMBER_ID,
          TIMELINE_ACTIVITY_TYPE_ID,
        ]),
      ],
    ]);
    expect(
      workspaceRepository.find.mock.invocationCallOrder[0],
    ).toBeGreaterThan(executeRawQuery.mock.invocationCallOrder[0]);
  });

  describe('rows written without a workspace member', () => {
    const RECENT_ROW_ID = '20202020-0000-4000-8000-000000000007';
    const APPLICATION_ACTOR: ActorMetadata = {
      source: FieldActorSource.APPLICATION,
      name: 'JotaDuo',
      workspaceMemberId: null,
      context: {},
    };

    const upsertOverRecentRow = async (payloadActor: ActorMetadata) => {
      const workspaceRepository = {
        find: jest.fn().mockResolvedValue([
          {
            id: RECENT_ROW_ID,
            targetPersonId: RECORD_ID,
            workspaceMemberId: null,
            timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
            timelineActivityTypeSnapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
            linkedRecordId: null,
            properties: {
              diff: { name: { before: 'Before', after: 'First' } },
              actor: APPLICATION_ACTOR,
            },
          },
        ]),
        update: jest.fn().mockResolvedValue(undefined),
        insert: jest.fn().mockResolvedValue(undefined),
      };
      const workspaceOrmManager = {
        executeInWorkspaceContext: jest.fn(
          async (callback: () => Promise<void>) => callback(),
        ),
        runInWorkspaceTransaction: jest.fn(
          async (
            callback: (transactionScope: {
              getRepository: () => typeof workspaceRepository;
              executeRawQuery: () => Promise<never[]>;
            }) => Promise<void>,
          ) =>
            callback({
              getRepository: () => workspaceRepository,
              executeRawQuery: jest.fn().mockResolvedValue([]),
            }),
        ),
      } as unknown as WorkspaceOrmManager;

      await new TimelineActivityRepository(
        workspaceOrmManager,
      ).upsertTimelineActivities({
        objectSingularName: 'person',
        workspaceId: WORKSPACE_ID,
        payloads: [
          {
            happensAt: new Date('2026-08-23T09:00:00.000Z'),
            properties: {
              diff: { name: { before: 'First', after: 'Second' } },
              actor: payloadActor,
            },
            recordId: RECORD_ID,
            timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
            timelineActivityTypeSnapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
          },
        ],
      });

      return workspaceRepository;
    };

    it('keeps the actor when merging a row of the same actor', async () => {
      const { update, insert } = await upsertOverRecentRow({
        ...APPLICATION_ACTOR,
      });

      expect(insert).not.toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith(RECENT_ROW_ID, {
        properties: {
          diff: { name: { before: 'Before', after: 'Second' } },
          actor: APPLICATION_ACTOR,
        },
        workspaceMemberId: undefined,
      });
    });

    it('does not merge a row of another actor', async () => {
      const apiKeyActor: ActorMetadata = {
        source: FieldActorSource.API,
        name: 'Zapier key',
        workspaceMemberId: null,
        context: {},
      };

      const { update, insert } = await upsertOverRecentRow(apiKeyActor);

      expect(update).not.toHaveBeenCalled();
      expect(insert).toHaveBeenCalledWith([
        expect.objectContaining({
          properties: {
            diff: { name: { before: 'First', after: 'Second' } },
            actor: apiKeyActor,
          },
        }),
      ]);
    });
  });
});
