import { type MessageDescriptor } from '@lingui/core';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { type ThemeColor } from 'twenty-ui/theme';

import { JOTADUO_CONVERSATIONS_OBJECT_NAME_PLURAL } from '~/jotaduo/constants/JotaduoConversationsObjectNamePlural';
import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { type MobileHomeFilterContext } from '~/jotaduo/mobile-home/types/MobileHomeFilterContext';
import { getTodayRecordFilters } from '~/jotaduo/mobile-home/utils/getTodayRecordFilters';

export type MyWorkItemDefinition = {
  key: string;
  objectNamePlural: string;
  // Opened when the workspace has a view with this exact name, otherwise the
  // object index opens on its default view.
  viewName?: string;
  label?: MessageDescriptor;
  color: ThemeColor;
  // Which records the figure on the row counts: the ones still asking for
  // someone. Without it the row counts every record of the object.
  getCountFilter?: (
    filterContext: MobileHomeFilterContext,
  ) => RecordGqlOperationFilter;
};

export const MY_WORK_ITEM_DEFINITIONS: MyWorkItemDefinition[] = [
  {
    key: 'conversations',
    objectNamePlural: JOTADUO_CONVERSATIONS_OBJECT_NAME_PLURAL,
    color: 'blue',
    // In the queue or with the team, in the JotaDuo app's own status values.
    getCountFilter: () => ({ status: { in: ['QUEUE', 'HUMAN'] } }),
  },
  {
    key: 'dayAgenda',
    objectNamePlural: 'jdAgendamentos',
    viewName: 'Agenda do dia',
    label: JOTADUO_MESSAGES.dayAgenda,
    color: 'orange',
    getCountFilter: (filterContext) =>
      getTodayRecordFilters(filterContext).appointments,
  },
  {
    key: 'reminders',
    objectNamePlural: 'jdLembretes',
    color: 'amber',
    getCountFilter: () => ({ status: { eq: 'PENDENTE' } }),
  },
  {
    key: 'tasks',
    objectNamePlural: 'tasks',
    viewName: 'Assigned to Me',
    color: 'turquoise',
    getCountFilter: (filterContext) =>
      getTodayRecordFilters(filterContext).openTasks,
  },
  { key: 'opportunities', objectNamePlural: 'opportunities', color: 'red' },
];
