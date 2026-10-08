import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { isFieldActorValue } from '@/object-record/record-field/ui/types/guards/isFieldActorValue';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

// A person's change always links the workspace member, so a MANUAL actor here is
// the 'System' column default or an updatedBy left behind by an earlier edit
const getNonManualActorName = (actor: unknown): string | undefined =>
  isFieldActorValue(actor) &&
  actor.source !== 'MANUAL' &&
  isNonEmptyString(actor.name.trim())
    ? actor.name
    : undefined;

// Older rows only kept the actor inside the diff or the full record, and rows
// an app writes through the API carry it in their own createdBy
const getTimelineActivityActorCandidates = (
  event: TimelineActivity,
): unknown[] => {
  const after = event.properties?.after;
  const afterRecord = isPlainObject(after) ? after : undefined;

  return [
    event.properties?.actor,
    event.properties?.diff?.updatedBy?.after,
    afterRecord?.updatedBy,
    afterRecord?.createdBy,
    event.createdBy,
  ];
};

export const getTimelineActivityAuthorFullName = (
  event: TimelineActivity,
  currentWorkspaceMember: CurrentWorkspaceMember,
) => {
  if (isDefined(event.workspaceMember)) {
    return currentWorkspaceMember.id === event.workspaceMember.id
      ? 'You'
      : `${event.workspaceMember?.name.firstName} ${event.workspaceMember?.name.lastName}`;
  }

  const actorName = getTimelineActivityActorCandidates(event)
    .map(getNonManualActorName)
    .find(isDefined);

  return actorName ?? 'Twenty';
};
