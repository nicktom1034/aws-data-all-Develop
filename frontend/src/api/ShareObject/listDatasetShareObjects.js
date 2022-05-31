import { gql } from 'apollo-boost';

const listDatasetShareObjects = ({ datasetUri, filter }) => ({
  variables: {
    datasetUri,
    filter
  },
  query: gql`
    query ListDatasetShareObjects(
      $datasetUri: String!
      $filter: ShareObjectFilter
    ) {
      getDataset(datasetUri: $datasetUri) {
        shares(filter: $filter) {
          page
          pages
          pageSize
          hasPrevious
          hasNext
          count
          nodes {
            shareUri
            created
            owner
            status
            userRoleForShareObject
            statistics {
              tables
              locations
            }
            principal {
              principalId
              principalType
              principalName
              AwsAccountId
              region
              SamlGroupName
              organizationName
              organizationUri
            }
          }
        }
      }
    }
  `
});

export default listDatasetShareObjects;
