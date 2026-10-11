export type TodayItem = {
  id: string;
  objectNameSingular: string;
  kind: 'appointment' | 'reminder' | 'task';
  title: string;
  // The service of an appointment, the person of a reminder.
  detail?: string;
  // When it happens. For a task, when it is due.
  at?: string;
  link: string;
  isDone: boolean;
};
