import { useQuery } from '@apollo/client/react';
import {
  type NavigationMenuItem,
  type PageLayout,
} from '~/generated-metadata/graphql';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { getMetadataStoreResyncAction } from '@/metadata-store/utils/getMetadataStoreResyncAction';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemReadable } from '@/navigation-menu-item/common/utils/isNavigationMenuItemReadable';
import { FIND_MANY_STANDALONE_PAGE_LAYOUT_OBJECT_METADATA_IDS } from '@/navigation-menu-item/display/page-layout/graphql/queries/findManyStandalonePageLayoutObjectMetadataIds';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useDebouncedCallback } from 'use-debounce';

const STANDALONE_PAGE_LAYOUT_REFETCH_DELAY_IN_MS = 2_000;
const STANDALONE_PAGE_LAYOUT_REFETCH_MAX_WAIT_IN_MS = 15_000;

type UseReadableNavigationMenuItemsArgs = {
  topLevelItems: NavigationMenuItem[];
  folderChildrenById: Map<string, NavigationMenuItem[]>;
};

type StandalonePageLayoutObjectMetadataIdsQuery = {
  getPageLayouts: Pick<PageLayout, 'id' | 'objectMetadataId'>[];
};

export const useReadableNavigationMenuItems = ({
  topLevelItems,
  folderChildrenById,
}: UseReadableNavigationMenuItemsArgs) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const hasPageLayoutItems = [
    ...topLevelItems,
    ...Array.from(folderChildrenById.values()).flat(),
  ].some((item) => item.type === NavigationMenuItemType.PAGE_LAYOUT);

  // Standalone pages are not in the metadata store, so the object of each
  // page comes from this query
  const { data: standalonePageLayoutsData, refetch } =
    useQuery<StandalonePageLayoutObjectMetadataIdsQuery>(
      FIND_MANY_STANDALONE_PAGE_LAYOUT_OBJECT_METADATA_IDS,
      { skip: !hasPageLayoutItems, fetchPolicy: 'cache-and-network' },
    );
  const standalonePageLayouts = standalonePageLayoutsData?.getPageLayouts ?? [];

  // The metadata store reloads record layouts only, so standalone layouts need their own refresh.
  const debouncedRefetch = useDebouncedCallback(
    () => refetch().catch(() => undefined),
    STANDALONE_PAGE_LAYOUT_REFETCH_DELAY_IN_MS,
    { maxWait: STANDALONE_PAGE_LAYOUT_REFETCH_MAX_WAIT_IN_MS },
  );

  useListenToMetadataOperationBrowserEvent({
    skip: !hasPageLayoutItems,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      if (
        eventDetail.metadataName === 'pageLayout' ||
        eventDetail.metadataName === 'navigationMenuItem' ||
        getMetadataStoreResyncAction(eventDetail) === 'full-resync'
      ) {
        debouncedRefetch();
      }
    },
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: () => {
      if (hasPageLayoutItems) {
        debouncedRefetch();
      }
    },
  });

  const isItemReadable = (item: NavigationMenuItem) =>
    isNavigationMenuItemReadable({
      item,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
      standalonePageLayouts,
    });

  const filteredFolderChildrenById = new Map<string, NavigationMenuItem[]>();
  for (const [folderId, children] of folderChildrenById) {
    filteredFolderChildrenById.set(folderId, children.filter(isItemReadable));
  }

  const filteredTopLevelItems = topLevelItems.filter((item) =>
    isNavigationMenuItemFolder(item)
      ? isDefined(item.userWorkspaceId) ||
        (filteredFolderChildrenById.get(item.id) ?? []).length > 0
      : isItemReadable(item),
  );

  const displayTopLevelItems = isLayoutCustomizationModeEnabled
    ? topLevelItems
    : filteredTopLevelItems;
  const displayFolderChildrenById = isLayoutCustomizationModeEnabled
    ? folderChildrenById
    : filteredFolderChildrenById;

  return {
    isItemReadable,
    filteredTopLevelItems,
    filteredFolderChildrenById,
    displayTopLevelItems,
    displayFolderChildrenById,
  };
};
