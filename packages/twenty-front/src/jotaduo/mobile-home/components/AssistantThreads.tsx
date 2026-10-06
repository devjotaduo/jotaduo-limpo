import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconSparkles } from 'twenty-ui/icon';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MobileHomeIconTile } from '~/jotaduo/mobile-home/components/MobileHomeIconTile';
import { MobileHomeListRow } from '~/jotaduo/mobile-home/components/MobileHomeListRow';
import {
  MobileHomeSection,
  StyledMobileHomeCard,
} from '~/jotaduo/mobile-home/components/MobileHomeSection';
import { ASSISTANT_VISIBLE_THREAD_COUNT } from '~/jotaduo/mobile-home/constants/AssistantVisibleThreadCount';

// The person's latest conversations with Twenty's assistant, opened the way
// upstream's own home opens them. Nothing shows until there is one: starting
// a conversation is the tab bar's job.
export const AssistantThreads = () => {
  const { t } = useLingui();
  const { getText } = useJotaduoText();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { threads } = useChatThreads(agentChatRecentThreadsSelector);
  const { handleThreadClick } = useAiChatThreadClick({
    resetNavigationStack: true,
  });

  if (threads.length === 0) {
    return null;
  }

  return (
    <MobileHomeSection title={getText(JOTADUO_MESSAGES.assistant)}>
      <StyledMobileHomeCard>
        {threads.slice(0, ASSISTANT_VISIBLE_THREAD_COUNT).map((thread) => (
          <MobileHomeListRow
            key={thread.id}
            icon={<MobileHomeIconTile Icon={IconSparkles} color="violet" />}
            label={isNonEmptyString(thread.title) ? thread.title : t`New chat`}
            secondaryLabel={beautifyPastDateRelativeToNow(
              thread.lastMessageAt ?? thread.updatedAt,
              localeCatalog,
            )}
            onClick={() => handleThreadClick(thread)}
          />
        ))}
      </StyledMobileHomeCard>
    </MobileHomeSection>
  );
};
