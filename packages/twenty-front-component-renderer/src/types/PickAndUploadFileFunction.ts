import {
  type UploadedFrontComponentFile,
  type UploadFileFailureReason,
} from 'twenty-sdk/front-component';

export type PickAndUploadFileParams = {
  // Id or universalIdentifier of a FILES field, for the same reason as uploadFile
  fieldMetadataId: string;
  accept?: string;
};

export type PickAndUploadFileResult =
  | {
      status: 'uploaded';
      file: UploadedFrontComponentFile & { label: string };
    }
  | { status: 'cancelled' }
  | {
      status: 'failed';
      reason: UploadFileFailureReason | 'picker-busy' | 'picker-unavailable';
    };

// Not in twenty-sdk yet: apps call it through globalThis.frontComponentHostCommunicationApi.
export type PickAndUploadFileFunction = (
  params: PickAndUploadFileParams,
) => Promise<PickAndUploadFileResult>;
