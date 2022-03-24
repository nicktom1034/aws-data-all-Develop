from ... import gql
from .resolvers import *

SagemakerNotebook = gql.ObjectType(
    name='SagemakerNotebook',
    fields=[
        gql.Field(name='notebookUri', type=gql.ID),
        gql.Field(name='environmentUri', type=gql.NonNullableType(gql.String)),
        gql.Field(name='label', type=gql.String),
        gql.Field(name='description', type=gql.String),
        gql.Field(name='tags', type=gql.ArrayType(gql.String)),
        gql.Field(name='name', type=gql.String),
        gql.Field(name='owner', type=gql.String),
        gql.Field(name='created', type=gql.String),
        gql.Field(name='updated', type=gql.String),
        gql.Field(name='SamlAdminGroupName', type=gql.String),
        gql.Field(name='VpcId', type=gql.String),
        gql.Field(name='SubnetId', type=gql.String),
        gql.Field(name='InstanceType', type=gql.String),
        gql.Field(name='RoleArn', type=gql.String),
        gql.Field(name='VolumeSizeInGB', type=gql.Integer),
        gql.Field(
            name='userRoleForNotebook',
            type=SagemakerNotebookRole.toGraphQLEnum(),
            resolver=resolve_user_role,
        ),
        gql.Field(
            name='NotebookInstanceStatus', type=gql.String, resolver=resolve_status
        ),
        gql.Field(
            name='environment',
            type=gql.Ref('Environment'),
            resolver=resolve_environment,
        ),
        gql.Field(
            name='organization',
            type=gql.Ref('Organization'),
            resolver=resolve_organization,
        ),
        gql.Field(name='stack', type=gql.Ref('Stack'), resolver=resolve_stack),
    ],
)

SagemakerNotebookSearchResult = gql.ObjectType(
    name='SagemakerNotebookSearchResult',
    fields=[
        gql.Field(name='count', type=gql.Integer),
        gql.Field(name='page', type=gql.Integer),
        gql.Field(name='pages', type=gql.Integer),
        gql.Field(name='hasNext', type=gql.Boolean),
        gql.Field(name='hasPrevious', type=gql.Boolean),
        gql.Field(name='nodes', type=gql.ArrayType(SagemakerNotebook)),
    ],
)
