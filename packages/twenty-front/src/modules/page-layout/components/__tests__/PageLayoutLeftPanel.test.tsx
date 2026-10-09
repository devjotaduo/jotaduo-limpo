import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

let mockTargetRecordIdentifier = {
  id: 'record-id',
  targetObjectNameSingular: 'company',
};
let mockIsInSidePanel = false;
let mockPageLayoutType: PageLayoutType = PageLayoutType.RECORD_PAGE;

jest.mock('@/page-layout/components/PageLayoutContent', () => ({
  PageLayoutContent: () => <div>Page layout content</div>,
}));

jest.mock('@/page-layout/hooks/useCurrentPageLayout', () => ({
  useCurrentPageLayout: () => ({
    currentPageLayout: {
      type: mockPageLayoutType,
    },
  }),
}));

jest.mock(
  '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow',
  () => ({
    usePageLayoutTabWithVisibleWidgetsOrThrow: () => ({
      id: 'pinned-tab-id',
    }),
  }),
);

jest.mock('@/page-layout/utils/getTabLayoutMode', () => ({
  getTabLayoutMode: () => 'VERTICAL_LIST',
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    layoutType: mockPageLayoutType,
    targetRecordIdentifier:
      mockPageLayoutType === PageLayoutType.STANDALONE_PAGE
        ? undefined
        : mockTargetRecordIdentifier,
  }),
}));

jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({
    type: mockIsInSidePanel ? 'side-panel' : 'main',
    instanceId: mockIsInSidePanel ? 'side-panel' : 'main',
  }),
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({
    children,
    componentInstanceId,
  }: {
    children: ReactNode;
    componentInstanceId: string;
  }) => (
    <div
      id={`scroll-wrapper-${componentInstanceId}`}
      data-testid="pinned-scroll-wrapper"
    >
      {children}
    </div>
  ),
}));

describe('PageLayoutLeftPanel', () => {
  beforeEach(() => {
    mockTargetRecordIdentifier = {
      id: 'record-id',
      targetObjectNameSingular: 'company',
    };
    mockIsInSidePanel = false;
    mockPageLayoutType = PageLayoutType.RECORD_PAGE;
  });

  it('renders a standalone pinned tab without a target record', () => {
    mockPageLayoutType = PageLayoutType.STANDALONE_PAGE;

    render(
      <PageLayoutLeftPanel
        pageLayoutId="standalone-layout"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );

    expect(screen.getByText('Page layout content')).toBeVisible();
    expect(screen.getByTestId('pinned-scroll-wrapper').id).not.toContain(
      'record-id',
    );
  });

  it('does not render a pinned column on a dashboard', () => {
    mockPageLayoutType = PageLayoutType.DASHBOARD;

    render(
      <PageLayoutLeftPanel
        pageLayoutId="dashboard-layout"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );

    expect(screen.queryByText('Page layout content')).not.toBeInTheDocument();
  });

  it('resets the pinned scroll position when the target record changes', () => {
    const { rerender } = render(
      <PageLayoutLeftPanel
        pageLayoutId="page-layout-id"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );

    const scrollWrapper = screen.getByTestId('pinned-scroll-wrapper');
    scrollWrapper.scrollTop = 200;

    mockTargetRecordIdentifier = {
      ...mockTargetRecordIdentifier,
      id: 'another-record-id',
    };

    rerender(
      <PageLayoutLeftPanel
        pageLayoutId="page-layout-id"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );

    expect(scrollWrapper.scrollTop).toBe(0);
  });

  it('resets the pinned scroll wrapper owned by the current rendering context', () => {
    render(
      <PageLayoutLeftPanel
        pageLayoutId="page-layout-id"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );

    const mainViewScrollWrapper = screen.getByTestId('pinned-scroll-wrapper');
    mainViewScrollWrapper.scrollTop = 200;

    mockTargetRecordIdentifier = {
      ...mockTargetRecordIdentifier,
      id: 'side-panel-record-id',
    };
    mockIsInSidePanel = true;

    const { rerender } = render(
      <PageLayoutLeftPanel
        pageLayoutId="page-layout-id"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );
    const sidePanelScrollWrapper = screen.getAllByTestId(
      'pinned-scroll-wrapper',
    )[1];

    expect(sidePanelScrollWrapper.id).not.toBe(mainViewScrollWrapper.id);

    sidePanelScrollWrapper.scrollTop = 200;
    mockTargetRecordIdentifier = {
      ...mockTargetRecordIdentifier,
      id: 'another-side-panel-record-id',
    };

    rerender(
      <PageLayoutLeftPanel
        pageLayoutId="page-layout-id"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );

    expect(mainViewScrollWrapper.scrollTop).toBe(200);
    expect(sidePanelScrollWrapper.scrollTop).toBe(0);
  });
});
