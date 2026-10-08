import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

export type WatchRecordChangesParams = {
  // An empty list stops watching
  objectNameSingulars: string[];
};

export type WatchRecordChangesResult =
  | { status: 'watching'; objectNameSingulars: string[] }
  | {
      status: 'failed';
      reason:
        | 'invalid-params'
        | 'unknown-object'
        // Only objects of the calling app can be watched
        | 'object-not-owned'
        | 'filter-not-supported'
        | 'unavailable';
    };

// Values only grow and bursts are coalesced, so a component compares them with the last value it read instead of counting.
export type FrontComponentRecordChangeCounters = Record<string, number>;

// Not in twenty-sdk yet: apps read recordChangeCounters through the SDK execution context hooks.
export type FrontComponentHostExecutionContext =
  FrontComponentExecutionContext & {
    recordChangeCounters?: FrontComponentRecordChangeCounters;
  };

// Not in twenty-sdk yet: apps call it through globalThis.frontComponentHostCommunicationApi.
export type WatchRecordChangesFunction = (
  params: WatchRecordChangesParams,
) => Promise<WatchRecordChangesResult>;
