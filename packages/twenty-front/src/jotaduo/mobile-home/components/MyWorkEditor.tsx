import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MobileHomeEditActionButton } from '~/jotaduo/mobile-home/components/MobileHomeEditActionButton';
import { MobileHomeEditGroup } from '~/jotaduo/mobile-home/components/MobileHomeEditGroup';
import { MobileHomeEditRow } from '~/jotaduo/mobile-home/components/MobileHomeEditRow';
import { MobileHomeIconTile } from '~/jotaduo/mobile-home/components/MobileHomeIconTile';
import {
  type MobileHomeReorder,
  MobileHomeReorderableRows,
} from '~/jotaduo/mobile-home/components/MobileHomeReorderableRows';
import { MobileHomeSheet } from '~/jotaduo/mobile-home/components/MobileHomeSheet';
import { useMyWorkItems } from '~/jotaduo/mobile-home/hooks/useMyWorkItems';
import { myWorkPreferencesState } from '~/jotaduo/mobile-home/states/myWorkPreferencesState';

type MyWorkEditorProps = {
  onClose: () => void;
};

export const MyWorkEditor = ({ onClose }: MyWorkEditorProps) => {
  const myWorkItems = useMyWorkItems();
  const setMyWorkPreferences = useSetAtomState(myWorkPreferencesState);
  const { getText } = useJotaduoText();

  const handleToggle = (key: string, isHidden: boolean) =>
    setMyWorkPreferences((myWorkPreferences) => ({
      ...myWorkPreferences,
      hiddenKeys: isHidden
        ? myWorkPreferences.hiddenKeys.filter((hiddenKey) => hiddenKey !== key)
        : [...myWorkPreferences.hiddenKeys, key],
    }));

  const handleReorder = ({ fromIndex, toIndex }: MobileHomeReorder) =>
    setMyWorkPreferences((myWorkPreferences) => ({
      ...myWorkPreferences,
      orderedKeys: moveArrayItem(
        myWorkItems.map((myWorkItem) => myWorkItem.key),
        { fromIndex, toIndex },
      ),
    }));

  return (
    <MobileHomeSheet
      title={getText(JOTADUO_MESSAGES.editMyWork)}
      onClose={onClose}
    >
      <MobileHomeEditGroup>
        <MobileHomeReorderableRows
          onReorder={handleReorder}
          rows={myWorkItems.map((myWorkItem) => ({
            id: myWorkItem.key,
            row: (
              <MobileHomeEditRow
                isReorderable
                label={myWorkItem.label}
                leadingAction={
                  <MobileHomeEditActionButton
                    kind={myWorkItem.isHidden ? 'unchecked' : 'checked'}
                    label={`${getText(JOTADUO_MESSAGES.showOnHome)}: ${myWorkItem.label}`}
                    onClick={() =>
                      handleToggle(myWorkItem.key, myWorkItem.isHidden)
                    }
                  />
                }
                icon={
                  <MobileHomeIconTile
                    Icon={myWorkItem.Icon}
                    color={myWorkItem.color}
                    sizeInPx={30}
                    iconSizeInPx={18}
                  />
                }
              />
            ),
          }))}
        />
      </MobileHomeEditGroup>
    </MobileHomeSheet>
  );
};
