import { renderHook } from '@testing-library/react';

import { useFrontComponentPickAndUploadFile } from '@/front-components/hooks/useFrontComponentPickAndUploadFile';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock('@/object-metadata/utils/getFieldMetadataItemById', () => ({
  getFieldMetadataItemById: (parameters: { fieldMetadataId: string }) => ({
    fieldMetadataItem:
      parameters.fieldMetadataId === 'files-field-id'
        ? { id: 'files-field-id', type: 'FILES' }
        : parameters.fieldMetadataId === 'text-field-id'
          ? { id: 'text-field-id', type: 'TEXT' }
          : undefined,
  }),
}));

const mockPickFileFromComputer = jest.fn();

jest.mock('@/front-components/utils/pickFileFromComputer', () => ({
  pickFileFromComputer: (...args: unknown[]) =>
    mockPickFileFromComputer(...args),
}));

const mockUploadFile = jest.fn();

const UPLOADED_FILE = {
  fileId: 'file-1',
  path: 'files/file-1.pdf',
  url: 'https://example.com/file-1.pdf',
  size: 7,
  mimeType: 'application/pdf',
};

const renderPickAndUploadFile = () =>
  renderHook(() =>
    useFrontComponentPickAndUploadFile({ uploadFile: mockUploadFile }),
  ).result.current.pickAndUploadFile;

describe('useFrontComponentPickAndUploadFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload the picked file to the field and return it with its name as label', async () => {
    const file = new File(['content'], 'contract.pdf', {
      type: 'application/pdf',
    });
    mockPickFileFromComputer.mockResolvedValue(file);
    mockUploadFile.mockResolvedValue({
      status: 'uploaded',
      file: UPLOADED_FILE,
    });

    const pickAndUploadFile = renderPickAndUploadFile();

    await expect(
      pickAndUploadFile({ fieldMetadataId: 'files-field-id', accept: '.pdf' }),
    ).resolves.toEqual({
      status: 'uploaded',
      file: { ...UPLOADED_FILE, label: 'contract.pdf' },
    });
    expect(mockPickFileFromComputer).toHaveBeenCalledWith({ accept: '.pdf' });
    expect(mockUploadFile).toHaveBeenCalledWith(file, {
      fieldMetadataId: 'files-field-id',
      fileName: 'contract.pdf',
    });
  });

  it('should return cancelled without uploading when no file is picked', async () => {
    mockPickFileFromComputer.mockResolvedValue(null);

    const pickAndUploadFile = renderPickAndUploadFile();

    await expect(
      pickAndUploadFile({ fieldMetadataId: 'files-field-id' }),
    ).resolves.toEqual({ status: 'cancelled' });
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  it.each([
    {
      description: 'a non-FILES field',
      params: { fieldMetadataId: 'text-field-id' },
    },
    {
      description: 'an unknown field',
      params: { fieldMetadataId: 'unknown-field-id' },
    },
    { description: 'an empty field id', params: { fieldMetadataId: '' } },
    {
      description: 'a non-string accept',
      params: { fieldMetadataId: 'files-field-id', accept: 42 },
    },
  ])(
    'should reject $description before opening the picker',
    async ({ params }) => {
      const pickAndUploadFile = renderPickAndUploadFile();

      await expect(
        pickAndUploadFile(params as Parameters<typeof pickAndUploadFile>[0]),
      ).resolves.toEqual({ status: 'failed', reason: 'invalid-params' });
      expect(mockPickFileFromComputer).not.toHaveBeenCalled();
    },
  );

  it('should refuse a second picker while one is open', async () => {
    let cancelPicker: (file: null) => void = () => {};
    mockPickFileFromComputer.mockImplementationOnce(
      () =>
        new Promise<null>((resolve) => {
          cancelPicker = resolve;
        }),
    );

    const pickAndUploadFile = renderPickAndUploadFile();
    const firstPick = pickAndUploadFile({ fieldMetadataId: 'files-field-id' });

    await expect(
      pickAndUploadFile({ fieldMetadataId: 'files-field-id' }),
    ).resolves.toEqual({ status: 'failed', reason: 'picker-busy' });

    cancelPicker(null);
    await expect(firstPick).resolves.toEqual({ status: 'cancelled' });

    mockPickFileFromComputer.mockResolvedValue(null);
    await expect(
      pickAndUploadFile({ fieldMetadataId: 'files-field-id' }),
    ).resolves.toEqual({ status: 'cancelled' });
  });

  it('should report an unavailable picker when the browser refuses to open it', async () => {
    mockPickFileFromComputer.mockRejectedValue(
      new DOMException('Blocked', 'NotAllowedError'),
    );

    const pickAndUploadFile = renderPickAndUploadFile();

    await expect(
      pickAndUploadFile({ fieldMetadataId: 'files-field-id' }),
    ).resolves.toEqual({ status: 'failed', reason: 'picker-unavailable' });
  });

  it('should forward an upload failure', async () => {
    mockPickFileFromComputer.mockResolvedValue(
      new File(['content'], 'contract.pdf', { type: 'application/pdf' }),
    );
    mockUploadFile.mockResolvedValue({
      status: 'failed',
      reason: 'upload-failed',
    });

    const pickAndUploadFile = renderPickAndUploadFile();

    await expect(
      pickAndUploadFile({ fieldMetadataId: 'files-field-id' }),
    ).resolves.toEqual({ status: 'failed', reason: 'upload-failed' });
  });
});
