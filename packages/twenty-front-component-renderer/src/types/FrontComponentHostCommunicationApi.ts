import {
  type CloseSidePanelFunction,
  type CopyToClipboardFunction,
  type EnqueueSnackbarFunction,
  type NavigateFunction,
  type OpenCommandConfirmationModalHostFunction,
  type OpenSidePanelPageFunction,
  type RequestAccessTokenRefreshFunction,
  type StorageClearFunction,
  type StorageDeleteFunction,
  type StorageSetFunction,
  type UnmountFrontComponentFunction,
  type UpdateProgressFunction,
  type UploadFileFunction,
} from 'twenty-sdk/front-component';

import { type PickAndUploadFileFunction } from '@/types/PickAndUploadFileFunction';
import { type WatchRecordChangesFunction } from '@/types/WatchRecordChangesFunction';

export type FrontComponentHostCommunicationApi = {
  navigate: NavigateFunction;
  requestAccessTokenRefresh: RequestAccessTokenRefreshFunction;
  openSidePanelPage: OpenSidePanelPageFunction;
  openCommandConfirmationModal: OpenCommandConfirmationModalHostFunction;
  unmountFrontComponent: UnmountFrontComponentFunction;
  enqueueSnackbar: EnqueueSnackbarFunction;
  closeSidePanel: CloseSidePanelFunction;
  updateProgress: UpdateProgressFunction;
  copyToClipboard: CopyToClipboardFunction;
  uploadFile: UploadFileFunction;
  pickAndUploadFile: PickAndUploadFileFunction;
  watchRecordChanges: WatchRecordChangesFunction;
  storageSet: StorageSetFunction;
  storageDelete: StorageDeleteFunction;
  storageClear: StorageClearFunction;
};
