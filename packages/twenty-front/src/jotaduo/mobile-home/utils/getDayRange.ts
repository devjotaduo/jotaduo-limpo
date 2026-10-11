import { endOfDay, startOfDay } from 'date-fns';

// The day the person is in, on their own clock, as the instants the server
// filters by.
export const getDayRange = (now: Date) => ({
  dayStart: startOfDay(now).toISOString(),
  dayEnd: endOfDay(now).toISOString(),
});
