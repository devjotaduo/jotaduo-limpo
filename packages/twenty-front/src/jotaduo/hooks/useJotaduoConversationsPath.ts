import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { JOTADUO_CONVERSATIONS_OBJECT_NAME_PLURAL } from '~/jotaduo/constants/JotaduoConversationsObjectNamePlural';
import { JOTADUO_CONVERSATIONS_PAGE_NAME } from '~/jotaduo/constants/JotaduoConversationsPageName';

// Where "Conversas" leads: the inbox page the JotaDuo app adds to the
// workspace menu, told apart from any other page of that name by belonging
// to the app that owns the conversations object. A workspace that only has
// the object gets its record list, and one without the app gets nothing.
export const useJotaduoConversationsPath = (): string | undefined => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const { findActiveObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const conversationsObjectMetadataItem =
    findActiveObjectMetadataItemByNamePlural(
      JOTADUO_CONVERSATIONS_OBJECT_NAME_PLURAL,
    );

  if (!isDefined(conversationsObjectMetadataItem)) {
    return undefined;
  }

  const jotaduoApplicationId = conversationsObjectMetadataItem.applicationId;

  const conversationsPageLayoutId = isDefined(jotaduoApplicationId)
    ? workspaceNavigationMenuItems.find(
        (navigationMenuItem) =>
          navigationMenuItem.type === NavigationMenuItemType.PAGE_LAYOUT &&
          navigationMenuItem.name === JOTADUO_CONVERSATIONS_PAGE_NAME &&
          navigationMenuItem.applicationId === jotaduoApplicationId,
      )?.pageLayoutId
    : undefined;

  if (isDefined(conversationsPageLayoutId)) {
    return getAppPath(AppPath.PageLayoutPage, {
      pageLayoutId: conversationsPageLayoutId,
    });
  }

  return getAppPath(AppPath.RecordIndexPage, {
    objectNamePlural: JOTADUO_CONVERSATIONS_OBJECT_NAME_PLURAL,
  });
};
