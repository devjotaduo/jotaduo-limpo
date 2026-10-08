import { gql } from '@apollo/client';

export const FIND_MANY_STANDALONE_PAGE_LAYOUT_OBJECT_METADATA_IDS = gql`
  query FindManyStandalonePageLayoutObjectMetadataIds {
    getPageLayouts(pageLayoutType: STANDALONE_PAGE) {
      id
      objectMetadataId
    }
  }
`;
