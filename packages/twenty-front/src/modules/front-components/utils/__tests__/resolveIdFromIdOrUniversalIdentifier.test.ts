import { resolveIdFromIdOrUniversalIdentifier } from '@/front-components/utils/resolveIdFromIdOrUniversalIdentifier';

const ITEMS = [
  { id: 'id-1', universalIdentifier: 'universal-identifier-1' },
  { id: 'id-2', universalIdentifier: 'id-1' },
  { id: 'id-3', universalIdentifier: null },
];

describe('resolveIdFromIdOrUniversalIdentifier', () => {
  it('should keep a value that is already an id', () => {
    expect(
      resolveIdFromIdOrUniversalIdentifier({
        idOrUniversalIdentifier: 'id-3',
        items: ITEMS,
      }),
    ).toBe('id-3');
  });

  it('should return the id of the item with a matching universalIdentifier', () => {
    expect(
      resolveIdFromIdOrUniversalIdentifier({
        idOrUniversalIdentifier: 'universal-identifier-1',
        items: ITEMS,
      }),
    ).toBe('id-1');
  });

  it('should prefer an id match over a universalIdentifier match', () => {
    expect(
      resolveIdFromIdOrUniversalIdentifier({
        idOrUniversalIdentifier: 'id-1',
        items: ITEMS,
      }),
    ).toBe('id-1');
  });

  it('should return the value unchanged when nothing matches', () => {
    expect(
      resolveIdFromIdOrUniversalIdentifier({
        idOrUniversalIdentifier: 'unknown',
        items: ITEMS,
      }),
    ).toBe('unknown');
    expect(
      resolveIdFromIdOrUniversalIdentifier({
        idOrUniversalIdentifier: 'unknown',
        items: [],
      }),
    ).toBe('unknown');
  });
});
