import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';

// Only create and update stamp the actor fields; delete and restore leave the previous author in place
const ACTOR_FIELD_NAME_BY_RULE_ACTION: Partial<
  Record<TimelineActivityRuleAction, 'createdBy' | 'updatedBy'>
> = {
  created: 'createdBy',
  updated: 'updatedBy',
};

export const resolveTimelineActivityActor = ({
  event,
  ruleAction,
}: {
  event: ObjectRecordBaseEvent;
  ruleAction: TimelineActivityRuleAction;
}): ActorMetadata | undefined => {
  const actorFieldName = ACTOR_FIELD_NAME_BY_RULE_ACTION[ruleAction];
  const record = event.properties.after;

  if (!isDefined(actorFieldName) || !isPlainObject(record)) {
    return undefined;
  }

  const actor = record[actorFieldName];

  return isPlainObject(actor) ? (actor as ActorMetadata) : undefined;
};
