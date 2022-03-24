import { gql } from 'apollo-boost';

const deleteSagemakerNotebook = (notebookUri, deleteFromAWS) => ({
  variables: {
    notebookUri, deleteFromAWS
  },
  mutation: gql`
        mutation deleteSagemakerNotebook($notebookUri:String!, $deleteFromAWS:Boolean){
            deleteSagemakerNotebook(notebookUri:$notebookUri, deleteFromAWS:$deleteFromAWS)
        }
        `
});

export default deleteSagemakerNotebook;
