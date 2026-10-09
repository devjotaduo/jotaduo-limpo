import { validate } from 'class-validator';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { fromUpdatePageLayoutInputToFlatPageLayoutToUpdateOrThrow } from 'src/engine/metadata-modules/flat-page-layout/utils/from-update-page-layout-input-to-flat-page-layout-to-update-or-throw.util';
import { UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import { PageLayoutType } from 'twenty-shared/types';

const PAGE_LAYOUT_ID = '11111111-1111-4111-8111-111111111111';
const PAGE_LAYOUT_UID = '22222222-2222-4222-8222-222222222222';
const TAB_ID = '33333333-3333-4333-8333-333333333333';
const APP_ID = '44444444-4444-4444-8444-444444444444';

const existing: FlatPageLayout = {
  id: PAGE_LAYOUT_ID,
  universalIdentifier: PAGE_LAYOUT_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_ID,
  workspaceId: '55555555-5555-4555-8555-555555555555',
  name: 'Operations',
  type: PageLayoutType.STANDALONE_PAGE,
  isFirstTabPinned: true,
  isSystemSideEffect: false,
  objectMetadataId: null,
  objectMetadataUniversalIdentifier: null,
  defaultTabToFocusOnMobileAndSidePanelId: TAB_ID,
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: TAB_ID,
  tabIds: [TAB_ID],
  tabUniversalIdentifiers: [TAB_ID],
  navigationMenuItemIds: [PAGE_LAYOUT_UID],
  navigationMenuItemUniversalIdentifiers: [PAGE_LAYOUT_UID],
  createdAt: '2026-10-09T08:00:00.000Z',
  updatedAt: '2026-10-09T08:00:00.000Z',
  deletedAt: null,
};

describe('updating page layout pinning', () => {
  it.each([true, false])(
    'changes only pinning to %s, preserving tabs and navigation',
    (isFirstTabPinned) => {
      const original = { ...existing, isFirstTabPinned: !isFirstTabPinned };
      const result = fromUpdatePageLayoutInputToFlatPageLayoutToUpdateOrThrow({
        updatePageLayoutInput: {
          id: PAGE_LAYOUT_ID,
          update: { isFirstTabPinned },
        },
        flatPageLayoutMaps: {
          ...createEmptyFlatEntityMaps(),
          byUniversalIdentifier: { [PAGE_LAYOUT_UID]: original },
          universalIdentifierById: { [PAGE_LAYOUT_ID]: PAGE_LAYOUT_UID },
        },
        flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      });

      expect(result).toEqual({ ...original, isFirstTabPinned });
      expect(original.isFirstTabPinned).toBe(!isFirstTabPinned);
    },
  );

  it.each([true, false, undefined])(
    'accepts the optional boolean choice: %s',
    async (isFirstTabPinned) => {
      const input = Object.assign(new UpdatePageLayoutInput(), {
        isFirstTabPinned,
      });
      expect(await validate(input)).toEqual([]);
    },
  );

  it.each(['true', 1, {}])(
    'rejects an invalid pinned choice: %s',
    async (isFirstTabPinned) => {
      const input = Object.assign(new UpdatePageLayoutInput(), {
        isFirstTabPinned,
      });
      const errors = await validate(input);
      expect(
        errors.some((error) => error.property === 'isFirstTabPinned'),
      ).toBe(true);
    },
  );
});
