import { gql } from 'apollo-boost';

const updateSavedQuery = ({ queryUri, input }) => ({
  variables: {
    queryUri,
    input
  },
  mutation: gql`
    mutation UpdateSavedQuery(
      $queryUri: String!
      $input: ModifySavedQueryInput
    ) {
      updateSavedQuery(queryUri: $queryUri, input: $input) {
        savedQueryUri
        name
        description
        label
        created
        sqlBody
        tags
      }
    }
  `
});

export default updateSavedQuery;
