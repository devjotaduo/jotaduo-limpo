import { gql } from '@apollo/client';

export const CREATE_STANDALONE_PAGE_LAYOUT = gql`
  mutation CreateStandalonePageLayout($input: CreatePageLayoutInput!) {
    createPageLayout(input: $input) {
      id
      name
      type
    }
  }
`;
