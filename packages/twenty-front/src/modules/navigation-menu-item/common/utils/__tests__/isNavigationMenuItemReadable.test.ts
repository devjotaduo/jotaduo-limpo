import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemReadable } from '@/navigation-menu-item/common/utils/isNavigationMenuItemReadable';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const READABLE_OBJECT_METADATA_ID = 'readable-object-metadata-id';
const RESTRICTED_OBJECT_METADATA_ID = 'restricted-object-metadata-id';

const OBJECT_PERMISSIONS_BY_OBJECT_METADATA_ID: ObjectPermissionsByObjectMetadataId =
  {
    [READABLE_OBJECT_METADATA_ID]: getDefaultObjectPermissions(
      READABLE_OBJECT_METADATA_ID,
    ),
    [RESTRICTED_OBJECT_METADATA_ID]: {
      ...getDefaultObjectPermissions(RESTRICTED_OBJECT_METADATA_ID),
      canReadObjectRecords: false,
    },
  };

const STANDALONE_PAGE_LAYOUTS = [
  { id: 'page-without-object', objectMetadataId: null },
  { id: 'readable-page', objectMetadataId: READABLE_OBJECT_METADATA_ID },
  { id: 'restricted-page', objectMetadataId: RESTRICTED_OBJECT_METADATA_ID },
  { id: 'unlisted-object-page', objectMetadataId: 'unlisted-object-id' },
];

const buildPageLayoutItem = (pageLayoutId: string) =>
  ({
    id: `item-${pageLayoutId}`,
    type: NavigationMenuItemType.PAGE_LAYOUT,
    pageLayoutId,
    position: 0,
  }) as NavigationMenuItem;

const isReadable = (
  item: NavigationMenuItem,
  overrides: Partial<Parameters<typeof isNavigationMenuItemReadable>[0]> = {},
) =>
  isNavigationMenuItemReadable({
    item,
    objectMetadataItems: [],
    views: [],
    objectPermissionsByObjectMetadataId:
      OBJECT_PERMISSIONS_BY_OBJECT_METADATA_ID,
    standalonePageLayouts: STANDALONE_PAGE_LAYOUTS,
    ...overrides,
  });

describe('isNavigationMenuItemReadable', () => {
  it('should keep folders and links visible', () => {
    expect(
      isReadable({
        id: 'folder',
        type: NavigationMenuItemType.FOLDER,
        position: 0,
      } as NavigationMenuItem),
    ).toBe(true);
    expect(
      isReadable({
        id: 'link',
        type: NavigationMenuItemType.LINK,
        position: 0,
      } as NavigationMenuItem),
    ).toBe(true);
  });

  it('should keep a page without an object visible', () => {
    expect(isReadable(buildPageLayoutItem('page-without-object'))).toBe(true);
  });

  it('should keep a page whose object the role can read visible', () => {
    expect(isReadable(buildPageLayoutItem('readable-page'))).toBe(true);
  });

  it('should hide a page whose object the role cannot read', () => {
    expect(isReadable(buildPageLayoutItem('restricted-page'))).toBe(false);
  });

  it('should keep a page visible when its object has no permission entry', () => {
    expect(isReadable(buildPageLayoutItem('unlisted-object-page'))).toBe(true);
  });

  it('should keep a page visible while the standalone pages are not loaded', () => {
    expect(
      isReadable(buildPageLayoutItem('restricted-page'), {
        standalonePageLayouts: [],
      }),
    ).toBe(true);
  });

  it('should keep a page visible when the role permissions are not loaded', () => {
    expect(
      isReadable(buildPageLayoutItem('restricted-page'), {
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toBe(true);
  });

  it('should hide an object item whose object the role cannot read', () => {
    const objectItem = {
      id: 'object-item',
      type: NavigationMenuItemType.OBJECT,
      targetObjectMetadataId: RESTRICTED_OBJECT_METADATA_ID,
      position: 0,
    } as NavigationMenuItem;
    const objectMetadataItems = [
      { id: RESTRICTED_OBJECT_METADATA_ID, isActive: true },
    ] as EnrichedObjectMetadataItem[];

    expect(isReadable(objectItem, { objectMetadataItems })).toBe(false);
  });
});
