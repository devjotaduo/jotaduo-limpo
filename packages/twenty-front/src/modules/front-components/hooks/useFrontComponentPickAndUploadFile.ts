import { pickFileFromComputer } from '@/front-components/utils/pickFileFromComputer';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { useRef } from 'react';
import { type FrontComponentHostCommunicationApi } from 'twenty-front-component-renderer';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useFrontComponentPickAndUploadFile = ({
  uploadFile,
}: {
  uploadFile: FrontComponentHostCommunicationApi['uploadFile'];
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  // oxlint-disable-next-line twenty/no-state-useref
  const isFilePickerOpenRef = useRef(false);

  const pickAndUploadFile: FrontComponentHostCommunicationApi['pickAndUploadFile'] =
    async (params) => {
      // Sandboxed input, checked before opening a picker whose file could never be attached.
      if (
        !isDefined(params) ||
        !isNonEmptyString(params.fieldMetadataId) ||
        (isDefined(params.accept) && !isString(params.accept))
      ) {
        return { status: 'failed', reason: 'invalid-params' };
      }

      const { fieldMetadataItem } = getFieldMetadataItemById({
        fieldMetadataId: params.fieldMetadataId,
        objectMetadataItems,
      });

      if (fieldMetadataItem?.type !== FieldMetadataType.FILES) {
        return { status: 'failed', reason: 'invalid-params' };
      }

      // A second click while the native dialog is open must not queue another one behind it.
      if (isFilePickerOpenRef.current) {
        return { status: 'failed', reason: 'picker-busy' };
      }

      isFilePickerOpenRef.current = true;

      let file: File | null;

      try {
        file = await pickFileFromComputer({ accept: params.accept });
      } catch {
        return { status: 'failed', reason: 'picker-unavailable' };
      } finally {
        isFilePickerOpenRef.current = false;
      }

      if (!isDefined(file)) {
        return { status: 'cancelled' };
      }

      const uploadResult = await uploadFile(file, {
        fieldMetadataId: params.fieldMetadataId,
        fileName: file.name,
      });

      if (uploadResult.status !== 'uploaded') {
        return uploadResult;
      }

      return {
        status: 'uploaded',
        file: { ...uploadResult.file, label: file.name },
      };
    };

  return { pickAndUploadFile };
};
