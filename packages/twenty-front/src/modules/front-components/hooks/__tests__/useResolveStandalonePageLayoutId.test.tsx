import { renderHook } from '@testing-library/react';

import { useResolveStandalonePageLayoutId } from '@/front-components/hooks/useResolveStandalonePageLayoutId';

const mockQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ query: mockQuery }),
}));

const STANDALONE_PAGE_LAYOUTS = [
  { id: 'page-layout-id', universalIdentifier: 'page-layout-uid' },
];

const renderResolveStandalonePageLayoutId = () =>
  renderHook(() => useResolveStandalonePageLayoutId()).result.current
    .resolveStandalonePageLayoutId;

describe('useResolveStandalonePageLayoutId', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('should resolve a universalIdentifier from the cached standalone pages', async () => {
    mockQuery.mockResolvedValue({
      data: { getPageLayouts: STANDALONE_PAGE_LAYOUTS },
    });

    const resolveStandalonePageLayoutId = renderResolveStandalonePageLayoutId();

    await expect(
      resolveStandalonePageLayoutId('page-layout-uid'),
    ).resolves.toBe('page-layout-id');
    await expect(resolveStandalonePageLayoutId('page-layout-id')).resolves.toBe(
      'page-layout-id',
    );
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({ fetchPolicy: 'cache-first' }),
    );
  });

  it('should refetch when the value is missing from the cached list', async () => {
    mockQuery
      .mockResolvedValueOnce({ data: { getPageLayouts: [] } })
      .mockResolvedValueOnce({
        data: { getPageLayouts: STANDALONE_PAGE_LAYOUTS },
      });

    const resolveStandalonePageLayoutId = renderResolveStandalonePageLayoutId();

    await expect(
      resolveStandalonePageLayoutId('page-layout-uid'),
    ).resolves.toBe('page-layout-id');
    expect(mockQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ fetchPolicy: 'network-only' }),
    );
  });

  it('should keep the value when the lookup fails', async () => {
    mockQuery.mockRejectedValue(new Error('network down'));

    const resolveStandalonePageLayoutId = renderResolveStandalonePageLayoutId();

    await expect(resolveStandalonePageLayoutId('page-layout-id')).resolves.toBe(
      'page-layout-id',
    );
  });
});
