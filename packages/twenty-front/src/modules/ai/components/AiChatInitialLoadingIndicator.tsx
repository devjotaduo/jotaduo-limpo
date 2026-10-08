import { AiChatAvatar } from '@/ai/components/AiChatAvatar';

// before the first chunk the reply has no row yet, so the thinking face stands in for it
export const AiChatInitialLoadingIndicator = () => (
  <AiChatAvatar size={24} isThinking />
);
