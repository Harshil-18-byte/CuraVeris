"""Add authenticated client installation identity."""
from alembic import op
import sqlalchemy as sa

revision = "20260828_0002"
down_revision = "20260828_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "devices" not in inspector.get_table_names():
        op.create_table(
            "devices",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("installation_id", sa.String(), nullable=False),
            sa.Column("platform", sa.String(), nullable=False),
            sa.Column("display_name", sa.String(), nullable=True),
            sa.Column("app_version", sa.String(), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("last_seen_at", sa.DateTime(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.CheckConstraint("platform IN ('WEB', 'ANDROID', 'IOS')", name="ck_devices_platform"),
            sa.UniqueConstraint("user_id", "installation_id", name="uq_devices_user_installation"),
        )
        op.create_index("ix_devices_user_active", "devices", ["user_id", "is_active"])
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("refresh_tokens")}
    if "device_id" not in columns:
        op.add_column("refresh_tokens", sa.Column("device_id", sa.String(), nullable=True))
        op.create_index("ix_refresh_tokens_device_id", "refresh_tokens", ["device_id"])


def downgrade() -> None:
    raise NotImplementedError("Device identity migration is intentionally non-destructive.")
