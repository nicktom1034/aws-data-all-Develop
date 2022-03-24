from ... import gql
from .resolvers import *


importDashboard = gql.MutationField(
    name='importDashboard',
    type=gql.Ref('Dashboard'),
    args=[
        gql.Argument(
            name='input', type=gql.NonNullableType(gql.Ref('ImportDashboardInput'))
        )
    ],
    resolver=import_dashboard,
)

updateDashboard = gql.MutationField(
    name='updateDashboard',
    args=[
        gql.Argument(
            name='input', type=gql.NonNullableType(gql.Ref('UpdateDashboardInput'))
        ),
    ],
    type=gql.Ref('Dashboard'),
    resolver=update_dashboard,
)


deleteDashboard = gql.MutationField(
    name='deleteDashboard',
    type=gql.Boolean,
    args=[gql.Argument(name='dashboardUri', type=gql.NonNullableType(gql.String))],
    resolver=delete_dashboard,
)


shareDashboard = gql.MutationField(
    name='shareDashboard',
    type=gql.Ref('DashboardShare'),
    args=[
        gql.Argument(name='principalId', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='dashboardUri', type=gql.NonNullableType(gql.String)),
    ],
    resolver=share_dashboard,
)

requestDashboardShare = gql.MutationField(
    name='requestDashboardShare',
    type=gql.Ref('DashboardShare'),
    args=[
        gql.Argument(name='principalId', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='dashboardUri', type=gql.NonNullableType(gql.String)),
    ],
    resolver=request_dashboard_share,
)

approveDashboardShare = gql.MutationField(
    name='approveDashboardShare',
    type=gql.Ref('DashboardShare'),
    args=[
        gql.Argument(name='shareUri', type=gql.NonNullableType(gql.String)),
    ],
    resolver=approve_dashboard_share,
)

rejectDashboardShare = gql.MutationField(
    name='rejectDashboardShare',
    type=gql.Ref('DashboardShare'),
    args=[
        gql.Argument(name='shareUri', type=gql.NonNullableType(gql.String)),
    ],
    resolver=reject_dashboard_share,
)
