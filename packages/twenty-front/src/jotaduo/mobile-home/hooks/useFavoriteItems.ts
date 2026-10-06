import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/common/utils/recordIdentifierToObjectRecordIdentifier';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { isNonEmptyString } from '@sniptt/guards';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type AvatarShape } from 'twenty-ui/primitives/data-display';

import { useGetNavigationMenuItemLink } from '~/jotaduo/mobile-home/hooks/useGetNavigationMenuItemLink';

export type FavoriteItem = {
  id: string;
  label: string;
  secondaryLabel?: string;
  link: string;
  avatarUrl?: string;
  avatarShape: AvatarShape;
  avatarColorSeed: string;
  position: number;
};

// On the phone, Favorites are the records the user pinned. Everything else
// they pinned (lists, pages, folders, links) shows up under Shortcuts.
export const useFavoriteItems = (): FavoriteItem[] => {
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { getNavigationMenuItemLink } = useGetNavigationMenuItemLink();

  return navigationMenuItemsSorted
    .filter((item) => item.type === NavigationMenuItemType.RECORD)
    .flatMap((item) => {
      const link = getNavigationMenuItemLink(item);
      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === item.targetObjectMetadataId,
      );

      if (!isNonEmptyString(link) || !isDefined(objectMetadataItem)) {
        return [];
      }

      const recordIdentifier = isDefined(item.targetRecordIdentifier)
        ? recordIdentifierToObjectRecordIdentifier({
            recordIdentifier: item.targetRecordIdentifier,
            objectMetadataItem,
          })
        : undefined;

      return [
        {
          id: item.id,
          label: getNavigationMenuItemLabel(item, objectMetadataItems, views),
          secondaryLabel: objectMetadataItem.labelSingular,
          link,
          avatarUrl: recordIdentifier?.avatarUrl,
          avatarShape: recordIdentifier?.avatarShape ?? 'circle',
          avatarColorSeed: item.targetRecordId ?? item.id,
          position: item.position,
        },
      ];
    });
};
