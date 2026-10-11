import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { AppPath, type RecordGqlOperationFilter } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type IconComponent, useIcons } from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';

import { JOTADUO_CONVERSATIONS_OBJECT_NAME_PLURAL } from '~/jotaduo/constants/JotaduoConversationsObjectNamePlural';
import { useJotaduoConversationsPath } from '~/jotaduo/hooks/useJotaduoConversationsPath';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MY_WORK_ITEM_DEFINITIONS } from '~/jotaduo/mobile-home/constants/MyWorkItemDefinitions';
import { useMobileHomeFilterContext } from '~/jotaduo/mobile-home/hooks/useMobileHomeFilterContext';
import { myWorkPreferencesState } from '~/jotaduo/mobile-home/states/myWorkPreferencesState';

export type MyWorkItem = {
  key: string;
  label: string;
  Icon: IconComponent;
  color: ThemeColor;
  link: string;
  isHidden: boolean;
  objectNameSingular: string;
  // The records the figure on the row counts. Empty counts them all.
  countFilter?: RecordGqlOperationFilter;
  isCountAvailable: boolean;
};

// Every item the workspace can offer, in the user's order. Hidden ones are
// kept so the editor can bring them back.
export const useMyWorkItems = (): MyWorkItem[] => {
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const views = useAtomStateValue(viewsSelector);
  const { orderedKeys, hiddenKeys } = useAtomStateValue(myWorkPreferencesState);
  const { getIcon } = useIcons();
  const { getText } = useJotaduoText();
  const conversationsPath = useJotaduoConversationsPath();
  const filterContext = useMobileHomeFilterContext();

  // Items the user never ordered follow the ordered ones, in definition order.
  const getOrder = (key: string, definitionIndex: number) => {
    const orderedIndex = orderedKeys.indexOf(key);

    return orderedIndex === -1
      ? orderedKeys.length + definitionIndex
      : orderedIndex;
  };

  return MY_WORK_ITEM_DEFINITIONS.flatMap((definition, definitionIndex) => {
    const objectMetadataItem = activeNonSystemObjectMetadataItems.find(
      (item) => item.namePlural === definition.objectNamePlural,
    );

    if (!isDefined(objectMetadataItem)) {
      return [];
    }

    const view = isDefined(definition.viewName)
      ? views.find(
          (view) =>
            view.objectMetadataId === objectMetadataItem.id &&
            view.name === definition.viewName,
        )
      : undefined;

    return [
      {
        order: getOrder(definition.key, definitionIndex),
        myWorkItem: {
          key: definition.key,
          label: isDefined(definition.label)
            ? getText(definition.label)
            : objectMetadataItem.labelPlural,
          Icon: getIcon(objectMetadataItem.icon),
          color: definition.color,
          // Conversas opens the JotaDuo app's inbox, same as the tab bar.
          link:
            definition.objectNamePlural ===
              JOTADUO_CONVERSATIONS_OBJECT_NAME_PLURAL &&
            isDefined(conversationsPath)
              ? conversationsPath
              : getAppPath(
                  AppPath.RecordIndexPage,
                  { objectNamePlural: objectMetadataItem.namePlural },
                  isDefined(view) ? { viewId: view.id } : undefined,
                ),
          isHidden: hiddenKeys.includes(definition.key),
          objectNameSingular: objectMetadataItem.nameSingular,
          countFilter: isDefined(filterContext)
            ? definition.getCountFilter?.(filterContext)
            : undefined,
          isCountAvailable: isDefined(filterContext),
        },
      },
    ];
  })
    .sort((first, second) => first.order - second.order)
    .map(({ myWorkItem }) => myWorkItem);
};
