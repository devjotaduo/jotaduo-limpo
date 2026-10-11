import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { AssistantThreads } from '~/jotaduo/mobile-home/components/AssistantThreads';

// Same gate as upstream's mobile home: only who may use the assistant.
export const AssistantSection = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  if (!hasAiPermission) {
    return null;
  }

  return <AssistantThreads />;
};
