import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type MobileHomeFilterContext } from '~/jotaduo/mobile-home/types/MobileHomeFilterContext';

// A status left empty is not "done": the comparison alone would drop it.
const OPEN_TASK_FILTER: RecordGqlOperationFilter = {
  or: [{ status: { neq: 'DONE' } }, { status: { is: 'NULL' } }],
};

// What "today" means for each kind of record the home shows. The field names
// and status values of the two JotaDuo objects are the app's own.
export const getTodayRecordFilters = ({
  currentWorkspaceMemberId,
  dayStart,
  dayEnd,
}: MobileHomeFilterContext) => {
  const isAssignedToPerson: RecordGqlOperationFilter = {
    assigneeId: { eq: currentWorkspaceMemberId },
  };

  const appointments: RecordGqlOperationFilter = {
    and: [
      { startsAt: { gte: dayStart } },
      { startsAt: { lte: dayEnd } },
      { status: { neq: 'CANCELLED' } },
    ],
  };

  const reminders: RecordGqlOperationFilter = {
    and: [
      { dispararEm: { gte: dayStart } },
      { dispararEm: { lte: dayEnd } },
      { status: { eq: 'PENDENTE' } },
    ],
  };

  // Done or not, so a task checked off stays in sight for the day.
  const tasks: RecordGqlOperationFilter = {
    and: [
      isAssignedToPerson,
      { dueAt: { gte: dayStart } },
      { dueAt: { lte: dayEnd } },
    ],
  };

  const overdueTasks: RecordGqlOperationFilter = {
    and: [isAssignedToPerson, { dueAt: { lt: dayStart } }, OPEN_TASK_FILTER],
  };

  const openTasks: RecordGqlOperationFilter = {
    and: [isAssignedToPerson, OPEN_TASK_FILTER],
  };

  return { appointments, reminders, tasks, overdueTasks, openTasks };
};
