import { gql } from '@apollo/client';

export const DESTROY_PAGE_LAYOUT = gql`
  mutation DestroyPageLayout($id: String!) {
    destroyPageLayout(id: $id)
  }
`;
