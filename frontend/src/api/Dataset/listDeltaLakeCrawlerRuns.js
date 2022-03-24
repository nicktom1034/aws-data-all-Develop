import { gql } from 'apollo-boost';

const listDeltaLakeCrawlerRuns = ({ datasetUri }) => ({
  variables: {
    datasetUri
  },
  query: gql`
            query listDeltaLakeCrawlerRuns($datasetUri:String!){
                listDeltaLakeCrawlerRuns(datasetUri:$datasetUri){
                        datasetUri
                        GlueJobName
                        GlueJobRunId
                        AwsAccountId
                        GlueTriggerName
                        created
                        status
                        owner
                    }
                }
        `
});

export default listDeltaLakeCrawlerRuns;
