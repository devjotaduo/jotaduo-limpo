import { useNavigationMenuItemAddOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemAddOptions';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useState } from 'react';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { FavoriteItemAvatar } from '~/jotaduo/mobile-home/components/FavoriteItemAvatar';
import { MobileHomePinnedItemsEditor } from '~/jotaduo/mobile-home/components/MobileHomePinnedItemsEditor';
import { useFavoriteItems } from '~/jotaduo/mobile-home/hooks/useFavoriteItems';

// This screen has no steps to move between, unlike upstream's picker.
const ignoreStepNavigation = () => undefined;

type FavoritesEditorProps = {
  onClose: () => void;
};

export const FavoritesEditor = ({ onClose }: FavoritesEditorProps) => {
  const favoriteItems = useFavoriteItems();
  const [search, setSearch] = useState('');
  const { getText } = useJotaduoText();
  const { currentItems, createItem, updateItem, deleteItems } =
    useNavigationMenuItemEditController('favorite');

  const { getItems, recordSearchLoading, isSearchDebouncing } =
    useNavigationMenuItemAddOptions({
      step: 'record',
      search,
      objectId: null,
      currentItems,
      isSearchingAllItems: false,
      addItem: (input) => {
        createItem(input);
      },
      navigateToStep: ignoreStepNavigation,
      selectObject: ignoreStepNavigation,
    });

  return (
    <MobileHomePinnedItemsEditor
      title={getText(JOTADUO_MESSAGES.favorites)}
      pinnedItems={favoriteItems.map((favoriteItem) => ({
        id: favoriteItem.id,
        label: favoriteItem.label,
        caption: favoriteItem.secondaryLabel,
        icon: <FavoriteItemAvatar favoriteItem={favoriteItem} />,
        isRemovable: true,
        position: favoriteItem.position,
      }))}
      candidateGroups={[
        {
          label: getText(JOTADUO_MESSAGES.selectRecords),
          options: getItems().filter(
            (option) => option.isAlreadyInSidebar !== true,
          ),
        },
      ]}
      isLoadingCandidates={recordSearchLoading || isSearchDebouncing}
      search={search}
      onSearchChange={setSearch}
      onRemove={(id) => deleteItems([id])}
      onMove={(id, position) => updateItem(id, { position })}
      onClose={onClose}
    />
  );
};
