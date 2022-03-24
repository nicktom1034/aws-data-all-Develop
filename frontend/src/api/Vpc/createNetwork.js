import { gql } from 'apollo-boost';

const createNetwork = (input) => ({
  variables: {
    input
  },
  mutation: gql`mutation createNetwork($input:NewVpcInput){
            createNetwork(input:$input){
                vpcUri
                VpcId
                label
                description
                tags
                owner
                SamlGroupName
                privateSubnetIds
                privateSubnetIds
            }
        }`
});

export default createNetwork;
