import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { type JSX } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type MobileHomeReorder = {
  id: string;
  fromIndex: number;
  toIndex: number;
};

type MobileHomeReorderableRowsProps = {
  rows: { id: string; row: JSX.Element }[];
  onReorder: (reorder: MobileHomeReorder) => void;
};

export const MobileHomeReorderableRows = ({
  rows,
  onReorder,
}: MobileHomeReorderableRowsProps) => {
  const handleDragEnd = ({
    draggableId,
    source,
    destination,
  }: DraggableListDropResult) => {
    if (!isDefined(destination) || destination.index === source.index) {
      return;
    }

    onReorder({
      id: draggableId,
      fromIndex: source.index,
      toIndex: destination.index,
    });
  };

  return (
    <DraggableList
      onDragEnd={handleDragEnd}
      draggableItems={
        <>
          {rows.map(({ id, row }, index) => (
            <DraggableItem
              key={id}
              draggableId={id}
              index={index}
              itemComponent={row}
            />
          ))}
        </>
      }
    />
  );
};
