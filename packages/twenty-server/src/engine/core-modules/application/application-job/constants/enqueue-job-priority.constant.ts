// Matches the logic-function queue default used by database-event and cron
// triggers: BullMQ runs lower values first, so a higher value would make
// app-enqueued jobs wait behind every trigger of every workspace
export const ENQUEUE_JOB_PRIORITY = 4;
