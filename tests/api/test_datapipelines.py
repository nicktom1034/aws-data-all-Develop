import pytest


@pytest.fixture(scope='module')
def org1(org, user, group, tenant):
    org1 = org('testorg', user.userName, group.name)
    yield org1


@pytest.fixture(scope='module')
def env1(env, org1, user, group, tenant, module_mocker):
    module_mocker.patch('requests.post', return_value=True)
    module_mocker.patch(
        'dataall.api.Objects.Environment.resolvers.check_environment', return_value=True
    )
    env1 = env(org1, 'dev', user.userName, group.name, '111111111111', 'eu-west-1')
    yield env1


@pytest.fixture(scope='module', autouse=True)
def pipeline(client, tenant, group, env1):
    response = client.query(
        """
        mutation createDataPipeline ($input:NewDataPipelineInput){
            createDataPipeline(input:$input){
                DataPipelineUri
                label
                description
                tags
                owner
                repo
                userRoleForPipeline
            }
        }
        """,
        input={
            'label': 'my pipeline',
            'SamlGroupName': group.name,
            'tags': [group.name],
            'environmentUri': env1.environmentUri,
            'devStages': ['test','prod'],
            'devStrategy': 'trunk',
            'inputDatasetUri': '',
            'outputDatasetUri': '',
            'template': ''
        },
        username='alice',
        groups=[group.name],
    )
    assert response.data.createDataPipeline.repo
    assert response.data.createDataPipeline.DataPipelineUri
    return response.data.createDataPipeline


def test_update_pipeline(client, tenant, group, pipeline):
    response = client.query(
        """
        mutation updateDataPipeline ($DataPipelineUri:String!,$input:UpdateDataPipelineInput){
            updateDataPipeline(DataPipelineUri:$DataPipelineUri,input:$input){
                DataPipelineUri
                label
                description
                tags
                owner
                repo
                userRoleForPipeline
            }
        }
        """,
        DataPipelineUri=pipeline.DataPipelineUri,
        input={
            'label': 'changed pipeline',
            'tags': [group.name],
        },
        username='alice',
        groups=[group.name],
    )
    assert response.data.updateDataPipeline.label == 'changed pipeline'


def test_list_pipelines(client, env1, db, org1, user, group, pipeline):
    response = client.query(
        """
        query ListDataPipelines($filter:DataPipelineFilter){
            listDataPipelines(filter:$filter){
                count
                nodes{
                    DataPipelineUri
                    cloneUrlHttp
                    environment {
                     environmentUri
                    }
                    organization {
                     organizationUri
                    }
                }
            }
        }
        """,
        filter=None,
        username=user.userName,
        groups=[group.name],
    )
    assert len(response.data.listDataPipelines['nodes']) == 1


def test_nopermissions_pipelines(client, env1, db, org1, user, group, pipeline):
    response = client.query(
        """
        query listDataPipelines($filter:DataPipelineFilter){
            listDataPipelines(filter:$filter){
                count
                nodes{
                    DataPipelineUri
                }
            }
        }
        """,
        filter=None,
        username='bob',
    )
    assert len(response.data.listDataPipelines['nodes']) == 0


def test_get_pipeline(client, env1, db, org1, user, group, pipeline, module_mocker):
    module_mocker.patch(
        'dataall.aws.handlers.service_handlers.Worker.process',
        return_value=[{'response': 'return value'}],
    )
    module_mocker.patch(
        'dataall.api.Objects.DataPipeline.resolvers._get_creds_from_aws',
        return_value=True,
    )
    response = client.query(
        """
        query getDataPipeline($DataPipelineUri:String!){
            getDataPipeline(DataPipelineUri:$DataPipelineUri){
                DataPipelineUri
            }
        }
        """,
        DataPipelineUri=pipeline.DataPipelineUri,
        username=user.userName,
        groups=[group.name],
    )
    assert response.data.getDataPipeline.DataPipelineUri == pipeline.DataPipelineUri
    response = client.query(
        """
        query getDataPipelineCredsLinux($DataPipelineUri:String!){
            getDataPipelineCredsLinux(DataPipelineUri:$DataPipelineUri)
        }
        """,
        DataPipelineUri=pipeline.DataPipelineUri,
        username=user.userName,
        groups=[group.name],
    )
    assert response.data.getDataPipelineCredsLinux
    response = client.query(
        """
        query browseDataPipelineRepository($input:DataPipelineBrowseInput!){
            browseDataPipelineRepository(input:$input)
        }
        """,
        input=dict(branch='master', DataPipelineUri=pipeline.DataPipelineUri),
        username=user.userName,
        groups=[group.name],
    )
    assert response.data.browseDataPipelineRepository


def test_delete_pipelines(client, env1, db, org1, user, group, module_mocker, pipeline):
    module_mocker.patch(
        'dataall.aws.handlers.service_handlers.Worker.queue', return_value=True
    )
    response = client.query(
        """
        mutation deleteDataPipeline($DataPipelineUri:String!,$deleteFromAWS:Boolean){
            deleteDataPipeline(DataPipelineUri:$DataPipelineUri,deleteFromAWS:$deleteFromAWS)
        }
        """,
        DataPipelineUri=pipeline.DataPipelineUri,
        deleteFromAWS=True,
        username=user.userName,
        groups=[group.name],
    )
    assert response.data.deleteDataPipeline
    response = client.query(
        """
        query ListDataPipelines($filter:DataPipelineFilter){
            listDataPipelines(filter:$filter){
                count
                nodes{
                    DataPipelineUri
                }
            }
        }
        """,
        filter=None,
        username=user.userName,
        groups=[group.name],
    )
    assert len(response.data.listDataPipelines['nodes']) == 0
