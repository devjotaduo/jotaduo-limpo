import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MobileHomeEditActionButton } from '~/jotaduo/mobile-home/components/MobileHomeEditActionButton';
import { MobileHomeEditGroup } from '~/jotaduo/mobile-home/components/MobileHomeEditGroup';
import { MobileHomeEditRow } from '~/jotaduo/mobile-home/components/MobileHomeEditRow';
import {
  type MobileHomeReorder,
  MobileHomeReorderableRows,
} from '~/jotaduo/mobile-home/components/MobileHomeReorderableRows';
import { MobileHomeSheet } from '~/jotaduo/mobile-home/components/MobileHomeSheet';
import { MobileHomeSheetSearchInput } from '~/jotaduo/mobile-home/components/MobileHomeSheetSearchInput';
import { getReorderedItemPosition } from '~/jotaduo/mobile-home/utils/getReorderedItemPosition';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

// Keeps the labels of a row without a button aligned with the others.
const StyledActionPlaceholder = styled.span`
  flex-shrink: 0;
  width: 44px;
`;

const StyledMessage = styled.p`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  font-size: 15px;
  margin: 8px 0 0;
  text-align: center;
`;

export type MobileHomePinnedItem = {
  id: string;
  label: string;
  caption?: string;
  icon: ReactNode;
  isRemovable: boolean;
  position: number;
};

export type MobileHomePinnedItemCandidateGroup = {
  label: string;
  options: NavigationMenuItemOption[];
};

type MobileHomePinnedItemsEditorProps = {
  title: string;
  pinnedItems: MobileHomePinnedItem[];
  candidateGroups: MobileHomePinnedItemCandidateGroup[];
  isLoadingCandidates: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, position: number) => void;
  onClose: () => void;
};

// The edit screen Favoritos and Atalhos share: what is pinned on top, to
// remove or reorder, and what can be pinned below.
export const MobileHomePinnedItemsEditor = ({
  title,
  pinnedItems,
  candidateGroups,
  isLoadingCandidates,
  search,
  onSearchChange,
  onRemove,
  onMove,
  onClose,
}: MobileHomePinnedItemsEditorProps) => {
  const { getText } = useJotaduoText();

  const nonEmptyCandidateGroups = candidateGroups.filter(
    (candidateGroup) => candidateGroup.options.length > 0,
  );

  const handleReorder = ({ id, fromIndex, toIndex }: MobileHomeReorder) =>
    onMove(
      id,
      getReorderedItemPosition({
        positions: pinnedItems.map((pinnedItem) => pinnedItem.position),
        fromIndex,
        toIndex,
      }),
    );

  return (
    <MobileHomeSheet title={title} onClose={onClose}>
      <MobileHomeSheetSearchInput value={search} onChange={onSearchChange} />
      {pinnedItems.length > 0 && (
        <MobileHomeEditGroup label={getText(JOTADUO_MESSAGES.selected)}>
          <MobileHomeReorderableRows
            onReorder={handleReorder}
            rows={pinnedItems.map((pinnedItem) => ({
              id: pinnedItem.id,
              row: (
                <MobileHomeEditRow
                  isReorderable
                  label={pinnedItem.label}
                  caption={pinnedItem.caption}
                  icon={pinnedItem.icon}
                  leadingAction={
                    pinnedItem.isRemovable ? (
                      <MobileHomeEditActionButton
                        kind="remove"
                        label={`${getText(JOTADUO_MESSAGES.remove)}: ${pinnedItem.label}`}
                        onClick={() => onRemove(pinnedItem.id)}
                      />
                    ) : (
                      <StyledActionPlaceholder />
                    )
                  }
                />
              ),
            }))}
          />
        </MobileHomeEditGroup>
      )}
      {nonEmptyCandidateGroups.map((candidateGroup) => (
        <MobileHomeEditGroup
          key={candidateGroup.label}
          label={candidateGroup.label}
        >
          {candidateGroup.options.map((option) => (
            <MobileHomeEditRow
              key={option.id}
              label={option.label}
              caption={option.contextualText}
              icon={
                isDefined(option.Icon) ? <option.Icon size={20} /> : option.icon
              }
              leadingAction={
                <MobileHomeEditActionButton
                  kind="add"
                  label={`${getText(JOTADUO_MESSAGES.add)}: ${option.label}`}
                  onClick={option.onClick}
                />
              }
            />
          ))}
        </MobileHomeEditGroup>
      ))}
      {nonEmptyCandidateGroups.length === 0 && (
        <StyledMessage>
          {getText(
            isLoadingCandidates
              ? JOTADUO_MESSAGES.loading
              : JOTADUO_MESSAGES.noResults,
          )}
        </StyledMessage>
      )}
    </MobileHomeSheet>
  );
};
