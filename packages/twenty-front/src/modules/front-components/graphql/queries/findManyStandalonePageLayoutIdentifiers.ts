import gql from 'graphql-tag';

export const FIND_MANY_STANDALONE_PAGE_LAYOUT_IDENTIFIERS = gql`
  query FindManyStandalonePageLayoutIdentifiers {
    getPageLayouts(pageLayoutType: STANDALONE_PAGE) {
      id
      universalIdentifier
    }
  }
`;
