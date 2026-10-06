import { isDefined } from 'twenty-shared/utils';
import { toSpliced } from '~/utils/array/toSpliced';

type GetReorderedItemPositionParams = {
  // Positions of the list as displayed, moved item included.
  positions: number[];
  fromIndex: number;
  toIndex: number;
};

// Only the moved item is rewritten: it takes a position between its new
// neighbours, the way upstream inserts a navigation menu item.
export const getReorderedItemPosition = ({
  positions,
  fromIndex,
  toIndex,
}: GetReorderedItemPositionParams): number => {
  const otherPositions = toSpliced(positions, fromIndex, 1);
  const previousPosition = otherPositions[toIndex - 1];
  const nextPosition = otherPositions[toIndex];

  if (isDefined(previousPosition) && isDefined(nextPosition)) {
    return (previousPosition + nextPosition) / 2;
  }

  if (isDefined(previousPosition)) {
    return previousPosition + 1;
  }

  if (isDefined(nextPosition)) {
    return nextPosition - 1;
  }

  return positions[fromIndex];
};
