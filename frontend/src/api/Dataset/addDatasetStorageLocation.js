import { gql } from 'apollo-boost';

const addDatasetStorageLocation = ({ datasetUri, input }) => ({
  variables: { datasetUri, input },
  mutation: gql`mutation CreateDatasetStorageLocation(
            $datasetUri:String,
            $input:NewDatasetStorageLocationInput
        ){
            createDatasetStorageLocation(
                datasetUri:$datasetUri,
                input:$input
            ){
                locationUri
                S3Prefix
            }
        }`
});

export default addDatasetStorageLocation;
