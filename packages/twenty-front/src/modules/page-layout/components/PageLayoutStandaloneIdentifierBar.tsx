import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT } from '@/page-layout/constants/PageLayoutRecordIdentifierBarHeight';
import { useOpenPageLayoutTabSettings } from '@/page-layout/hooks/useOpenPageLayoutTabSettings';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { IconPinned } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledBar = styled.div`
  align-items: stretch;
  background: ${themeCssVariables.background.secondary};
  box-shadow: inset 0 -1px 0 ${themeCssVariables.border.color.light};
  display: grid;
  flex-shrink: 0;
  grid-template-columns: ${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px minmax(
      0,
      1fr
    );
  height: ${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT}px;
`;

const StyledTitleCell = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTabsCell = styled.div`
  align-items: stretch;
  display: flex;
  min-width: 0;
`;

type PageLayoutStandaloneIdentifierBarProps = {
  title: string;
  pinnedTab: Pick<PageLayoutTab, 'id' | 'title'>;
  isPinnedTabEditable: boolean;
  tabList?: ReactNode;
};

export const PageLayoutStandaloneIdentifierBar = ({
  title,
  pinnedTab,
  isPinnedTabEditable,
  tabList,
}: PageLayoutStandaloneIdentifierBarProps) => {
  const { t } = useLingui();
  const { openTabSettings } = useOpenPageLayoutTabSettings();

  return (
    <StyledBar>
      <StyledTitleCell>
        <StyledTitle title={title}>{title}</StyledTitle>
        {isPinnedTabEditable && (
          <IconButton
            aria-label={t`Edit pinned tab: ${pinnedTab.title}`}
            onClick={() => openTabSettings(pinnedTab.id)}
            tooltip={t`Pinned tab, always shown on the left`}
            tooltipDelay={TooltipDelay.shortDelay}
            size="sm"
            variant="ghost"
          >
            <IconPinned />
          </IconButton>
        )}
      </StyledTitleCell>
      <StyledTabsCell>{tabList}</StyledTabsCell>
    </StyledBar>
  );
};
