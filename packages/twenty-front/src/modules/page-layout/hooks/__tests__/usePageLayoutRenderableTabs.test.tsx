import { usePageLayoutRenderableTabs } from '@/page-layout/hooks/usePageLayoutRenderableTabs';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { renderHook } from '@testing-library/react';
import { PageLayoutType } from '~/generated-metadata/graphql';

let mockIsMobile = false;
let mockWorkspaceSurfaceType: 'main' | 'side-panel' = 'main';
let mockPageLayoutType: PageLayoutType = PageLayoutType.RECORD_PAGE;
let mockIsFirstTabPinned = false;

const homeTab: PageLayoutTab = {
  isSystemSideEffect: false,
  universalIdentifier: 'universal-identifier-mock',
  id: 'home-tab-id',
  applicationId: 'application-id',
  isActive: true,
  pageLayoutId: 'page-layout-id',
  title: 'Home',
  position: 0,
  widgets: [],
  createdAt: '2026-08-07T00:00:00.000Z',
  updatedAt: '2026-08-07T00:00:00.000Z',
};

let mockTabs = [homeTab];

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock('@/page-layout/hooks/useCurrentPageLayoutOrThrow', () => ({
  useCurrentPageLayoutOrThrow: () => ({
    currentPageLayout: {
      id: 'page-layout-id',
      type: mockPageLayoutType,
      isFirstTabPinned: mockIsFirstTabPinned,
      tabs: mockTabs,
    },
  }),
}));

jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: () => false,
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    targetRecordIdentifier: undefined,
  }),
}));

jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({ type: mockWorkspaceSurfaceType }),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => mockIsMobile,
}));

describe('usePageLayoutRenderableTabs', () => {
  it.each([true, false])(
    'keeps empty standalone tabs with pinned=%s',
    (isFirstTabPinned) => {
      mockPageLayoutType = PageLayoutType.STANDALONE_PAGE;
      mockIsFirstTabPinned = isFirstTabPinned;
      const activityTab = {
        ...homeTab,
        id: 'activity-tab-id',
        title: 'Activity',
        position: 1,
      };
      mockTabs = [homeTab, activityTab];

      const { result } = renderHook(() => usePageLayoutRenderableTabs());

      expect(result.current.pinnedLeftTab?.id).toBe(
        isFirstTabPinned ? homeTab.id : undefined,
      );
      expect(result.current.tabsToRenderInTabList.map((tab) => tab.id)).toEqual(
        isFirstTabPinned ? [activityTab.id] : [homeTab.id, activityTab.id],
      );
    },
  );

  beforeEach(() => {
    mockIsMobile = false;
    mockWorkspaceSurfaceType = 'main';
    mockPageLayoutType = PageLayoutType.RECORD_PAGE;
    mockIsFirstTabPinned = false;
    mockTabs = [homeTab];
  });

  it.each([
    { context: 'full record page', isMobile: false, surfaceType: 'main' },
    { context: 'mobile record page', isMobile: true, surfaceType: 'main' },
    {
      context: 'record side panel',
      isMobile: false,
      surfaceType: 'side-panel',
    },
  ] as const)(
    'uses the page layout tabs on the $context',
    ({ isMobile, surfaceType }) => {
      mockIsMobile = isMobile;
      mockWorkspaceSurfaceType = surfaceType;

      const { result } = renderHook(() => usePageLayoutRenderableTabs());

      expect(result.current.tabsToRenderInTabList).toEqual([homeTab]);
    },
  );
});
