import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { getMetadataStoreResyncAction } from '@/metadata-store/utils/getMetadataStoreResyncAction';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const METADATA_STORE_RESYNC_DEBOUNCE_TIME_IN_MS = 2_000;
const METADATA_STORE_RESYNC_MAX_WAIT_TIME_IN_MS = 15_000;

export const MetadataStoreResyncOnApplicationSyncEffect = () => {
  const { loadCurrentUser } = useLoadCurrentUser();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();

  // Triggered by the server, not by the user: a failure must not raise a
  // toast, and the next event or page load retries anyway
  const reloadCurrentUser = useCallback(
    () => loadCurrentUser().catch(() => undefined),
    [loadCurrentUser],
  );

  const debouncedFullResync = useDebouncedCallback(
    async () => {
      await reloadCurrentUser();
      invalidateMetadataStore();
    },
    METADATA_STORE_RESYNC_DEBOUNCE_TIME_IN_MS,
    { maxWait: METADATA_STORE_RESYNC_MAX_WAIT_TIME_IN_MS },
  );

  const debouncedReloadCurrentUser = useDebouncedCallback(
    reloadCurrentUser,
    METADATA_STORE_RESYNC_DEBOUNCE_TIME_IN_MS,
    { maxWait: METADATA_STORE_RESYNC_MAX_WAIT_TIME_IN_MS },
  );

  const handleMetadataOperationBrowserEvent = useCallback(
    (
      eventDetail: MetadataOperationBrowserEventDetail<Record<string, unknown>>,
    ) => {
      const resyncAction = getMetadataStoreResyncAction(eventDetail);

      // Any event extends a pending refresh so that a whole app sync, which
      // streams many metadata events, ends in a single refresh
      if (resyncAction === 'full-resync' || debouncedFullResync.isPending()) {
        debouncedReloadCurrentUser.cancel();
        debouncedFullResync();

        return;
      }

      if (
        resyncAction === 'reload-current-user' ||
        debouncedReloadCurrentUser.isPending()
      ) {
        debouncedReloadCurrentUser();
      }
    },
    [debouncedFullResync, debouncedReloadCurrentUser],
  );

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: handleMetadataOperationBrowserEvent,
  });

  return null;
};
