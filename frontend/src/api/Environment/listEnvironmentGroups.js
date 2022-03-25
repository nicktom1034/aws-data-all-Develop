import { gql } from 'apollo-boost';

const listEnvironmentInvitedGroups = ({ filter, environmentUri }) => ({
  variables: {
    environmentUri,
    filter
  },
  query: gql`
    query listEnvironmentGroups(
      $filter: GroupFilter
      $environmentUri: String!
    ) {
      listEnvironmentGroups(environmentUri: $environmentUri, filter: $filter) {
        count
        page
        pages
        hasNext
        hasPrevious
        nodes {
          groupUri
          invitedBy
          created
          description
          environmentIAMRoleArn
          environmentIAMRoleName
          environmentAthenaWorkGroup
          environmentPermissions(environmentUri: $environmentUri) {
            name
            permissionUri
          }
        }
      }
    }
  `
});

export default listEnvironmentInvitedGroups;
