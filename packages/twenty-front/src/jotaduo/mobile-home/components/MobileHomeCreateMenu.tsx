import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { styled } from '@linaria/react';
import { IconPlus } from 'twenty-ui/icon';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MobileHomeCreateMenuItem } from '~/jotaduo/mobile-home/components/MobileHomeCreateMenuItem';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const CREATE_MENU_DROPDOWN_ID = 'jotaduo-mobile-home-create';
const BOUNDARY_PADDING_IN_PX = 16;

const StyledCreateButton = styled.button`
  align-items: center;
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.floatingControl};
  border: 1px solid ${JOTADUO_MOBILE_THEME_VARIABLES.controlBorder};
  border-radius: 50%;
  box-shadow: ${JOTADUO_MOBILE_THEME_VARIABLES.floatingControlShadow};
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 48px;
  justify-content: center;
  padding: 0;
  width: 48px;
`;

// Upstream's own cap shows five items at a time, too few for a phone screen
// that has room for the whole list.
const StyledScrollableItems = styled.div`
  max-height: 60vh;
  overflow-y: auto;
`;

// Lists what can be created and nothing else. The command menu the button
// used to open leads with actions for "this object", which the home has none
// of.
export const MobileHomeCreateMenu = () => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { closeDropdown } = useCloseDropdown();
  const { getText } = useJotaduoText();

  const creatableObjectMetadataItems = activeObjectMetadataItems
    .filter((objectMetadataItem) => {
      const objectPermissions = getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        objectMetadataItem.id,
      );

      return (
        objectPermissions.canReadObjectRecords &&
        canCreateRecordsForObjectMetadataItem({
          objectMetadataItem,
          objectPermissions,
        })
      );
    })
    .sort((first, second) =>
      first.labelSingular.localeCompare(second.labelSingular),
    );

  if (creatableObjectMetadataItems.length === 0) {
    return null;
  }

  const createLabel = getText(JOTADUO_MESSAGES.create);

  return (
    <Dropdown
      dropdownId={CREATE_MENU_DROPDOWN_ID}
      dropdownPlacement="bottom-end"
      middlewareBoundaryPadding={{
        left: BOUNDARY_PADDING_IN_PX,
        right: BOUNDARY_PADDING_IN_PX,
      }}
      dropdownOffset={{ x: 0, y: 4 }}
      clickableComponent={
        <StyledCreateButton
          type="button"
          aria-label={createLabel}
          title={createLabel}
        >
          <IconPlus size={24} stroke={2.4} aria-hidden />
        </StyledCreateButton>
      }
      dropdownComponents={
        <DropdownContent width={GenericDropdownContentWidth.Large}>
          <StyledScrollableItems>
            <DropdownMenuItemsContainer>
              {creatableObjectMetadataItems.map((objectMetadataItem) => (
                <MobileHomeCreateMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onCreate={() => closeDropdown(CREATE_MENU_DROPDOWN_ID)}
                />
              ))}
            </DropdownMenuItemsContainer>
          </StyledScrollableItems>
        </DropdownContent>
      }
    />
  );
};
