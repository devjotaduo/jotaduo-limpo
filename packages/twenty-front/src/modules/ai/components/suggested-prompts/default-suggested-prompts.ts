import { msg } from '@lingui/core/macro';
import { IconBell, IconPlus, IconSparkles } from 'twenty-ui/icon';

import { type SuggestedPrompt } from '@/ai/types/SuggestedPrompt';

// what a JotaDuo team asks first: a reminder, a new customer, and what the assistant can do
export const DEFAULT_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'reminder',
    label: msg`Create a reminder`,
    Icon: IconBell,
    prompts: [msg`Create a reminder for me: `],
  },
  {
    id: 'customer',
    label: msg`Add a customer`,
    Icon: IconPlus,
    prompts: [msg`Add a new customer (name, phone, email). Details: `],
  },
  {
    id: 'capabilities',
    label: msg`See what I know how to do`,
    Icon: IconSparkles,
    mode: 'SEND',
    prompts: [msg`What can you do?`],
  },
];
