import { gql } from 'apollo-boost';

const importAirflowCluster = ({ environmentUri, input }) => ({
  variables: {
    environmentUri,
    clusterInput: input
  },
  mutation: gql`
    mutation importAirflowCluster(
      $environmentUri: String!
      $clusterInput: ImportClusterInput!
    ) {
      importAirflowCluster(
        environmentUri: $environmentUri
        clusterInput: $clusterInput
      ) {
        clusterUri
        name
        label
        created
      }
    }
  `
});

export default importAirflowCluster;
