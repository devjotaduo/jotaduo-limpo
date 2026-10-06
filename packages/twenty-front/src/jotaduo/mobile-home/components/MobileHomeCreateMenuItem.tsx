import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateNewRecord } from '@/object-record/hooks/useCreateNewRecord';
import { capitalize } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

type MobileHomeCreateMenuItemProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  onCreate: () => void;
};

// One component per object because the creation hook is bound to its object.
export const MobileHomeCreateMenuItem = ({
  objectMetadataItem,
  onCreate,
}: MobileHomeCreateMenuItemProps) => {
  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem.icon);
  const { createNewRecord } = useCreateNewRecord({ objectMetadataItem });

  const handleClick = () => {
    onCreate();
    void createNewRecord({ position: 'first' });
  };

  return (
    <ListItem startIcon={<ObjectIcon size={16} />} onClick={handleClick}>
      {capitalize(objectMetadataItem.labelSingular)}
    </ListItem>
  );
};
