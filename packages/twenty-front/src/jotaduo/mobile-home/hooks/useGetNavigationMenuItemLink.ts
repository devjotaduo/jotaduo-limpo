import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

export const useGetNavigationMenuItemLink = () => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const lastVisitedViewPerObjectMetadataItem = useAtomStateValue(
    lastVisitedViewPerObjectMetadataItemState,
  );
  const isInitialObjectViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_INITIAL_OBJECT_VIEW_ENABLED,
  );

  const getNavigationMenuItemLink = (item: NavigationMenuItem) =>
    getNavigationMenuItemComputedLink({
      item,
      objectMetadataItems,
      views,
      lastVisitedViewPerObjectMetadataItem,
      isInitialObjectViewEnabled,
    });

  return { getNavigationMenuItemLink };
};
