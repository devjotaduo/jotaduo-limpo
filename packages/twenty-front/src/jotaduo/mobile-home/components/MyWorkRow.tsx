import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

import { MobileHomeIconTile } from '~/jotaduo/mobile-home/components/MobileHomeIconTile';
import { MobileHomeListRow } from '~/jotaduo/mobile-home/components/MobileHomeListRow';
import { type MyWorkItem } from '~/jotaduo/mobile-home/hooks/useMyWorkItems';

type MyWorkRowProps = {
  myWorkItem: MyWorkItem;
};

// One component per item because the count is a query bound to its object.
export const MyWorkRow = ({ myWorkItem }: MyWorkRowProps) => {
  const { data } = useAggregateRecords({
    objectNameSingular: myWorkItem.objectNameSingular,
    filter: myWorkItem.countFilter,
    recordGqlFieldsAggregate: { id: [AggregateOperations.COUNT] },
    skip: !myWorkItem.isCountAvailable,
  });

  const count = Number(data.id?.[AggregateOperations.COUNT] ?? 0);

  return (
    <MobileHomeListRow
      icon={
        <MobileHomeIconTile Icon={myWorkItem.Icon} color={myWorkItem.color} />
      }
      label={myWorkItem.label}
      // An empty list says nothing with a zero next to it.
      trailingText={count > 0 ? String(count) : undefined}
      to={myWorkItem.link}
    />
  );
};
