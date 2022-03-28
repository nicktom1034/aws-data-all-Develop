import { gql } from 'apollo-boost';

const searchEnvironmentDataItems = ({ filter, environmentUri }) => ({
  variables: {
    environmentUri,
    filter
  },
  query: gql`
    query SearchEnvironmentDataItems(
      $filter: EnvironmentDataItemFilter
      $environmentUri: String
    ) {
      searchEnvironmentDataItems(
        environmentUri: $environmentUri
        filter: $filter
      ) {
        count
        page
        pages
        hasNext
        hasPrevious
        nodes {
          shareUri
          environmentName
          environmentUri
          organizationName
          organizationUri
          datasetUri
          datasetName
          itemType
          itemAccess
          GlueDatabaseName
          GlueTableName
          S3AccessPointName
          created
          principalId
        }
      }
    }
  `
});

export default searchEnvironmentDataItems;
