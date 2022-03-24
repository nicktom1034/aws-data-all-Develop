from ... import gql
from .resolvers import *


listTenantPermissions = gql.QueryField(
    name='listTenantPermissions',
    type=gql.ArrayType(gql.Ref('Permission')),
    resolver=list_tenant_permissions,
)

listTenantGroups = gql.QueryField(
    name='listTenantGroups',
    args=[
        gql.Argument(name='filter', type=gql.Ref('GroupFilter')),
    ],
    type=gql.Ref('GroupSearchResult'),
    resolver=list_tenant_groups,
)
