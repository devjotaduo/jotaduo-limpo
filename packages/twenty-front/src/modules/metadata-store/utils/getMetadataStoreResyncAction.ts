import { type BroadcastEntityName } from '@/browser-event/types/BroadcastEntityName';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type MetadataStoreResyncAction } from '@/metadata-store/types/MetadataStoreResyncAction';

// Install, upgrade and sync write these application fields next to the metadata
// they apply, so an update touching them means a new app version is landing
const APPLICATION_FIELDS_UPDATED_BY_APPLICATION_SYNC = [
  'version',
  'settingsCustomTabFrontComponentId',
  'uninstallLogicFunctionId',
  'healthCheckLogicFunctionId',
  'defaultRoleId',
];

// The current user's permissions come from the current user query, not from
// the metadata store, so these events only reach the UI through a user reload
const CURRENT_USER_PERMISSION_METADATA_NAMES: BroadcastEntityName[] = [
  'role',
  'roleTarget',
  'objectPermission',
  'fieldPermission',
  'permissionFlag',
  'rolePermissionFlag',
  'rowLevelPermissionPredicate',
  'rowLevelPermissionPredicateGroup',
];

export const getMetadataStoreResyncAction = ({
  metadataName,
  operation,
}: MetadataOperationBrowserEventDetail<
  Record<string, unknown>
>): MetadataStoreResyncAction => {
  if (metadataName === 'application') {
    if (operation.type === 'create') {
      return 'full-resync';
    }

    const updatedFields =
      operation.type === 'update' ? (operation.updatedFields ?? []) : [];

    const isApplicationSyncUpdate = updatedFields.some((updatedField) =>
      APPLICATION_FIELDS_UPDATED_BY_APPLICATION_SYNC.includes(updatedField),
    );

    return isApplicationSyncUpdate ? 'full-resync' : 'ignore';
  }

  // A new object is missing from the loaded object permissions and its
  // relations reach existing objects, which incremental updates do not cover
  if (metadataName === 'objectMetadata' && operation.type === 'create') {
    return 'full-resync';
  }

  if (CURRENT_USER_PERMISSION_METADATA_NAMES.includes(metadataName)) {
    return 'reload-current-user';
  }

  return 'ignore';
};
