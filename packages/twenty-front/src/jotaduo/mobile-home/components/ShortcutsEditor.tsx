import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useNavigationMenuItemAddOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemAddOptions';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useState } from 'react';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MobileHomeIconTile } from '~/jotaduo/mobile-home/components/MobileHomeIconTile';
import { MobileHomePinnedItemsEditor } from '~/jotaduo/mobile-home/components/MobileHomePinnedItemsEditor';
import { useShortcutItems } from '~/jotaduo/mobile-home/hooks/useShortcutItems';

// This screen has no steps to move between, unlike upstream's picker.
const ignoreStepNavigation = () => undefined;

type ShortcutsEditorProps = {
  onClose: () => void;
};

// Lists, views and pages can be pinned from the phone. Links and folders need
// a form of their own and stay in the desktop sidebar's editor.
export const ShortcutsEditor = ({ onClose }: ShortcutsEditorProps) => {
  const shortcutItems = useShortcutItems();
  const [search, setSearch] = useState('');
  const { getText } = useJotaduoText();
  const { currentItems, createItem, updateItem, deleteItems } =
    useNavigationMenuItemEditController('favorite');

  // isSearchingAllItems is what makes upstream return every view in one flat
  // list. The search text stays empty there because it only drives the
  // record search, which this screen does not show.
  const { getItems, standalonePagesLoading } = useNavigationMenuItemAddOptions({
    step: 'main',
    search: '',
    objectId: null,
    currentItems,
    isSearchingAllItems: true,
    addItem: (input) => {
      createItem(input);
    },
    navigateToStep: ignoreStepNavigation,
    selectObject: ignoreStepNavigation,
  });

  const normalizedSearch = normalizeSearchText(search.trim());

  const getAvailableOptions = (options: NavigationMenuItemOption[]) =>
    options.filter(
      (option) =>
        option.isAlreadyInSidebar !== true &&
        (option.searchableValues ?? [option.label]).some((value) =>
          normalizeSearchText(value).includes(normalizedSearch),
        ),
    );

  return (
    <MobileHomePinnedItemsEditor
      title={getText(JOTADUO_MESSAGES.shortcuts)}
      pinnedItems={shortcutItems.map((shortcutItem) => ({
        id: shortcutItem.id,
        label: shortcutItem.label,
        icon: (
          <MobileHomeIconTile
            Icon={shortcutItem.Icon}
            color={shortcutItem.color}
            shape="circle"
            sizeInPx={30}
            iconSizeInPx={16}
          />
        ),
        isRemovable: shortcutItem.isRemovable,
        position: shortcutItem.position,
      }))}
      candidateGroups={[
        {
          label: getText(JOTADUO_MESSAGES.suggestedLists),
          options: getAvailableOptions(getItems('object')),
        },
        {
          label: getText(JOTADUO_MESSAGES.suggestedViews),
          options: getAvailableOptions(getItems('view')),
        },
        {
          label: getText(JOTADUO_MESSAGES.suggestedPages),
          options: getAvailableOptions(getItems('page')),
        },
      ]}
      isLoadingCandidates={standalonePagesLoading}
      search={search}
      onSearchChange={setSearch}
      onRemove={(id) => deleteItems([id])}
      onMove={(id, position) => updateItem(id, { position })}
      onClose={onClose}
    />
  );
};
