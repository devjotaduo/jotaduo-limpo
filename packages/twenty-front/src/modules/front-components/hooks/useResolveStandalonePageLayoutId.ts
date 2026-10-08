import { FIND_MANY_STANDALONE_PAGE_LAYOUT_IDENTIFIERS } from '@/front-components/graphql/queries/findManyStandalonePageLayoutIdentifiers';
import { resolveIdFromIdOrUniversalIdentifier } from '@/front-components/utils/resolveIdFromIdOrUniversalIdentifier';
import { useApolloClient } from '@apollo/client/react';

type StandalonePageLayoutIdentifiersQuery = {
  getPageLayouts: { id: string; universalIdentifier: string }[];
};

// The metadata store only holds record page and record form layouts, so standalone pages have to be fetched.
export const useResolveStandalonePageLayoutId = () => {
  const apolloClient = useApolloClient();

  const findStandalonePageLayouts = async (
    fetchPolicy: 'cache-first' | 'network-only',
  ) => {
    const { data } =
      await apolloClient.query<StandalonePageLayoutIdentifiersQuery>({
        query: FIND_MANY_STANDALONE_PAGE_LAYOUT_IDENTIFIERS,
        fetchPolicy,
      });

    return data?.getPageLayouts ?? [];
  };

  const resolveStandalonePageLayoutId = async (
    pageLayoutIdOrUniversalIdentifier: string,
  ): Promise<string> => {
    try {
      const cachedPageLayouts = await findStandalonePageLayouts('cache-first');

      const isKnownPageLayout = cachedPageLayouts.some(
        (pageLayout) =>
          pageLayout.id === pageLayoutIdOrUniversalIdentifier ||
          pageLayout.universalIdentifier === pageLayoutIdOrUniversalIdentifier,
      );

      // A page installed after the first lookup is missing from the cached list.
      const pageLayouts = isKnownPageLayout
        ? cachedPageLayouts
        : await findStandalonePageLayouts('network-only');

      return resolveIdFromIdOrUniversalIdentifier({
        idOrUniversalIdentifier: pageLayoutIdOrUniversalIdentifier,
        items: pageLayouts,
      });
    } catch {
      // Navigating with the raw value keeps id-based callers working when the lookup fails.
      return pageLayoutIdOrUniversalIdentifier;
    }
  };

  return { resolveStandalonePageLayoutId };
};
