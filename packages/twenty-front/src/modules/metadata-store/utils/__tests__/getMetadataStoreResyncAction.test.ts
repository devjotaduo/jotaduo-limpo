import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { getMetadataStoreResyncAction } from '@/metadata-store/utils/getMetadataStoreResyncAction';

type EventDetail = MetadataOperationBrowserEventDetail<Record<string, unknown>>;

const buildApplicationUpdateEvent = (updatedFields: string[]): EventDetail => ({
  metadataName: 'application',
  operation: {
    type: 'update',
    updatedRecord: { id: 'application-id', version: '1.1.0' },
    updatedFields,
  },
});

describe('getMetadataStoreResyncAction', () => {
  it('should fully resync when an application version is updated', () => {
    expect(
      getMetadataStoreResyncAction(
        buildApplicationUpdateEvent(['name', 'version']),
      ),
    ).toBe('full-resync');
  });

  it('should fully resync when the post-migration application fields are updated', () => {
    expect(
      getMetadataStoreResyncAction(
        buildApplicationUpdateEvent([
          'settingsCustomTabFrontComponentId',
          'uninstallLogicFunctionId',
          'healthCheckLogicFunctionId',
        ]),
      ),
    ).toBe('full-resync');
  });

  it('should ignore an application update that only changes its label', () => {
    expect(
      getMetadataStoreResyncAction(buildApplicationUpdateEvent(['name'])),
    ).toBe('ignore');
  });

  it('should ignore an application update without updated fields', () => {
    expect(
      getMetadataStoreResyncAction({
        metadataName: 'application',
        operation: {
          type: 'update',
          updatedRecord: { id: 'application-id' },
        },
      }),
    ).toBe('ignore');
  });

  it('should fully resync when an application is created', () => {
    expect(
      getMetadataStoreResyncAction({
        metadataName: 'application',
        operation: {
          type: 'create',
          createdRecord: { id: 'application-id' },
        },
      }),
    ).toBe('full-resync');
  });

  it('should fully resync when an object is created', () => {
    expect(
      getMetadataStoreResyncAction({
        metadataName: 'objectMetadata',
        operation: {
          type: 'create',
          createdRecord: { id: 'object-id', nameSingular: 'invoice' },
        },
      }),
    ).toBe('full-resync');
  });

  it('should ignore an object update', () => {
    expect(
      getMetadataStoreResyncAction({
        metadataName: 'objectMetadata',
        operation: {
          type: 'update',
          updatedRecord: { id: 'object-id' },
          updatedFields: ['labelSingular'],
        },
      }),
    ).toBe('ignore');
  });

  it.each([
    'objectPermission',
    'fieldPermission',
    'permissionFlag',
    'rolePermissionFlag',
    'role',
    'roleTarget',
  ] as const)(
    'should reload the current user on a %s event',
    (metadataName) => {
      expect(
        getMetadataStoreResyncAction({
          metadataName,
          operation: { type: 'delete', deletedRecordId: 'record-id' },
        }),
      ).toBe('reload-current-user');
    },
  );

  it('should ignore an unrelated metadata event', () => {
    expect(
      getMetadataStoreResyncAction({
        metadataName: 'viewField',
        operation: {
          type: 'update',
          updatedRecord: { id: 'view-field-id' },
          updatedFields: ['position'],
        },
      }),
    ).toBe('ignore');
  });
});
