import { gql } from 'apollo-boost';

const updateMemberRole = ({ environmentUri, userName, role }) => ({
  variables: { environmentUri, userName, role: role || 'Member' },
  mutation: gql`mutation UpdateGroupMember(
            $environmentUri:String!,
            $userName:String!,
            $role:EnvironmentPermission
        ){
            updateUserEnvironmentRole(
                environmentUri:$environmentUri,
                userName:$userName,
                role:$role
            ){
                environmentUri
            }
        }`
});

export default updateMemberRole;
