import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { JOTADUO_APPOINTMENT_OBJECT_NAME_SINGULAR } from '~/jotaduo/constants/JotaduoAppointmentObjectNameSingular';
import { JOTADUO_REMINDER_OBJECT_NAME_SINGULAR } from '~/jotaduo/constants/JotaduoReminderObjectNameSingular';
import { type TodayItem } from '~/jotaduo/mobile-home/types/TodayItem';

type GetTodayItemsParams = {
  appointments: ObjectRecord[];
  reminders: ObjectRecord[];
  tasks: ObjectRecord[];
};

const getTextValue = (record: ObjectRecord, fieldName: string) => {
  const value: unknown = record[fieldName];

  return isString(value) ? value.trim() : '';
};

const getDateValue = (record: ObjectRecord, fieldName: string) => {
  const value: unknown = record[fieldName];

  return isNonEmptyString(value) ? value : undefined;
};

const getRecordLink = (objectNameSingular: string, recordId: string) =>
  getAppPath(AppPath.RecordShowPage, {
    objectNameSingular,
    objectRecordId: recordId,
  });

const compareByTime = (first: TodayItem, second: TodayItem) =>
  (first.at ?? '').localeCompare(second.at ?? '');

// The day as one list: what has a time first, in order, then the tasks.
export const getTodayItems = ({
  appointments,
  reminders,
  tasks,
}: GetTodayItemsParams): TodayItem[] => {
  const appointmentItems = appointments.map<TodayItem>((appointment) => {
    const name = getTextValue(appointment, 'name');
    const service = getTextValue(appointment, 'service');

    return {
      id: appointment.id,
      objectNameSingular: JOTADUO_APPOINTMENT_OBJECT_NAME_SINGULAR,
      kind: 'appointment',
      title: name === '' ? service : name,
      detail: name === '' || service === name ? undefined : service,
      at: getDateValue(appointment, 'startsAt'),
      link: getRecordLink(
        JOTADUO_APPOINTMENT_OBJECT_NAME_SINGULAR,
        appointment.id,
      ),
      isDone: false,
    };
  });

  const reminderItems = reminders.map<TodayItem>((reminder) => {
    const name = getTextValue(reminder, 'name');

    return {
      id: reminder.id,
      objectNameSingular: JOTADUO_REMINDER_OBJECT_NAME_SINGULAR,
      kind: 'reminder',
      title: name === '' ? getTextValue(reminder, 'texto') : name,
      detail: getTextValue(reminder, 'pessoaNome'),
      at: getDateValue(reminder, 'dispararEm'),
      link: getRecordLink(JOTADUO_REMINDER_OBJECT_NAME_SINGULAR, reminder.id),
      isDone: false,
    };
  });

  const taskItems = tasks.map<TodayItem>((task) => ({
    id: task.id,
    objectNameSingular: CoreObjectNameSingular.Task,
    kind: 'task',
    title: getTextValue(task, 'title'),
    at: getDateValue(task, 'dueAt'),
    link: getRecordLink(CoreObjectNameSingular.Task, task.id),
    isDone: task.status === 'DONE',
  }));

  return [
    ...[...appointmentItems, ...reminderItems].sort(compareByTime),
    ...taskItems.sort(compareByTime),
  ];
};
