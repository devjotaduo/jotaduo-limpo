import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useNavigationMenuItemAddOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemAddOptions';
import {
  type NewNavigationMenuItemInput,
  useNavigationMenuItemEditController,
} from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useState } from 'react';
import { IconX } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';

const ignoreStepNavigation = () => undefined;

type MobileHomeFavoriteRecordPickerProps = {
  dropdownId: string;
  onClose: () => void;
};

// Upstream's picker starts on a list of item types, and anything but a record
// lands in Atalhos. Favoritos only holds records, so this one goes straight
// to the record search, on the same hooks.
export const MobileHomeFavoriteRecordPicker = ({
  dropdownId,
  onClose,
}: MobileHomeFavoriteRecordPickerProps) => {
  const [search, setSearch] = useState('');
  const { getText } = useJotaduoText();
  const { currentItems, createItem } =
    useNavigationMenuItemEditController('favorite');

  const addItem = (input: NewNavigationMenuItemInput) => {
    createItem(input);
    onClose();
  };

  const { getItems, recordSearchLoading, isSearchDebouncing } =
    useNavigationMenuItemAddOptions({
      step: 'record',
      search,
      objectId: null,
      currentItems,
      isSearchingAllItems: false,
      addItem,
      navigateToStep: ignoreStepNavigation,
      selectObject: ignoreStepNavigation,
    });

  const recordItems = getItems();
  const isLoading = recordSearchLoading || isSearchDebouncing;

  return (
    <DropdownContent width={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent Icon={IconX} onClick={onClose} />
        }
      >
        {getText(JOTADUO_MESSAGES.addFavorite)}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={getText(JOTADUO_MESSAGES.search)}
      />
      <DropdownMenuSeparator />
      <SelectableList
        selectableListInstanceId={`${dropdownId}-list`}
        focusId={dropdownId}
        selectableItemIdArray={recordItems
          .filter((recordItem) => recordItem.isDisabled !== true)
          .map((recordItem) => recordItem.id)}
      >
        <DropdownMenuItemsContainer hasMaxHeight>
          {recordItems.map((recordItem) => (
            <NavigationMenuItemSelectableItem
              key={recordItem.id}
              item={recordItem}
            />
          ))}
          {recordItems.length === 0 && (
            <ListItem disabled>
              {getText(
                isLoading
                  ? JOTADUO_MESSAGES.loading
                  : JOTADUO_MESSAGES.noResults,
              )}
            </ListItem>
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
