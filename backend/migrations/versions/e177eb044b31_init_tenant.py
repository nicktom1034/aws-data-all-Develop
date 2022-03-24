"""init tenant

Revision ID: e177eb044b31
Revises: 033c3d6c1849
Create Date: 2021-08-07 16:47:19.443969

"""
from alembic import op

# revision identifiers, used by Alembic.
from sqlalchemy import orm

from dataall import db
from dataall.db import api

revision = 'e177eb044b31'
down_revision = '033c3d6c1849'
branch_labels = None
depends_on = None


def upgrade():
    try:
        bind = op.get_bind()
        session = orm.Session(bind=bind)
        print('Initializing permissions...')
        db.api.Tenant.save_tenant(session, name='dataall', description='Tenant dataall')
        print('Tenant initialized successfully')
        print('Attaching superusers group DHAdmins...')
        api.TenantPolicy.attach_group_tenant_policy(
            session=session,
            group='DHAdmins',
            permissions=db.permissions.TENANT_ALL,
            tenant_name='dataall',
        )
        print('Attaching superusers groups DHAdmins')
    except Exception as e:
        print(f'Failed to init permissions due to: {e}')


def downgrade():
    pass
