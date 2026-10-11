import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type MessageDescriptor } from '@lingui/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconMessageCircle,
  IconSparkles,
} from 'twenty-ui/icon';

import { useJotaduoConversationsPath } from '~/jotaduo/hooks/useJotaduoConversationsPath';
import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';

type UpstreamMobileNavigationBarItem = ReturnType<
  typeof useMobileNavigationBarItems
>['items'][number];

type JotaduoMobileNavigationBarItemName =
  | UpstreamMobileNavigationBarItem['name']
  | 'conversations';

export type JotaduoMobileNavigationBarItem = {
  name: JotaduoMobileNavigationBarItemName;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
};

const LABEL_BY_UPSTREAM_ITEM_NAME: Record<
  UpstreamMobileNavigationBarItem['name'],
  MessageDescriptor
> = {
  home: JOTADUO_MESSAGES.home,
  search: JOTADUO_MESSAGES.search,
  newAiChat: JOTADUO_MESSAGES.ai,
};

// Upstream items keep their behaviour; the fork only relabels them and adds
// the JotaDuo conversations inbox next to home.
export const useJotaduoMobileNavigationBarItems = (): {
  items: JotaduoMobileNavigationBarItem[];
  activeItemName: JotaduoMobileNavigationBarItemName | '';
} => {
  const { items: upstreamItems, activeItemName: upstreamActiveItemName } =
    useMobileNavigationBarItems();
  const { getText } = useJotaduoText();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const isSettingsDrawer = useIsSettingsDrawer();
  const setCurrentMobileNavigationDrawer = useSetAtomState(
    currentMobileNavigationDrawerState,
  );
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );

  const conversationsPath = useJotaduoConversationsPath();

  const conversationsItem: JotaduoMobileNavigationBarItem | undefined =
    isDefined(conversationsPath)
      ? {
          name: 'conversations',
          label: getText(JOTADUO_MESSAGES.conversations),
          Icon: IconMessageCircle,
          onClick: () => {
            closeSidePanelMenu();

            // Mirrors upstream home: the settings drawer shares its expansion
            // state with desktop, so it is only reset when it is open.
            if (isSettingsDrawer) {
              setCurrentMobileNavigationDrawer('main');
              setIsNavigationDrawerExpanded(false);
            }

            navigate(conversationsPath, { replace: isSettingsDrawer });
          },
        }
      : undefined;

  const items = upstreamItems.flatMap<JotaduoMobileNavigationBarItem>(
    (upstreamItem) => {
      const item = {
        ...upstreamItem,
        label: getText(LABEL_BY_UPSTREAM_ITEM_NAME[upstreamItem.name]),
        Icon:
          upstreamItem.name === 'newAiChat' ? IconSparkles : upstreamItem.Icon,
      };

      return upstreamItem.name === 'home' && isDefined(conversationsItem)
        ? [item, conversationsItem]
        : [item];
    },
  );

  const isConversationsActive =
    isDefined(conversationsPath) && pathname.startsWith(conversationsPath);

  return {
    items,
    activeItemName: isConversationsActive
      ? 'conversations'
      : upstreamActiveItemName,
  };
};
