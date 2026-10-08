import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { useFrontComponentWatchRecordChanges } from '@/front-components/hooks/useFrontComponentWatchRecordChanges';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { SSE_RESYNC_DEBOUNCE_TIME_IN_MS } from '@/sse-db-event/constants/SseResyncDebounceTimeInMs';
import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';

const APPLICATION_ID = 'application-id';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      { nameSingular: 'message', applicationId: 'application-id' },
      { nameSingular: 'conversation', applicationId: 'application-id' },
      { nameSingular: 'contact', applicationId: 'application-id' },
      { nameSingular: 'invoice', applicationId: 'other-application-id' },
      { nameSingular: 'person', applicationId: 'standard-application-id' },
    ],
  }),
}));

type WatchRecordChangesParams = Parameters<
  ReturnType<typeof useFrontComponentWatchRecordChanges>['watchRecordChanges']
>[0];

const renderWatchRecordChanges = () =>
  renderHook(() =>
    useFrontComponentWatchRecordChanges({ applicationId: APPLICATION_ID }),
  );

const watch = async (
  result: ReturnType<typeof renderWatchRecordChanges>['result'],
  params: WatchRecordChangesParams,
) => {
  let watchResult:
    | Awaited<ReturnType<typeof result.current.watchRecordChanges>>
    | undefined;

  await act(async () => {
    watchResult = await result.current.watchRecordChanges(params);
  });

  return watchResult;
};

const dispatchRecordsCreated = (objectNameSingular: string) => {
  act(() => {
    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem: { nameSingular: objectNameSingular },
      operation: { type: 'create-many' },
    } as ObjectRecordOperationBrowserEventDetail);
  });
};

const getListenedOperationSignatures = () =>
  getDefaultStore()
    .get(requiredQueryListenersState.atom)
    .map((queryListener) => queryListener.operationSignature);

describe('useFrontComponentWatchRecordChanges', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    getDefaultStore().set(requiredQueryListenersState.atom, []);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should accept objects of the calling app and listen to them on the event stream until unmount', async () => {
    const { result, unmount } = renderWatchRecordChanges();

    await expect(
      watch(result, {
        objectNameSingulars: ['message', 'conversation', 'message'],
      }),
    ).resolves.toEqual({
      status: 'watching',
      objectNameSingulars: ['conversation', 'message'],
    });

    expect(result.current.recordChangeCounters).toEqual({
      conversation: 0,
      message: 0,
    });
    expect(getListenedOperationSignatures()).toEqual([
      { objectNameSingular: 'conversation', variables: {} },
      { objectNameSingular: 'message', variables: {} },
    ]);

    unmount();

    expect(getListenedOperationSignatures()).toEqual([]);
  });

  it('should count changes of watched objects only', async () => {
    const { result } = renderWatchRecordChanges();

    await watch(result, { objectNameSingulars: ['message'] });

    dispatchRecordsCreated('contact');

    expect(result.current.recordChangeCounters).toEqual({ message: 0 });

    dispatchRecordsCreated('message');

    expect(result.current.recordChangeCounters).toEqual({ message: 1 });
  });

  it('should collapse a burst of changes into one more change after the throttle window', async () => {
    const { result } = renderWatchRecordChanges();

    await watch(result, { objectNameSingulars: ['message', 'conversation'] });

    dispatchRecordsCreated('message');

    expect(result.current.recordChangeCounters).toEqual({
      conversation: 0,
      message: 1,
    });

    dispatchRecordsCreated('message');
    dispatchRecordsCreated('conversation');
    dispatchRecordsCreated('message');

    expect(result.current.recordChangeCounters).toEqual({
      conversation: 0,
      message: 1,
    });

    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(result.current.recordChangeCounters).toEqual({
      conversation: 1,
      message: 2,
    });
  });

  it('should keep the count of objects still watched when the list changes', async () => {
    const { result } = renderWatchRecordChanges();

    await watch(result, { objectNameSingulars: ['message', 'conversation'] });
    dispatchRecordsCreated('message');
    await watch(result, { objectNameSingulars: ['contact', 'message'] });

    expect(result.current.recordChangeCounters).toEqual({
      contact: 0,
      message: 1,
    });
    expect(getListenedOperationSignatures()).toEqual(
      expect.arrayContaining([
        { objectNameSingular: 'contact', variables: {} },
        { objectNameSingular: 'message', variables: {} },
      ]),
    );
    expect(getListenedOperationSignatures()).toHaveLength(2);
  });

  it('should stop watching when called with an empty list', async () => {
    const { result } = renderWatchRecordChanges();

    await watch(result, { objectNameSingulars: ['message'] });

    await expect(watch(result, { objectNameSingulars: [] })).resolves.toEqual({
      status: 'watching',
      objectNameSingulars: [],
    });

    dispatchRecordsCreated('message');

    expect(result.current.recordChangeCounters).toBeUndefined();
    expect(getListenedOperationSignatures()).toEqual([]);
  });

  it('should report every watched object as changed once the event stream reconnects', async () => {
    const { result } = renderWatchRecordChanges();

    await watch(result, { objectNameSingulars: ['message', 'conversation'] });

    act(() => {
      dispatchBrowserEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME);
    });

    expect(result.current.recordChangeCounters).toEqual({
      conversation: 0,
      message: 0,
    });

    act(() => {
      jest.advanceTimersByTime(SSE_RESYNC_DEBOUNCE_TIME_IN_MS);
    });

    expect(result.current.recordChangeCounters).toEqual({
      conversation: 1,
      message: 1,
    });
  });

  it.each([
    { description: 'no params', params: undefined, reason: 'invalid-params' },
    { description: 'a missing list', params: {}, reason: 'invalid-params' },
    {
      description: 'a list that is not an array',
      params: { objectNameSingulars: 'message' },
      reason: 'invalid-params',
    },
    {
      description: 'a name that is not a string',
      params: { objectNameSingulars: ['message', 42] },
      reason: 'invalid-params',
    },
    {
      description: 'an empty name',
      params: { objectNameSingulars: [''] },
      reason: 'invalid-params',
    },
    {
      description: 'more objects than the cap',
      params: {
        objectNameSingulars: Array.from(
          { length: 11 },
          (_, index) => `object${index}`,
        ),
      },
      reason: 'invalid-params',
    },
    {
      description: 'an unknown object',
      params: { objectNameSingulars: ['message', 'opportunityLine'] },
      reason: 'unknown-object',
    },
    {
      description: 'an object of another app',
      params: { objectNameSingulars: ['message', 'invoice'] },
      reason: 'object-not-owned',
    },
    {
      description: 'a standard object',
      params: { objectNameSingulars: ['person'] },
      reason: 'object-not-owned',
    },
    {
      description: 'a filter',
      params: {
        objectNameSingulars: ['message'],
        filter: { conversationId: { eq: 'conversation-1' } },
      },
      reason: 'filter-not-supported',
    },
  ])(
    'should refuse $description without listening to anything',
    async ({ params, reason }) => {
      const { result } = renderWatchRecordChanges();

      await expect(
        watch(result, params as WatchRecordChangesParams),
      ).resolves.toEqual({ status: 'failed', reason });

      expect(result.current.recordChangeCounters).toBeUndefined();
      expect(getListenedOperationSignatures()).toEqual([]);
    },
  );
});
