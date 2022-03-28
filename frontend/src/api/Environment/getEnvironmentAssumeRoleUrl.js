import { gql } from 'apollo-boost';

const getEnvironmentAssumeRoleUrl = ({ environmentUri, groupUri }) => ({
  variables: {
    environmentUri,
    groupUri
  },
  query: gql`
    query getEnvironmentAssumeRoleUrl(
      $environmentUri: String!
      $groupUri: String
    ) {
      getEnvironmentAssumeRoleUrl(
        environmentUri: $environmentUri
        groupUri: $groupUri
      )
    }
  `
});

export default getEnvironmentAssumeRoleUrl;
