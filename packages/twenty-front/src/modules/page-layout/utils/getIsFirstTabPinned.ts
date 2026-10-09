import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { PageLayoutType } from '~/generated-metadata/graphql';

// Legacy record caches keep their column; standalone pages opt in to pinning.
export const getIsFirstTabPinned = (
  pageLayout: Partial<Pick<DraftPageLayout, 'isFirstTabPinned' | 'type'>>,
): boolean =>
  pageLayout.isFirstTabPinned ??
  pageLayout.type !== PageLayoutType.STANDALONE_PAGE;
