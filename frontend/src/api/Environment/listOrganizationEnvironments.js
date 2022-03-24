import { gql } from 'apollo-boost';

const listOrganizationEnvironments = ({ organizationUri, filter }) => ({
  variables: {
    organizationUri,
    filter
  },
  query: gql`
            query getOrg($organizationUri:String,$filter:EnvironmentFilter){
                getOrganization(organizationUri:$organizationUri){
                    environments(filter:$filter){
                        count
                        page
                        pageSize
                        hasNext
                        pages
                        hasPrevious
                        nodes{
                            environmentUri
                            label
                            name
                            description
                            owner
                            region
                            EnvironmentDefaultIAMRoleArn
                            EnvironmentDefaultIAMRoleName
                            SamlGroupName
                            created
                            deleted
                            validated
                            roleCreated
                            tags
                            environmentType
                            AwsAccountId
                            dashboardsEnabled
                            notebooksEnabled
                            mlStudiosEnabled
                            pipelinesEnabled
                            warehousesEnabled
                            userRoleInEnvironment
                            stack{
                                stack
                                status
                                stackUri
                                targetUri
                                accountid
                                region
                                stackid
                                link
                                outputs
                                resources
                            }
                        }
                    }

                }
            }
        `
});

export default listOrganizationEnvironments;
