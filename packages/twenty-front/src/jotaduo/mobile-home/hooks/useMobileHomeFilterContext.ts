import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

import { type MobileHomeFilterContext } from '~/jotaduo/mobile-home/types/MobileHomeFilterContext';
import { getDayRange } from '~/jotaduo/mobile-home/utils/getDayRange';

export const useMobileHomeFilterContext = ():
  | MobileHomeFilterContext
  | undefined => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  if (!isDefined(currentWorkspaceMember)) {
    return undefined;
  }

  return {
    currentWorkspaceMemberId: currentWorkspaceMember.id,
    ...getDayRange(new Date()),
  };
};
