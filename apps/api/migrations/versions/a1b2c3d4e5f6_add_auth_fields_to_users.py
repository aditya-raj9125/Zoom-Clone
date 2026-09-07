"""add_auth_fields_to_users

Revision ID: a1b2c3d4e5f6
Revises: 40e4ffb7e95b
Create Date: 2026-09-07 21:58:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: str | None = '40e4ffb7e95b'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Handle both fresh DBs and existing DBs where columns may have been added
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'password_hash' not in columns:
        op.add_column('users', sa.Column('password_hash', sa.String(length=255), nullable=True))
    if 'oauth_provider' not in columns:
        op.add_column('users', sa.Column('oauth_provider', sa.String(length=50), nullable=True))
    if 'oauth_id' not in columns:
        op.add_column('users', sa.Column('oauth_id', sa.String(length=255), nullable=True))
        op.create_index(op.f('ix_users_oauth_id'), 'users', ['oauth_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_oauth_id'), table_name='users')
    op.drop_column('users', 'oauth_id')
    op.drop_column('users', 'oauth_provider')
    op.drop_column('users', 'password_hash')
