import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { getGreetingMessage } from '~/jotaduo/mobile-home/utils/getGreetingMessage';

describe('getGreetingMessage', () => {
  it('greets by the part of the day', () => {
    expect(getGreetingMessage(5)).toBe(JOTADUO_MESSAGES.greetingMorning);
    expect(getGreetingMessage(11)).toBe(JOTADUO_MESSAGES.greetingMorning);
    expect(getGreetingMessage(12)).toBe(JOTADUO_MESSAGES.greetingAfternoon);
    expect(getGreetingMessage(17)).toBe(JOTADUO_MESSAGES.greetingAfternoon);
    expect(getGreetingMessage(18)).toBe(JOTADUO_MESSAGES.greetingEvening);
  });

  it('treats the small hours as night', () => {
    expect(getGreetingMessage(0)).toBe(JOTADUO_MESSAGES.greetingEvening);
    expect(getGreetingMessage(4)).toBe(JOTADUO_MESSAGES.greetingEvening);
  });
});
