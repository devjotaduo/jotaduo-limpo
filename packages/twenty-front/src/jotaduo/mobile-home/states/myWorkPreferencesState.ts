import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type MyWorkPreferences = {
  orderedKeys: string[];
  hiddenKeys: string[];
};

// Twenty has no per-user settings store, so the choice lives in the browser:
// it follows the device, not the account.
export const myWorkPreferencesState = createAtomState<MyWorkPreferences>({
  key: 'jotaduoMyWorkPreferencesState',
  defaultValue: { orderedKeys: [], hiddenKeys: [] },
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
