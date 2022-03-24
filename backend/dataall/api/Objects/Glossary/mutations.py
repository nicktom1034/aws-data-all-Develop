from ... import gql
from .resolvers import *

createGlossary = gql.MutationField(
    name='createGlossary',
    args=[gql.Argument(name='input', type=gql.Ref('CreateGlossaryInput'))],
    resolver=create_glossary,
    type=gql.Ref('Glossary'),
)


UpdateGlossary = gql.MutationField(
    name='updateGlossary',
    resolver=update_node,
    args=[
        gql.Argument(name='nodeUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='input', type=gql.Ref('UpdateGlossaryInput')),
    ],
    type=gql.Ref('Glossary'),
)

deleteGlossary = gql.MutationField(
    name='deleteGlossary',
    resolver=delete_node,
    args=[
        gql.Argument(name='nodeUri', type=gql.NonNullableType(gql.String)),
    ],
    type=gql.Integer,
)


CreateCategory = gql.MutationField(
    name='createCategory',
    args=[
        gql.Argument(name='parentUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='input', type=gql.Ref('CreateCategoryInput')),
    ],
    resolver=create_category,
    type=gql.Ref('Category'),
)

updateCategory = gql.MutationField(
    name='updateCategory',
    resolver=update_node,
    args=[
        gql.Argument(name='nodeUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='input', type=gql.Ref('UpdateCategoryInput')),
    ],
    type=gql.Ref('Category'),
)

deleteCategory = gql.MutationField(
    name='deleteCategory',
    resolver=delete_node,
    args=[
        gql.Argument(name='nodeUri', type=gql.NonNullableType(gql.String)),
    ],
    type=gql.Integer,
)


linkTerm = gql.MutationField(
    name='linkTerm',
    resolver=link_term,
    args=[
        gql.Argument(name='nodeUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='targetUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='targetType', type=gql.NonNullableType(gql.String)),
    ],
    type=gql.Ref('GlossaryTermLink'),
)

requestLink = gql.MutationField(
    name='requestLink',
    resolver=request_link,
    args=[
        gql.Argument(name='nodeUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='targetUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='targetType', type=gql.NonNullableType(gql.String)),
    ],
    type=gql.Ref('GlossaryTermLink'),
)


createTerm = gql.MutationField(
    name='createTerm',
    type=gql.Ref('Term'),
    resolver=create_term,
    args=[
        gql.Argument(name='parentUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='input', type=gql.Ref('CreateTermInput')),
    ],
)

updateTerm = gql.MutationField(
    name='updateTerm',
    type=gql.Ref('Term'),
    resolver=update_node,
    args=[
        gql.Argument(name='nodeUri', type=gql.NonNullableType(gql.String)),
        gql.Argument(name='input', type=gql.Ref('UpdateTermInput')),
    ],
)

deleteTerm = gql.MutationField(
    name='deleteTerm',
    type=gql.Integer,
    resolver=delete_node,
    args=[gql.Argument(name='nodeUri', type=gql.NonNullableType(gql.String))],
)


approveTermAssociation = gql.MutationField(
    name='approveTermAssociation',
    type=gql.Boolean,
    resolver=approve_term_association,
    args=[gql.Argument(name='linkUri', type=gql.NonNullableType(gql.String))],
)

dismissTermAssociation = gql.MutationField(
    name='dismissTermAssociation',
    type=gql.Boolean,
    resolver=dismiss_term_association,
    args=[gql.Argument(name='linkUri', type=gql.NonNullableType(gql.String))],
)
