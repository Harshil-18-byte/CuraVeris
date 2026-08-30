"""Database-foundation migration tests run against a clean SQLite database."""
from pathlib import Path
import pytest

alembic = pytest.importorskip("alembic")
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text



def test_baseline_migration_creates_required_schema(tmp_path: Path):
    database = tmp_path / "clean.db"
    config = Config(str(Path(__file__).parents[1] / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", f"sqlite:///{database.as_posix()}")
    command.upgrade(config, "head")

    tables = set(inspect(create_engine(f"sqlite:///{database.as_posix()}")).get_table_names())
    assert {"users", "invoices", "documents", "document_fields", "model_versions", "financial_assessments", "devices"} <= tables


def test_document_constraints_reject_invalid_values(tmp_path: Path):
    database = tmp_path / "constraints.db"
    config = Config(str(Path(__file__).parents[1] / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", f"sqlite:///{database.as_posix()}")
    command.upgrade(config, "head")
    engine = create_engine(f"sqlite:///{database.as_posix()}")
    with engine.begin() as connection:
        with pytest.raises(Exception):
            connection.execute(text("INSERT INTO documents (id, storage_key, original_filename, content_type, byte_size, sha256, status, created_at) VALUES ('doc-1', 'a', 'a.pdf', 'application/pdf', -1, '0', 'UPLOADED', CURRENT_TIMESTAMP)"))
