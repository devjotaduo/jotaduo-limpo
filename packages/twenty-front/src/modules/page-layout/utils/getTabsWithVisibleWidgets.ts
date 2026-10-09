import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';

type GetTabsWithVisibleWidgetsParams = {
  tabs: PageLayoutTab[];
  isEditMode: boolean;
  context: WidgetVisibilityContext;
  includeEmptyTabs?: boolean;
};

export const getTabsWithVisibleWidgets = ({
  tabs,
  isEditMode,
  context,
  includeEmptyTabs = false,
}: GetTabsWithVisibleWidgetsParams): PageLayoutTab[] => {
  const activeTabs = tabs.filter((tab) => tab.isActive);

  if (isEditMode) {
    return activeTabs;
  }

  const tabsWithFilteredWidgets = activeTabs.map((tab) => ({
    ...tab,
    widgets: filterVisibleWidgets({ widgets: tab.widgets, context }),
  }));

  const emptyTabIds = new Set(
    activeTabs.filter((tab) => tab.widgets.length === 0).map((tab) => tab.id),
  );

  const tabsWithVisibleWidgets = tabsWithFilteredWidgets.filter(
    (tab) =>
      tab.widgets.length > 0 || (includeEmptyTabs && emptyTabIds.has(tab.id)),
  );

  if (tabsWithVisibleWidgets.length === 0 && activeTabs.length > 0) {
    return tabsWithFilteredWidgets.slice(0, 1);
  }

  return tabsWithVisibleWidgets;
};
