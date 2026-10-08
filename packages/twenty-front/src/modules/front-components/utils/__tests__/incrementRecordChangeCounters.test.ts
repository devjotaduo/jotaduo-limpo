import { incrementRecordChangeCounters } from '@/front-components/utils/incrementRecordChangeCounters';

describe('incrementRecordChangeCounters', () => {
  it('should add one to each watched object', () => {
    expect(
      incrementRecordChangeCounters({
        recordChangeCounters: { message: 2, conversation: 0, person: 5 },
        objectNameSingulars: ['message', 'conversation'],
      }),
    ).toEqual({ message: 3, conversation: 1, person: 5 });
  });

  it('should ignore objects that are not watched', () => {
    expect(
      incrementRecordChangeCounters({
        recordChangeCounters: { message: 2 },
        objectNameSingulars: ['message', 'company', 'constructor'],
      }),
    ).toEqual({ message: 3 });
  });

  it('should return the same object when no watched object changed', () => {
    const recordChangeCounters = { message: 2 };

    expect(
      incrementRecordChangeCounters({
        recordChangeCounters,
        objectNameSingulars: ['company'],
      }),
    ).toBe(recordChangeCounters);
  });
});
