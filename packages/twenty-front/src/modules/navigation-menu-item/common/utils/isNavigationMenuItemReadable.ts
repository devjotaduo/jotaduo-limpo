import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type NavigationMenuItem,
  type PageLayout,
} from '~/generated-metadata/graphql';

import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

type IsNavigationMenuItemReadableArgs = {
  item: NavigationMenuItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: ViewWithRelations[];
  objectPermissionsByObjectMetadataId: Parameters<
    typeof getObjectPermissionsForObject
  >[0];
  standalonePageLayouts: Pick<PageLayout, 'id' | 'objectMetadataId'>[];
};

export const isNavigationMenuItemReadable = ({
  item,
  objectMetadataItems,
  views,
  objectPermissionsByObjectMetadataId,
  standalonePageLayouts,
}: IsNavigationMenuItemReadableArgs): boolean => {
  const itemType = item.type;

  if (
    itemType === NavigationMenuItemType.FOLDER ||
    itemType === NavigationMenuItemType.LINK
  ) {
    return true;
  }

  if (itemType === NavigationMenuItemType.PAGE_LAYOUT) {
    const pageLayoutObjectMetadataId = standalonePageLayouts.find(
      (pageLayout) => pageLayout.id === item.pageLayoutId,
    )?.objectMetadataId;

    // Hiding is cosmetic: the page still opens by URL and its widgets check
    // permissions, so a page without an object or not loaded yet stays visible
    return (
      !isDefined(pageLayoutObjectMetadataId) ||
      getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        pageLayoutObjectMetadataId,
      ).canReadObjectRecords
    );
  }

  if (
    itemType === NavigationMenuItemType.OBJECT ||
    itemType === NavigationMenuItemType.VIEW ||
    itemType === NavigationMenuItemType.RECORD
  ) {
    const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
      item,
      objectMetadataItems,
      views,
    );

    return (
      isDefined(objectMetadataItem) &&
      getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        objectMetadataItem.id,
      ).canReadObjectRecords
    );
  }

  return false;
};
