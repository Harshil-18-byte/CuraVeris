"""Add notification persistence and device push-token state."""
from alembic import op
import sqlalchemy as sa

revision = "20260828_0003"
down_revision = "20260828_0002"
branch_labels = None
depends_on = None


def _columns(table: str) -> set[str]:
    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table)}


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "devices" in inspector.get_table_names():
        columns = _columns("devices")
        for name, type_ in (("push_provider", sa.String()), ("encrypted_push_token", sa.Text()), ("push_permission", sa.String())):
            if name not in columns:
                op.add_column("devices", sa.Column(name, type_, nullable=True))
        op.execute("UPDATE devices SET push_permission = 'UNKNOWN' WHERE push_permission IS NULL")

    tables = set(sa.inspect(op.get_bind()).get_table_names())
    if "notification_preferences" not in tables:
        op.create_table("notification_preferences", sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), primary_key=True), sa.Column("push_enabled", sa.Boolean(), nullable=False, server_default=sa.true()), sa.Column("in_app_enabled", sa.Boolean(), nullable=False, server_default=sa.true()), sa.Column("updated_at", sa.DateTime(), nullable=False))
    if "notifications" not in tables:
        op.create_table("notifications", sa.Column("id", sa.String(), primary_key=True), sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False), sa.Column("event_id", sa.String(), nullable=False), sa.Column("event_type", sa.String(), nullable=False), sa.Column("priority", sa.String(), nullable=False), sa.Column("title", sa.String(), nullable=False), sa.Column("body", sa.String(), nullable=False), sa.Column("deep_link", sa.String()), sa.Column("entity_type", sa.String()), sa.Column("entity_id", sa.String()), sa.Column("read_at", sa.DateTime()), sa.Column("created_at", sa.DateTime(), nullable=False), sa.UniqueConstraint("user_id", "event_id", name="uq_notifications_user_event"))
        op.create_index("ix_notifications_user_read", "notifications", ["user_id", "read_at"])
    if "notification_deliveries" not in tables:
        op.create_table("notification_deliveries", sa.Column("id", sa.String(), primary_key=True), sa.Column("notification_id", sa.String(), sa.ForeignKey("notifications.id"), nullable=False), sa.Column("device_id", sa.String(), sa.ForeignKey("devices.id"), nullable=False), sa.Column("provider", sa.String(), nullable=False), sa.Column("status", sa.String(), nullable=False), sa.Column("attempt_count", sa.Integer(), nullable=False), sa.Column("next_attempt_at", sa.DateTime()), sa.Column("provider_message_id", sa.String()), sa.Column("failure_code", sa.String()), sa.Column("created_at", sa.DateTime(), nullable=False), sa.Column("updated_at", sa.DateTime(), nullable=False), sa.UniqueConstraint("notification_id", "device_id", name="uq_notification_deliveries_target"))
        op.create_index("ix_notification_deliveries_status", "notification_deliveries", ["status", "next_attempt_at"])


def downgrade() -> None:
    raise NotImplementedError("Notification migration is intentionally non-destructive.")
