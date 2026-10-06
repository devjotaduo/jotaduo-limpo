import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MobileHomeListRow } from '~/jotaduo/mobile-home/components/MobileHomeListRow';
import { TodayTaskCheckbox } from '~/jotaduo/mobile-home/components/TodayTaskCheckbox';
import { type TodayItem } from '~/jotaduo/mobile-home/types/TodayItem';

const LEADING_WIDTH_IN_PX = 44;

const StyledTime = styled.span`
  flex-shrink: 0;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  width: ${LEADING_WIDTH_IN_PX}px;
`;

type TodayRowProps = {
  todayItem: TodayItem;
};

export const TodayRow = ({ todayItem }: TodayRowProps) => {
  const { i18n } = useLingui();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: todayItem.objectNameSingular,
  });

  // Twenty's own name for the kind of record, already in the person's
  // language, followed by what tells this one apart.
  const secondaryLabel = [objectMetadataItem.labelSingular, todayItem.detail]
    .filter(isNonEmptyString)
    .join(' · ');

  if (todayItem.kind === 'task') {
    return (
      <MobileHomeListRow
        leadingAction={
          <TodayTaskCheckbox
            taskId={todayItem.id}
            taskTitle={todayItem.title}
            isDone={todayItem.isDone}
          />
        }
        leadingWidthInPx={LEADING_WIDTH_IN_PX}
        label={todayItem.title}
        isLabelStruck={todayItem.isDone}
        secondaryLabel={secondaryLabel}
        to={todayItem.link}
      />
    );
  }

  return (
    <MobileHomeListRow
      icon={
        <StyledTime>
          {isDefined(todayItem.at)
            ? new Intl.DateTimeFormat(i18n.locale, {
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(todayItem.at))
            : ''}
        </StyledTime>
      }
      leadingWidthInPx={LEADING_WIDTH_IN_PX}
      label={todayItem.title}
      secondaryLabel={secondaryLabel}
      to={todayItem.link}
    />
  );
};
