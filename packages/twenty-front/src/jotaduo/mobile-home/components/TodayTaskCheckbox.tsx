import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { styled } from '@linaria/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { IconCheck } from 'twenty-ui/icon';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

// A 44px target around a 24px circle. The pull to the left lines the circle
// up with the times of the rows above it.
const StyledCheckbox = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 44px;
  justify-content: center;
  margin-left: -10px;
  padding: 0;
  width: 44px;
`;

const StyledCircle = styled.span`
  align-items: center;
  border: 1.5px solid ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  border-radius: 50%;
  box-sizing: border-box;
  color: transparent;
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;

  [aria-pressed='true'] > & {
    background: ${JOTADUO_MOBILE_THEME_VARIABLES.accent};
    border-color: ${JOTADUO_MOBILE_THEME_VARIABLES.accent};
    color: ${JOTADUO_MOBILE_THEME_VARIABLES.card};
  }
`;

type TodayTaskCheckboxProps = {
  taskId: string;
  taskTitle: string;
  isDone: boolean;
};

export const TodayTaskCheckbox = ({
  taskId,
  taskTitle,
  isDone,
}: TodayTaskCheckboxProps) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const { getText } = useJotaduoText();

  const handleClick = () => {
    void updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Task,
      idToUpdate: taskId,
      updateOneRecordInput: { status: isDone ? 'TODO' : 'DONE' },
    });
  };

  return (
    <StyledCheckbox
      type="button"
      aria-pressed={isDone}
      aria-label={getText(
        isDone ? JOTADUO_MESSAGES.reopenTask : JOTADUO_MESSAGES.completeTask,
        { title: taskTitle },
      )}
      onClick={handleClick}
    >
      <StyledCircle>
        <IconCheck size={14} stroke={3} aria-hidden />
      </StyledCircle>
    </StyledCheckbox>
  );
};
