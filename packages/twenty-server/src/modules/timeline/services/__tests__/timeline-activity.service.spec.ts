import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';
import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { type TimelineActivityRoutingPlanService } from 'src/modules/timeline/services/timeline-activity-routing-plan.service';
import { type TimelineActivityTargetQueryService } from 'src/modules/timeline/services/timeline-activity-target-query.service';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const RECORD_ID = '20202020-0000-4000-8000-000000000002';
const TIMELINE_ACTIVITY_TYPE_ID = '20202020-0000-4000-8000-000000000003';
const HAPPENS_AT = '2026-10-07T12:00:00.000Z';

const TIMELINE_ACTIVITY_TYPE_SNAPSHOT: TimelineActivityTypeSnapshot = {
  id: TIMELINE_ACTIVITY_TYPE_ID,
  universalIdentifier: '20202020-0000-4000-8000-000000000004',
  name: 'recordUpdated',
  label: 'was updated by',
  action: null,
  icon: 'IconPencil',
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: null,
};

const COMPANY_FLAT_OBJECT_METADATA = {
  id: '20202020-0000-4000-8000-000000000005',
  nameSingular: 'company',
  universalIdentifier: '20202020-0000-4000-8000-000000000006',
} as FlatObjectMetadata;

const SELF_RULE: TimelineActivityRule = {
  sourceFlatObjectMetadata: COMPANY_FLAT_OBJECT_METADATA,
  actions: ['created', 'updated', 'deleted', 'restored'],
  timelineActivityType: {
    id: TIMELINE_ACTIVITY_TYPE_ID,
    applicationId: '20202020-0000-4000-8000-000000000007',
    snapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
  },
  triggerFieldNames: null,
  happensAtFieldName: null,
  targetShape: { kind: 'SELF' },
};

const CREATOR: ActorMetadata = {
  source: FieldActorSource.MANUAL,
  name: 'Jane Smith',
  workspaceMemberId: '20202020-0000-4000-8000-000000000008',
  context: {},
};

const APPLICATION_ACTOR: ActorMetadata = {
  source: FieldActorSource.APPLICATION,
  name: 'JotaDuo',
  workspaceMemberId: null,
  context: {},
};

const buildService = () => {
  const upsertTimelineActivities = jest.fn().mockResolvedValue(undefined);

  const service = new TimelineActivityService(
    {
      upsertTimelineActivities,
      updateLinkedTimelineActivitiesHappensAt: jest
        .fn()
        .mockResolvedValue(undefined),
    } as unknown as TimelineActivityRepository,
    {
      executeInWorkspaceContext: jest.fn(
        async (callback: () => Promise<unknown>) => callback(),
      ),
    } as unknown as WorkspaceOrmManager,
    {
      getRulesForEventBatch: jest.fn().mockResolvedValue({
        sourceRules: [SELF_RULE],
        junctionRules: [],
        nonAuditLoggedFieldNames: new Set<string>(),
        flatFieldMetadataMaps: {},
        resolveTimelineActivityType: jest.fn(),
      }),
    } as unknown as TimelineActivityRoutingPlanService,
    {} as TimelineActivityTargetQueryService,
  );

  return { service, upsertTimelineActivities };
};

const upsertEvent = async (
  action: 'created' | 'updated' | 'deleted',
  event: ObjectRecordBaseEvent,
) => {
  const { service, upsertTimelineActivities } = buildService();

  await service.upsertEvents({
    name: `company.${action}`,
    workspaceId: WORKSPACE_ID,
    objectMetadata: COMPANY_FLAT_OBJECT_METADATA,
    events: [event],
  });

  return upsertTimelineActivities.mock.calls[0][0].payloads[0].properties;
};

describe('TimelineActivityService', () => {
  it('stores the creator as the actor of a creation', async () => {
    const properties = await upsertEvent('created', {
      recordId: RECORD_ID,
      properties: {
        after: {
          name: 'Acme',
          createdBy: APPLICATION_ACTOR,
          updatedBy: APPLICATION_ACTOR,
          updatedAt: HAPPENS_AT,
        },
      },
    });

    expect(properties).toEqual({ actor: APPLICATION_ACTOR });
  });

  it('stores the updater as the actor next to the diff of an update', async () => {
    const diff = {
      name: { before: 'Acme', after: 'Acme Inc' },
      updatedBy: { before: CREATOR, after: APPLICATION_ACTOR },
    };

    const properties = await upsertEvent('updated', {
      recordId: RECORD_ID,
      properties: {
        before: { name: 'Acme', createdBy: CREATOR, updatedBy: CREATOR },
        after: {
          name: 'Acme Inc',
          createdBy: CREATOR,
          updatedBy: APPLICATION_ACTOR,
          updatedAt: HAPPENS_AT,
        },
        updatedFields: ['name', 'updatedBy'],
        diff,
      },
    });

    expect(properties).toEqual({ diff, actor: APPLICATION_ACTOR });
  });

  it('stores no actor on a deletion because the record keeps its previous author', async () => {
    const properties = await upsertEvent('deleted', {
      recordId: RECORD_ID,
      properties: {
        before: { deletedAt: null, updatedBy: CREATOR },
        after: { deletedAt: HAPPENS_AT, updatedBy: CREATOR },
        updatedFields: ['deletedAt'],
        diff: { deletedAt: { before: null, after: HAPPENS_AT } },
      },
    });

    expect(properties).toEqual({});
  });
});
