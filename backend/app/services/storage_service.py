from typing import BinaryIO, Dict, Optional
from app.core.storage import storage_adapter, validate_file_magic_bytes


async def upload_document(
    key: str,
    file_obj: BinaryIO,
    content_type: str,
    metadata: Optional[Dict[str, str]] = None,
) -> str:
    """Validates magic bytes and streams document to S3/R2 storage."""
    file_obj.seek(0)
    header = file_obj.read(16)
    file_obj.seek(0)

    if not validate_file_magic_bytes(header):
        raise ValueError("Invalid file format. Supported: PDF, PNG, JPEG, TIFF.")

    return await storage_adapter.upload_file(key, file_obj, content_type, metadata)


async def get_download_url(key: str, expires_seconds: int = 900) -> str:
    """Generates presigned download URL."""
    return await storage_adapter.generate_presigned_url(key, expires_seconds)


async def remove_document(key: str) -> None:
    """Deletes document from storage."""
    await storage_adapter.delete_file(key)
