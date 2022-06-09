from sqlalchemy import and_

from .... import db
from ..AthenaQueryResult import helpers as athena_helpers
from ....api.constants import WorksheetRole
from ....api.context import Context
from ....db import paginate, exceptions, permissions, models
from ....db.api import ResourcePolicy


def create_worksheet(context: Context, source, input: dict = None):
    with context.engine.scoped_session() as session:
        return db.api.Worksheet.create_worksheet(
            session=session,
            username=context.username,
            groups=context.groups,
            uri=None,
            data=input,
            check_perm=True,
        )


def update_worksheet(
    context: Context, source, worksheetUri: str = None, input: dict = None
):
    with context.engine.scoped_session() as session:
        return db.api.Worksheet.update_worksheet(
            session=session,
            username=context.username,
            groups=context.groups,
            uri=worksheetUri,
            data=input,
            check_perm=True,
        )


def get_worksheet(context: Context, source, worksheetUri: str = None):
    with context.engine.scoped_session() as session:
        return db.api.Worksheet.get_worksheet(
            session=session,
            username=context.username,
            groups=context.groups,
            uri=worksheetUri,
            data=None,
            check_perm=True,
        )


def resolve_user_role(context: Context, source: models.Worksheet):
    if context.username and source.owner == context.username:
        return WorksheetRole.Creator.value
    elif context.groups and source.SamlAdminGroupName in context.groups:
        return WorksheetRole.Admin.value
    return WorksheetRole.NoPermission.value


def list_worksheets(context, source, filter: dict = None):
    if not filter:
        filter = {}
    with context.engine.scoped_session() as session:
        return db.api.Worksheet.paginated_user_worksheets(
            session=session,
            username=context.username,
            groups=context.groups,
            uri=None,
            data=filter,
            check_perm=True,
        )


def share_worksheet(
    context: Context, source, worksheetUri: str = None, input: dict = None
):
    with context.engine.scoped_session() as session:
        return db.api.Worksheet.share_worksheet(
            session=session,
            username=context.username,
            groups=context.groups,
            uri=worksheetUri,
            data=input,
            check_perm=True,
        )


def update_worksheet_share(
    context, source, worksheetShareUri: str = None, canEdit: bool = None
):
    with context.engine.scoped_session() as session:
        share: models.WorksheetShare = session.query(models.WorksheetShare).get(
            worksheetShareUri
        )
        if not share:
            raise exceptions.ObjectNotFound('WorksheetShare', worksheetShareUri)

        return db.api.Worksheet.update_share_worksheet(
            session=session,
            username=context.username,
            groups=context.groups,
            uri=share.worksheetUri,
            data={'canEdit': canEdit, 'share': share},
            check_perm=True,
        )

    return share


def remove_worksheet_share(context, source, worksheetShareUri):
    with context.engine.scoped_session() as session:
        share: models.WorksheetShare = session.query(models.WorksheetShare).get(
            worksheetShareUri
        )
        if not share:
            raise exceptions.ObjectNotFound('WorksheetShare', worksheetShareUri)

        return db.api.Worksheet.delete_share_worksheet(
            session=session,
            username=context.username,
            groups=context.groups,
            uri=share.worksheetUri,
            data={'share': share},
            check_perm=True,
        )


def resolve_shares(context: Context, source: models.Worksheet, filter: dict = None):
    if not filter:
        filter = {}
    with context.engine.scoped_session() as session:
        q = session.query(models.WorksheetShare).filter(
            models.WorksheetShare.worksheetUri == source.worksheetUri
        )
    return paginate(
        q, page_size=filter.get('pageSize', 15), page=filter.get('page', 1)
    ).to_dict()


def run_sql_query(
    context: Context, source, environmentUri: str = None, worksheetUri: str = None, sqlQuery: str = None
):
    with context.engine.scoped_session() as session:
        ResourcePolicy.check_user_resource_permission(
            session=session,
            username=context.username,
            groups=context.groups,
            resource_uri=environmentUri,
            permission_name=permissions.RUN_ATHENA_QUERY,
        )
        environment = db.api.Environment.get_environment_by_uri(session, environmentUri)
        worksheet = db.api.Worksheet.get_worksheet_by_uri(session, worksheetUri)

        env_group = db.api.Environment.get_environment_group(
            session, worksheet.SamlAdminGroupName, environment.environmentUri
        )

    return athena_helpers.run_query_with_role(
        environment=environment, environment_group=env_group, sql=sqlQuery
    )


def delete_worksheet(context, source, worksheetUri: str = None):
    with context.engine.scoped_session() as session:
        return db.api.Worksheet.delete_worksheet(
            session=session,
            username=context.username,
            groups=context.groups,
            uri=worksheetUri,
            data=None,
            check_perm=True,
        )
