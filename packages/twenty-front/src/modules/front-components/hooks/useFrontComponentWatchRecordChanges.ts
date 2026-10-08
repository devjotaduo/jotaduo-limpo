import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { incrementRecordChangeCounters } from '@/front-components/utils/incrementRecordChangeCounters';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { SSE_RESYNC_DEBOUNCE_TIME_IN_MS } from '@/sse-db-event/constants/SseResyncDebounceTimeInMs';
import { useChangeQueryListenState } from '@/sse-db-event/hooks/useChangeQueryListenState';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  type FrontComponentHostCommunicationApi,
  type FrontComponentRecordChangeCounters,
} from 'twenty-front-component-renderer';
import { fastDeepEqual, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useDebouncedCallback, useThrottledCallback } from 'use-debounce';

// Each watched object adds a query to the user's event stream, and the list comes from the sandbox.
const FRONT_COMPONENT_WATCHED_OBJECTS_MAX_COUNT = 10;

// Each counter change costs the component a re-read on its app's quota, so bursts collapse into one change per window.
const FRONT_COMPONENT_RECORD_CHANGE_COUNTERS_THROTTLE_IN_MS = 1_000;

export const useFrontComponentWatchRecordChanges = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { changeQueryIdListenState } = useChangeQueryListenState();
  const instanceId = useId();
  const [watchedObjectNameSingulars, setWatchedObjectNameSingulars] = useState<
    string[]
  >([]);
  const [recordChangeCounters, setRecordChangeCounters] =
    useState<FrontComponentRecordChangeCounters>({});
  // oxlint-disable-next-line twenty/no-state-useref
  const changedObjectNameSingularsRef = useRef(new Set<string>());

  const isWatching = isNonEmptyArray(watchedObjectNameSingulars);

  // The stream only carries events for objects some query asked for, and the page may not show these objects.
  useEffect(() => {
    const queryListeners = watchedObjectNameSingulars.map(
      (objectNameSingular) => ({
        queryId: `front-component-record-changes-${instanceId}-${objectNameSingular}`,
        operationSignature: { objectNameSingular, variables: {} },
      }),
    );

    for (const { queryId, operationSignature } of queryListeners) {
      changeQueryIdListenState(true, queryId, operationSignature);
    }

    return () => {
      for (const { queryId, operationSignature } of queryListeners) {
        changeQueryIdListenState(false, queryId, operationSignature);
      }
    };
  }, [changeQueryIdListenState, instanceId, watchedObjectNameSingulars]);

  const flushChangedObjects = useThrottledCallback(() => {
    const changedObjectNameSingulars = [
      ...changedObjectNameSingularsRef.current,
    ];

    changedObjectNameSingularsRef.current.clear();

    setRecordChangeCounters((currentRecordChangeCounters) =>
      incrementRecordChangeCounters({
        recordChangeCounters: currentRecordChangeCounters,
        objectNameSingulars: changedObjectNameSingulars,
      }),
    );
  }, FRONT_COMPONENT_RECORD_CHANGE_COUNTERS_THROTTLE_IN_MS);

  const handleObjectRecordOperation = useCallback(
    ({ objectMetadataItem }: ObjectRecordOperationBrowserEventDetail) => {
      if (
        !watchedObjectNameSingulars.includes(objectMetadataItem.nameSingular)
      ) {
        return;
      }

      changedObjectNameSingularsRef.current.add(
        objectMetadataItem.nameSingular,
      );
      flushChangedObjects();
    },
    [flushChangedObjects, watchedObjectNameSingulars],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleObjectRecordOperation,
    enabled: isWatching,
  });

  // Changes made while the stream was down are never replayed; the delay lets the new stream register the queries again first.
  const handleSseReconnected = useDebouncedCallback(() => {
    for (const objectNameSingular of watchedObjectNameSingulars) {
      changedObjectNameSingularsRef.current.add(objectNameSingular);
    }

    flushChangedObjects();
  }, SSE_RESYNC_DEBOUNCE_TIME_IN_MS);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: handleSseReconnected,
  });

  const watchRecordChanges: FrontComponentHostCommunicationApi['watchRecordChanges'] =
    async (params) => {
      // Sandboxed input: every name becomes a query on the user's event stream.
      if (
        !isDefined(params) ||
        !Array.isArray(params.objectNameSingulars) ||
        params.objectNameSingulars.length >
          FRONT_COMPONENT_WATCHED_OBJECTS_MAX_COUNT ||
        !params.objectNameSingulars.every(isNonEmptyString)
      ) {
        return { status: 'failed', reason: 'invalid-params' };
      }

      // Events reach the host grouped by object, so a filter could not be honored and would only look like it was.
      if ('filter' in params && isDefined(params.filter)) {
        return { status: 'failed', reason: 'filter-not-supported' };
      }

      const objectNameSingulars = [
        ...new Set(params.objectNameSingulars),
      ].sort();

      const watchedObjectMetadataItems = objectNameSingulars.map(
        (objectNameSingular) =>
          objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.nameSingular === objectNameSingular,
          ),
      );

      if (!watchedObjectMetadataItems.every(isDefined)) {
        return { status: 'failed', reason: 'unknown-object' };
      }

      // The event stream is authorized as the user, not the app role, so other objects would leak when their records change.
      if (
        !watchedObjectMetadataItems.every(
          (objectMetadataItem) =>
            objectMetadataItem.applicationId === applicationId,
        )
      ) {
        return { status: 'failed', reason: 'object-not-owned' };
      }

      setWatchedObjectNameSingulars((currentWatchedObjectNameSingulars) =>
        fastDeepEqual(currentWatchedObjectNameSingulars, objectNameSingulars)
          ? currentWatchedObjectNameSingulars
          : objectNameSingulars,
      );

      // Objects still watched keep their count so the component does not see a change that did not happen.
      setRecordChangeCounters((currentRecordChangeCounters) =>
        Object.fromEntries(
          objectNameSingulars.map((objectNameSingular) => [
            objectNameSingular,
            Object.hasOwn(currentRecordChangeCounters, objectNameSingular)
              ? currentRecordChangeCounters[objectNameSingular]
              : 0,
          ]),
        ),
      );

      return { status: 'watching', objectNameSingulars };
    };

  return {
    watchRecordChanges,
    recordChangeCounters: isWatching ? recordChangeCounters : undefined,
  };
};
