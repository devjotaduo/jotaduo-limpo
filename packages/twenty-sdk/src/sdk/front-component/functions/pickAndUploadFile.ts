import { isDefined } from 'twenty-shared/utils';

import {
  type PickAndUploadFileFunction,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

export const pickAndUploadFile: PickAndUploadFileFunction = (params) => {
  const pickAndUploadFileFunction =
    frontComponentHostCommunicationApi.pickAndUploadFile;

  if (!isDefined(pickAndUploadFileFunction)) {
    throw new Error('pickAndUploadFileFunction is not set');
  }

  return pickAndUploadFileFunction(params);
};
