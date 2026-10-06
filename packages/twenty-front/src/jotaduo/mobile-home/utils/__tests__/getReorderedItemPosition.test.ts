import { getReorderedItemPosition } from '~/jotaduo/mobile-home/utils/getReorderedItemPosition';

describe('getReorderedItemPosition', () => {
  it('places an item moved down between its new neighbours', () => {
    expect(
      getReorderedItemPosition({
        positions: [1, 2, 3, 4],
        fromIndex: 0,
        toIndex: 2,
      }),
    ).toBe(3.5);
  });

  it('places an item moved up between its new neighbours', () => {
    expect(
      getReorderedItemPosition({
        positions: [1, 2, 3, 4],
        fromIndex: 3,
        toIndex: 1,
      }),
    ).toBe(1.5);
  });

  it('places an item moved to the top before the first one', () => {
    expect(
      getReorderedItemPosition({
        positions: [5, 8, 9],
        fromIndex: 2,
        toIndex: 0,
      }),
    ).toBe(4);
  });

  it('places an item moved to the bottom after the last one', () => {
    expect(
      getReorderedItemPosition({
        positions: [5, 8, 9],
        fromIndex: 0,
        toIndex: 2,
      }),
    ).toBe(10);
  });

  it('keeps the position of a single item', () => {
    expect(
      getReorderedItemPosition({ positions: [7], fromIndex: 0, toIndex: 0 }),
    ).toBe(7);
  });
});
