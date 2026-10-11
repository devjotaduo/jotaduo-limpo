import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MultiWorkspaceDropdownDefaultComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownDefaultComponents';
import { MultiWorkspaceDropdownOpenRecordInComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownOpenRecordInComponents';
import { MultiWorkspaceDropdownThemesComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { MultiWorkspaceDropdownWorkspacesListComponents } from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownWorkspacesListComponents';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/navigation/constants/MultiWorkspaceDropdownId';
import { MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING } from '@/navigation/constants/MultiWorkspaceDropdownMobileBoundaryPadding';
import { multiWorkspaceDropdownState } from '@/navigation/states/multiWorkspaceDropdownState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { IconChevronDown } from 'twenty-ui/icon';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MobileHomeCreateMenu } from '~/jotaduo/mobile-home/components/MobileHomeCreateMenu';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

// Stays pinned while the page scrolls. Once content slides underneath, the
// page colour fades in behind it so the two controls stay legible.
const StyledHeader = styled.header`
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding-top: 20px;
  position: sticky;
  top: 0;
  z-index: 1;

  &::before {
    background: linear-gradient(
      ${JOTADUO_MOBILE_THEME_VARIABLES.page} 30%,
      transparent
    );
    content: '';
    height: 92px;
    left: -16px;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: -16px;
    top: 0;
    transition: opacity 0.2s ease;
    z-index: -1;
  }

  &[data-compact]::before {
    opacity: 1;
  }
`;

const StyledWorkspaceTrigger = styled.div`
  align-items: center;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  cursor: pointer;
  display: flex;
  gap: 10px;
  min-height: 44px;
  min-width: 0;
`;

const StyledWorkspaceLogo = styled.span`
  align-items: center;
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.workspaceLogo};
  border-radius: 10px;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.workspaceLogoText};
  display: flex;
  flex-shrink: 0;
  font-size: 19px;
  font-weight: 700;
  height: 40px;
  justify-content: center;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  width: 40px;

  [data-compact] & {
    box-shadow: ${JOTADUO_MOBILE_THEME_VARIABLES.floatingControlShadow};
  }

  > img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
`;

// Collapsed rather than unmounted when compact, so the trigger keeps its name.
const StyledWorkspaceName = styled.span`
  align-items: center;
  display: flex;
  gap: 10px;
  min-width: 0;
  transition: opacity 0.2s ease;

  [data-compact] & {
    opacity: 0;
    pointer-events: none;
  }
`;

const StyledWorkspaceLabel = styled.span`
  font-size: 18px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const getWorkspaceDropdownComponents = (
  multiWorkspaceDropdown: string | undefined,
) => {
  switch (multiWorkspaceDropdown) {
    case 'themes':
      return MultiWorkspaceDropdownThemesComponents;
    case 'open-record-in':
      return MultiWorkspaceDropdownOpenRecordInComponents;
    case 'workspaces-list':
      return MultiWorkspaceDropdownWorkspacesListComponents;
    default:
      return MultiWorkspaceDropdownDefaultComponents;
  }
};

type MobileHomeHeaderProps = {
  isCompact: boolean;
};

export const MobileHomeHeader = ({ isCompact }: MobileHomeHeaderProps) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [multiWorkspaceDropdown, setMultiWorkspaceDropdown] = useAtomState(
    multiWorkspaceDropdownState,
  );
  const { getText } = useJotaduoText();

  const workspaceName = currentWorkspace?.displayName ?? '';
  const WorkspaceDropdownComponents = getWorkspaceDropdownComponents(
    multiWorkspaceDropdown,
  );

  return (
    <StyledHeader data-compact={isCompact ? '' : undefined}>
      <Dropdown
        dropdownId={MULTI_WORKSPACE_DROPDOWN_ID}
        dropdownPlacement="bottom-start"
        middlewareBoundaryPadding={{
          left: MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING,
          right: MULTI_WORKSPACE_DROPDOWN_MOBILE_BOUNDARY_PADDING,
        }}
        dropdownOffset={{ x: 0, y: 4 }}
        clickableComponent={
          <StyledWorkspaceTrigger
            aria-label={`${getText(JOTADUO_MESSAGES.switchWorkspace)}: ${workspaceName}`}
            title={workspaceName}
          >
            <StyledWorkspaceLogo>
              {isNonEmptyString(currentWorkspace?.logo) ? (
                <img src={getAbsoluteImageUrl(currentWorkspace.logo)} alt="" />
              ) : (
                workspaceName.trim().charAt(0).toUpperCase()
              )}
            </StyledWorkspaceLogo>
            <StyledWorkspaceName>
              <StyledWorkspaceLabel>{workspaceName}</StyledWorkspaceLabel>
              <IconChevronDown
                size={18}
                stroke={2}
                color={JOTADUO_MOBILE_THEME_VARIABLES.textSecondary}
                aria-hidden
              />
            </StyledWorkspaceName>
          </StyledWorkspaceTrigger>
        }
        dropdownComponents={<WorkspaceDropdownComponents />}
        onClose={() => setMultiWorkspaceDropdown('default')}
      />
      <MobileHomeCreateMenu />
    </StyledHeader>
  );
};
