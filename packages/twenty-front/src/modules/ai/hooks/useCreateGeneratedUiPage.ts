import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { type GeneratedUiPageDraft } from 'twenty-shared/types';
import {
  NavigationMenuItemType,
  PageLayoutType,
  PageLayoutTabLayoutMode,
  FindAllStandalonePageLayoutsDocument,
  type CreatePageLayoutInput,
  WidgetType,
} from '~/generated-metadata/graphql';

import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { CREATE_STANDALONE_PAGE_LAYOUT } from '@/page-layout/graphql/mutations/createStandalonePageLayout';
import { DESTROY_PAGE_LAYOUT } from '@/page-layout/graphql/mutations/destroyPageLayout';
import { useUpdatePageLayoutWithTabsAndWidgets } from '@/page-layout/hooks/useUpdatePageLayoutWithTabsAndWidgets';
import { type UpdatePageLayoutWithTabsInput } from '~/generated-metadata/graphql';

export const useCreateGeneratedUiPage = () => {
  const [createStandalonePageLayout] = useMutation<
    { createPageLayout: { id: string } },
    { input: CreatePageLayoutInput }
  >(CREATE_STANDALONE_PAGE_LAYOUT);
  const [destroyPageLayout] = useMutation<
    { destroyPageLayout: boolean },
    { id: string }
  >(DESTROY_PAGE_LAYOUT);
  const { updatePageLayoutWithTabsAndWidgets } =
    useUpdatePageLayoutWithTabsAndWidgets();
  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();

  const createGeneratedUiPage = useCallback(
    async (draft: GeneratedUiPageDraft) => {
      const createdLayout = await createStandalonePageLayout({
        variables: {
          input: {
            name: draft.title,
            type: PageLayoutType.STANDALONE_PAGE,
          },
        },
        refetchQueries: [FindAllStandalonePageLayoutsDocument],
        awaitRefetchQueries: true,
      });
      const pageLayoutId = createdLayout.data?.createPageLayout.id;

      if (!pageLayoutId) {
        throw new Error('The page layout could not be created.');
      }

      try {
        const input: UpdatePageLayoutWithTabsInput = {
          name: draft.title,
          type: PageLayoutType.STANDALONE_PAGE,
          isFirstTabPinned: false,
          tabs: draft.tabs.map((tab, tabIndex) => {
            const tabId = uuidv4();

            return {
              id: tabId,
              title: tab.title,
              position: tabIndex,
              icon: null,
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
              widgets: [
                {
                  id: uuidv4(),
                  pageLayoutTabId: tabId,
                  title: tab.title,
                  type: WidgetType.FRONT_COMPONENT,
                  objectMetadataId: null,
                  position: {
                    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                    index: 0,
                  },
                  configuration: {
                    configurationType: 'AI_GENERATED_UI',
                    schemaVersion: 1,
                    blocks: tab.blocks,
                  },
                },
              ],
            };
          }),
        };
        const updateResult = await updatePageLayoutWithTabsAndWidgets(
          pageLayoutId,
          input,
        );

        if (updateResult.status !== 'successful') {
          throw new Error('The page content could not be saved.');
        }

        await createManyNavigationMenuItems([
          {
            type: NavigationMenuItemType.PAGE_LAYOUT,
            name: draft.title,
            pageLayoutId,
          },
        ]);

        return pageLayoutId;
      } catch (error) {
        await destroyPageLayout({ variables: { id: pageLayoutId } }).catch(
          () => undefined,
        );
        throw error;
      }
    },
    [
      createManyNavigationMenuItems,
      createStandalonePageLayout,
      destroyPageLayout,
      updatePageLayoutWithTabsAndWidgets,
    ],
  );

  return { createGeneratedUiPage };
};
