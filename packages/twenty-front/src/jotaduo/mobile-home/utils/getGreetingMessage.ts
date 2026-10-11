import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';

const AFTERNOON_START_HOUR = 12;
const EVENING_START_HOUR = 18;
const MORNING_START_HOUR = 5;

// The small hours still read as the night before.
export const getGreetingMessage = (hour: number) => {
  if (hour >= MORNING_START_HOUR && hour < AFTERNOON_START_HOUR) {
    return JOTADUO_MESSAGES.greetingMorning;
  }

  if (hour >= AFTERNOON_START_HOUR && hour < EVENING_START_HOUR) {
    return JOTADUO_MESSAGES.greetingAfternoon;
  }

  return JOTADUO_MESSAGES.greetingEvening;
};
