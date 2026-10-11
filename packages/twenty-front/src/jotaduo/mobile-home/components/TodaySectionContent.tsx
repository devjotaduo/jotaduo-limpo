import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconAlertTriangle } from 'twenty-ui/icon';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MobileHomeIconTile } from '~/jotaduo/mobile-home/components/MobileHomeIconTile';
import { MobileHomeListRow } from '~/jotaduo/mobile-home/components/MobileHomeListRow';
import {
  MobileHomeSection,
  StyledMobileHomeCard,
} from '~/jotaduo/mobile-home/components/MobileHomeSection';
import { TodayCreateTaskButton } from '~/jotaduo/mobile-home/components/TodayCreateTaskButton';
import { TodayRow } from '~/jotaduo/mobile-home/components/TodayRow';
import { TODAY_VISIBLE_ITEM_COUNT } from '~/jotaduo/mobile-home/constants/TodayVisibleItemCount';
import { useMyWorkItems } from '~/jotaduo/mobile-home/hooks/useMyWorkItems';
import { type TodayItem } from '~/jotaduo/mobile-home/types/TodayItem';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const TASK_OBJECT_NAME_PLURAL = 'tasks';
const LEADING_WIDTH_IN_PX = 44;

const StyledItemCount = styled.span`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  font-size: 14px;
  font-weight: 500;
`;

// As wide as the time and the checkbox of the rows above, so the labels of
// the card line up.
const StyledLeadingTile = styled.span`
  display: flex;
  flex-shrink: 0;
  width: ${LEADING_WIDTH_IN_PX}px;
`;

// Pulled up one pixel so its border covers the divider of the row above it,
// which would otherwise read as a second line.
const StyledFooterLink = styled(Link)`
  align-items: center;
  border-top: 1px solid ${JOTADUO_MOBILE_THEME_VARIABLES.border};
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.accent};
  display: flex;
  font-size: 15px;
  font-weight: 600;
  justify-content: center;
  margin-top: -1px;
  min-height: 48px;
  position: relative;
  text-decoration: none;
`;

const StyledEmptyCard = styled(StyledMobileHomeCard)`
  gap: 14px;
  padding: 20px 16px;
`;

const StyledEmptyTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledEmptyTitle = styled.span`
  font-size: 17px;
  font-weight: 500;
`;

const StyledEmptyDescription = styled.span`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  font-size: 14px;
  line-height: 1.4;
`;

type TodaySectionContentProps = {
  todayItems: TodayItem[];
  // What is still to happen or to do today, past the rows in sight.
  openItemCount: number;
  overdueTaskCount: number;
};

export const TodaySectionContent = ({
  todayItems,
  openItemCount,
  overdueTaskCount,
}: TodaySectionContentProps) => {
  const { getText } = useJotaduoText();
  const { findActiveObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const myWorkItems = useMyWorkItems();

  const title = getText(JOTADUO_MESSAGES.today);
  const taskObjectMetadataItem = findActiveObjectMetadataItemByNamePlural(
    TASK_OBJECT_NAME_PLURAL,
  );
  const getMyWorkLink = (myWorkItemKey: string) =>
    myWorkItems.find((myWorkItem) => myWorkItem.key === myWorkItemKey)?.link;
  const dayAgendaLink = getMyWorkLink('dayAgenda');

  if (todayItems.length === 0 && overdueTaskCount === 0) {
    return (
      <MobileHomeSection title={title}>
        <StyledEmptyCard>
          <StyledEmptyTexts>
            <StyledEmptyTitle>
              {getText(JOTADUO_MESSAGES.todayEmptyTitle)}
            </StyledEmptyTitle>
            <StyledEmptyDescription>
              {getText(JOTADUO_MESSAGES.todayEmptyDescription)}
            </StyledEmptyDescription>
          </StyledEmptyTexts>
          {isDefined(taskObjectMetadataItem) && (
            <TodayCreateTaskButton
              taskObjectMetadataItem={taskObjectMetadataItem}
            />
          )}
        </StyledEmptyCard>
      </MobileHomeSection>
    );
  }

  return (
    <MobileHomeSection
      title={title}
      action={
        openItemCount > 0 && (
          <StyledItemCount>
            {openItemCount === 1
              ? getText(JOTADUO_MESSAGES.todayItemCountOne)
              : getText(JOTADUO_MESSAGES.todayItemCountOther, {
                  count: openItemCount,
                })}
          </StyledItemCount>
        )
      }
    >
      <StyledMobileHomeCard>
        {todayItems.slice(0, TODAY_VISIBLE_ITEM_COUNT).map((todayItem) => (
          <TodayRow key={todayItem.id} todayItem={todayItem} />
        ))}
        {overdueTaskCount > 0 && (
          <MobileHomeListRow
            icon={
              <StyledLeadingTile>
                <MobileHomeIconTile Icon={IconAlertTriangle} color="red" />
              </StyledLeadingTile>
            }
            leadingWidthInPx={LEADING_WIDTH_IN_PX}
            label={
              overdueTaskCount === 1
                ? getText(JOTADUO_MESSAGES.overdueTaskCountOne)
                : getText(JOTADUO_MESSAGES.overdueTaskCountOther, {
                    count: overdueTaskCount,
                  })
            }
            to={
              getMyWorkLink('tasks') ??
              getAppPath(AppPath.RecordIndexPage, {
                objectNamePlural: TASK_OBJECT_NAME_PLURAL,
              })
            }
          />
        )}
        {isDefined(dayAgendaLink) && (
          <StyledFooterLink to={dayAgendaLink}>
            {getText(JOTADUO_MESSAGES.seeDayAgenda)}
          </StyledFooterLink>
        )}
      </StyledMobileHomeCard>
    </MobileHomeSection>
  );
};
