import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateNewRecord } from '@/object-record/hooks/useCreateNewRecord';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { StyledMobileHomeSecondaryButton } from '~/jotaduo/mobile-home/components/MobileHomeSection';

type TodayCreateTaskButtonProps = {
  taskObjectMetadataItem: EnrichedObjectMetadataItem;
};

// Its own component because the creation hook is bound to the task object,
// which a workspace may have turned off.
export const TodayCreateTaskButton = ({
  taskObjectMetadataItem,
}: TodayCreateTaskButtonProps) => {
  const { getText } = useJotaduoText();
  const { createNewRecord } = useCreateNewRecord({
    objectMetadataItem: taskObjectMetadataItem,
  });

  return (
    <StyledMobileHomeSecondaryButton
      type="button"
      onClick={() => {
        void createNewRecord({ position: 'first' });
      }}
    >
      {getText(JOTADUO_MESSAGES.createTask)}
    </StyledMobileHomeSecondaryButton>
  );
};
