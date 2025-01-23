"""Add characteristics and flavors to Recipe model

Revision ID: ac34faf15df6
Revises: 2a7d1de721e6
Create Date: 2025-01-23 16:56:15.085222

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ac34faf15df6'
down_revision = '2a7d1de721e6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('recipes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('characteristics', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('flavors', sa.Text(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('recipes', schema=None) as batch_op:
        batch_op.drop_column('flavors')
        batch_op.drop_column('characteristics')

    # ### end Alembic commands ###
