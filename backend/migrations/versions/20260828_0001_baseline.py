"""Baseline existing CuraVeris SQLAlchemy schema.

The baseline is intentionally additive: it creates tables absent from a clean
database and leaves all existing deployment data untouched.
"""
from alembic import op

from app.db.database import Base
import app.db.models  # noqa: F401 -- imports all model metadata

revision = "20260828_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind(), checkfirst=True)


def downgrade() -> None:
    raise NotImplementedError("Baseline migration is intentionally non-destructive.")
