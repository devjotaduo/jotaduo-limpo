import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { resolveTimelineActivityActor } from 'src/modules/timeline/utils/resolve-timeline-activity-actor.util';

const CREATOR: ActorMetadata = {
  source: FieldActorSource.MANUAL,
  name: 'Jane Smith',
  workspaceMemberId: '20202020-0000-4000-8000-000000000001',
  context: {},
};

const APPLICATION_ACTOR: ActorMetadata = {
  source: FieldActorSource.APPLICATION,
  name: 'JotaDuo',
  workspaceMemberId: null,
  context: {},
};

const event = {
  recordId: '20202020-0000-4000-8000-000000000002',
  properties: {
    before: { createdBy: CREATOR, updatedBy: CREATOR },
    after: { createdBy: CREATOR, updatedBy: APPLICATION_ACTOR },
  },
} as ObjectRecordBaseEvent;

describe('resolveTimelineActivityActor', () => {
  it('uses createdBy for a creation', () => {
    expect(resolveTimelineActivityActor({ event, ruleAction: 'created' })).toBe(
      CREATOR,
    );
  });

  it('uses updatedBy for an update', () => {
    expect(resolveTimelineActivityActor({ event, ruleAction: 'updated' })).toBe(
      APPLICATION_ACTOR,
    );
  });

  it.each(['deleted', 'restored'] as const)(
    'stores no actor on %s because the record keeps its previous author',
    (ruleAction) => {
      expect(
        resolveTimelineActivityActor({ event, ruleAction }),
      ).toBeUndefined();
    },
  );

  it('returns undefined when the record has no actor field', () => {
    expect(
      resolveTimelineActivityActor({
        event: {
          recordId: event.recordId,
          properties: { after: { name: 'Acme' } },
        } as ObjectRecordBaseEvent,
        ruleAction: 'updated',
      }),
    ).toBeUndefined();
  });
});
