import { gql } from 'apollo-boost';

const createGroup = ({ organizationUri, description, label, role }) => ({
  variables: {
    input: { organizationUri, description, label, role: role || 'Member' }
  },
  mutation: gql`
    mutation CreateGroup($input: NewGroupInput) {
      createGroup(input: $input) {
        groupUri
        label
        groupRoleInOrganization
        created
        userRoleInGroup
      }
    }
  `
});

export default createGroup;
