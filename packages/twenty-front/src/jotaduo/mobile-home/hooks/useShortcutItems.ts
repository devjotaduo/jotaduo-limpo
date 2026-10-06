import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { isNonEmptyString } from '@sniptt/guards';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent, IconLink, useIcons } from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';

import { useGetNavigationMenuItemLink } from '~/jotaduo/mobile-home/hooks/useGetNavigationMenuItemLink';

export type ShortcutItem = {
  id: string;
  label: string;
  Icon: IconComponent;
  color: ThemeColor;
  link: string;
  // A folder is removed together with what it holds, which upstream confirms
  // in a dialog the phone home does not have.
  isRemovable: boolean;
  position: number;
};

// Shortcuts are what the user pinned other than records: lists, pages,
// folders and links. Pinned records are listed under Favorites.
export const useShortcutItems = (): ShortcutItem[] => {
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { getNavigationMenuItemLink } = useGetNavigationMenuItemLink();
  const { getIcon } = useIcons();

  return navigationMenuItemsSorted
    .filter(
      (item) =>
        !isDefined(item.folderId) &&
        item.type !== NavigationMenuItemType.RECORD,
    )
    .flatMap((item) => {
      // A tile has no room to expand a folder, so it opens the folder's first
      // reachable item instead.
      const link = isNavigationMenuItemFolder(item)
        ? navigationMenuItemsSorted
            .filter((child) => child.folderId === item.id)
            .map(getNavigationMenuItemLink)
            .find(isNonEmptyString)
        : getNavigationMenuItemLink(item);

      if (!isNonEmptyString(link)) {
        return [];
      }

      const objectNameSingular = getNavigationMenuItemObjectNameSingular(
        item,
        objectMetadataItems,
        views,
      );
      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === objectNameSingular,
      );

      return [
        {
          id: item.id,
          label: getNavigationMenuItemLabel(item, objectMetadataItems, views),
          Icon:
            item.type === NavigationMenuItemType.LINK
              ? IconLink
              : getIcon(objectMetadataItem?.icon ?? item.icon),
          color: getNavigationMenuItemColor(item, objectMetadataItem),
          link,
          isRemovable: !isNavigationMenuItemFolder(item),
          position: item.position,
        },
      ];
    });
};
