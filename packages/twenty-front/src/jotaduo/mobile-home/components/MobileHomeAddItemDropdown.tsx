import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type ReactNode } from 'react';

import { MobileHomeFavoriteRecordPicker } from '~/jotaduo/mobile-home/components/MobileHomeFavoriteRecordPicker';

const BOUNDARY_PADDING_IN_PX = 16;

type MobileHomeAddItemDropdownProps = {
  dropdownId: string;
  trigger: ReactNode;
  // 'favorite' searches records only; 'shortcut' is upstream's full picker.
  itemKind: 'favorite' | 'shortcut';
};

// Opens above its trigger: the triggers sit in the lower half of the screen,
// where a picker dropping down would put its search field under the phone's
// keyboard.
export const MobileHomeAddItemDropdown = ({
  dropdownId,
  trigger,
  itemKind,
}: MobileHomeAddItemDropdownProps) => {
  const { closeDropdown } = useCloseDropdown();

  const handleClose = () => closeDropdown(dropdownId);

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="top-start"
      middlewareBoundaryPadding={{
        left: BOUNDARY_PADDING_IN_PX,
        right: BOUNDARY_PADDING_IN_PX,
      }}
      clickableComponentWidth="100%"
      clickableComponent={trigger}
      dropdownComponents={
        itemKind === 'favorite' ? (
          <MobileHomeFavoriteRecordPicker
            dropdownId={dropdownId}
            onClose={handleClose}
          />
        ) : (
          <NavigationMenuItemAddDropdownContent
            section="favorite"
            dropdownId={dropdownId}
            onClose={handleClose}
          />
        )
      }
    />
  );
};
