import { useQuery } from '@apollo/client/react';
import { act, renderHook } from '@testing-library/react';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useReadableNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useReadableNavigationMenuItems';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockRefetch = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useQuery: jest.fn(),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: (state: unknown) =>
    state === isLayoutCustomizationModeEnabledState ? false : [],
}));
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({
    objectPermissionsByObjectMetadataId: {
      'restricted-object': {
        objectMetadataId: 'restricted-object',
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
    },
  }),
}));

const FOLDER: NavigationMenuItem = {
  id: 'folder',
  type: NavigationMenuItemType.FOLDER,
  name: 'New folder',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const PAGE_LAYOUT_ITEM: NavigationMenuItem = {
  ...FOLDER,
  id: 'restricted-page-item',
  type: NavigationMenuItemType.PAGE_LAYOUT,
  name: 'Restricted page',
  pageLayoutId: 'restricted-page',
};

describe('useReadableNavigationMenuItems', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRefetch.mockReset().mockResolvedValue({});
    mockUseQuery.mockReset().mockReturnValue({
      refetch: mockRefetch,
      data: {
        getPageLayouts: [
          { id: 'restricted-page', objectMetadataId: 'restricted-object' },
        ],
      },
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('keeps empty Favorites folders visible for renaming and adding items', () => {
    const folder = { ...FOLDER, userWorkspaceId: 'user-workspace' };
    const { result } = renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [folder],
        folderChildrenById: new Map(),
      }),
    );
    expect(result.current.displayTopLevelItems).toEqual([folder]);
  });

  it('continues hiding empty workspace folders outside customization', () => {
    const { result } = renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [FOLDER],
        folderChildrenById: new Map(),
      }),
    );
    expect(result.current.displayTopLevelItems).toEqual([]);
  });

  it('keeps the Favorites folder without exposing unreadable children', () => {
    const folder = { ...FOLDER, userWorkspaceId: 'user-workspace' };
    const unreadableItem = {
      ...FOLDER,
      id: 'object',
      folderId: folder.id,
      type: NavigationMenuItemType.OBJECT,
      targetObjectMetadataId: 'inaccessible',
    };
    const { result } = renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [folder],
        folderChildrenById: new Map([[folder.id, [unreadableItem]]]),
      }),
    );
    expect(result.current.displayTopLevelItems).toEqual([folder]);
    expect(result.current.displayFolderChildrenById.get(folder.id)).toEqual([]);
  });

  it('hides a page whose object the role cannot read, also inside folders', () => {
    const pageInFolder = { ...PAGE_LAYOUT_ITEM, folderId: FOLDER.id };
    const { result } = renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [PAGE_LAYOUT_ITEM, FOLDER],
        folderChildrenById: new Map([[FOLDER.id, [pageInFolder]]]),
      }),
    );
    expect(result.current.displayTopLevelItems).toEqual([]);
    expect(result.current.displayFolderChildrenById.get(FOLDER.id)).toEqual([]);
  });

  it('refreshes a new restricted page installed while the menu is open', async () => {
    let pages: { id: string; objectMetadataId: string | null }[] = [];
    mockUseQuery.mockImplementation(() => ({
      data: { getPageLayouts: pages },
      refetch: mockRefetch,
    }));
    mockRefetch.mockImplementation(async () => {
      pages = [
        { id: 'restricted-page', objectMetadataId: 'restricted-object' },
      ];
    });
    const { result, rerender } = renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [PAGE_LAYOUT_ITEM],
        folderChildrenById: new Map(),
      }),
    );
    expect(result.current.displayTopLevelItems).toEqual([PAGE_LAYOUT_ITEM]);
    act(() =>
      dispatchMetadataOperationBrowserEvent({
        metadataName: 'pageLayout',
        operation: {
          type: 'create',
          createdRecord: {
            id: 'restricted-page',
            objectMetadataId: 'restricted-object',
          },
        },
      }),
    );
    await act(async () => {
      jest.advanceTimersByTime(2_000);
    });
    rerender();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(result.current.displayTopLevelItems).toEqual([]);
  });

  it.each(['create', 'update', 'delete'] as const)(
    'refreshes when a page layout receives a %s event',
    async (type) => {
      renderHook(() =>
        useReadableNavigationMenuItems({
          topLevelItems: [PAGE_LAYOUT_ITEM],
          folderChildrenById: new Map(),
        }),
      );
      act(() =>
        dispatchMetadataOperationBrowserEvent({
          metadataName: 'pageLayout',
          operation:
            type === 'create'
              ? { type, createdRecord: { id: 'restricted-page' } }
              : type === 'update'
                ? {
                    type,
                    updatedRecord: { id: 'restricted-page' },
                    updatedFields: ['objectMetadataId'],
                  }
                : { type, deletedRecordId: 'restricted-page' },
        }),
      );
      await act(async () => {
        jest.advanceTimersByTime(2_000);
      });
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    },
  );

  it('coalesces app updates and menu events into one refresh', async () => {
    renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [PAGE_LAYOUT_ITEM],
        folderChildrenById: new Map(),
      }),
    );
    act(() => {
      dispatchMetadataOperationBrowserEvent({
        metadataName: 'application',
        operation: {
          type: 'update',
          updatedRecord: { id: 'app' },
          updatedFields: ['version'],
        },
      });
      dispatchMetadataOperationBrowserEvent({
        metadataName: 'navigationMenuItem',
        operation: { type: 'create', createdRecord: PAGE_LAYOUT_ITEM },
      });
    });
    await act(async () => {
      jest.advanceTimersByTime(2_000);
    });
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('refreshes after reconnecting to recover missed page updates', async () => {
    renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [PAGE_LAYOUT_ITEM],
        folderChildrenById: new Map(),
      }),
    );
    act(() => dispatchBrowserEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME));
    await act(async () => {
      jest.advanceTimersByTime(2_000);
    });
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('does not refresh pages when the menu has none', async () => {
    renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [FOLDER],
        folderChildrenById: new Map(),
      }),
    );
    act(() => {
      dispatchMetadataOperationBrowserEvent({
        metadataName: 'pageLayout',
        operation: { type: 'delete', deletedRecordId: 'page' },
      });
      dispatchBrowserEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME);
    });
    await act(async () => {
      jest.advanceTimersByTime(2_000);
    });
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('keeps a page visible until the standalone pages are loaded', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() =>
      useReadableNavigationMenuItems({
        topLevelItems: [PAGE_LAYOUT_ITEM],
        folderChildrenById: new Map(),
      }),
    );
    expect(result.current.displayTopLevelItems).toEqual([PAGE_LAYOUT_ITEM]);
  });
});
