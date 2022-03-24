from ... import gql
from .input_types import DatasetFilter
from .resolvers import *
from .schema import DatasetSearchResult

getDataset = gql.QueryField(
    name='getDataset',
    args=[gql.Argument(name='datasetUri', type=gql.NonNullableType(gql.String))],
    type=gql.Ref('Dataset'),
    resolver=get_dataset,
    test_scope='Dataset',
)


listDatasets = gql.QueryField(
    name='listDatasets',
    args=[gql.Argument('filter', DatasetFilter)],
    type=DatasetSearchResult,
    resolver=list_datasets,
    test_scope='Dataset',
)


getDatasetAssumeRoleUrl = gql.QueryField(
    name='getDatasetAssumeRoleUrl',
    args=[gql.Argument(name='datasetUri', type=gql.String)],
    type=gql.String,
    resolver=get_dataset_assume_role_url,
    test_scope='Dataset',
)


getDatasetETLCredentials = gql.QueryField(
    name='getDatasetETLCredentials',
    args=[gql.Argument(name='datasetUri', type=gql.NonNullableType(gql.String))],
    type=gql.String,
    resolver=get_dataset_etl_credentials,
    test_scope='Dataset',
)


getDatasetSummary = gql.QueryField(
    name='getDatasetSummary',
    args=[gql.Argument(name='datasetUri', type=gql.NonNullableType(gql.String))],
    type=gql.String,
    resolver=get_dataset_summary,
    test_scope='Dataset',
)


getDatasetPresignedUrl = gql.QueryField(
    name='getDatasetPresignedUrl',
    args=[
        gql.Argument(name='datasetUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='input', type=gql.Ref('DatasetPresignedUrlInput')),
    ],
    type=gql.String,
    resolver=get_file_upload_presigned_url,
)


getGlueCrawlerStatus = gql.MutationField(
    name='getGlueCrawlerStatus',
    args=[
        gql.Argument(name='datasetUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='name', type=gql.NonNullableType(gql.String)),
    ],
    resolver=lambda *_, **__: None,
    type=gql.Ref('GlueCrawler'),
)


listShareObjects = gql.QueryField(
    name='listDatasetShareObjects',
    resolver=list_dataset_share_objects,
    args=[
        gql.Argument(name='datasetUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='environmentUri', type=gql.String),
        gql.Argument(name='page', type=gql.Integer),
    ],
    type=gql.Ref('ShareSearchResult'),
)
