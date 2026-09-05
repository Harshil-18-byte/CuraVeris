import asyncio
from typing import BinaryIO, Dict, Any, Optional
from app.core.config import settings

try:
    from botocore.exceptions import ClientError
except ImportError:
    class ClientError(Exception):  # type: ignore[no-redef]
        pass

SUPPORTED_MAGIC_BYTES = {
    "pdf": b"%PDF",             # 25 50 44 46
    "png": b"\x89PNG",          # 89 50 4e 47
    "jpeg": b"\xff\xd8\xff",     # ff d8 ff
    "tiff_le": b"II*\x00",      # 49 49 2a 00
    "tiff_be": b"MM\x00*",      # 4d 4d 00 2a
}


def validate_file_magic_bytes(header_bytes: bytes) -> bool:
    """Validate initial header bytes against authorized document magic byte signatures."""
    if not header_bytes or len(header_bytes) < 3:
        return False
    if header_bytes.startswith(b"%PDF"):
        return True
    if header_bytes.startswith(b"\x89PNG"):
        return True
    if header_bytes.startswith(b"\xff\xd8\xff"):
        return True
    if header_bytes.startswith(b"II*\x00") or header_bytes.startswith(b"MM\x00*"):
        return True
    return False


import os
import pathlib

class UnifiedStorageAdapter:
    """Unified storage adapter supporting AWS S3/Cloudflare R2 with automatic local filesystem fallback."""

    def __init__(self):
        self.bucket_name = settings.AWS_S3_BUCKET_NAME
        self.local_root = pathlib.Path(os.getenv("LOCAL_STORAGE_DIR", "./data/storage"))
        self.local_root.mkdir(parents=True, exist_ok=True)
        self._client = None

    @property
    def is_s3_configured(self) -> bool:
        return bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY and settings.STORAGE_BACKEND != "local")

    @property
    def client(self):
        if not self.is_s3_configured:
            return None
        if self._client is None:
            try:
                import boto3
                from botocore.config import Config
                self._client = boto3.client(
                    "s3",
                    endpoint_url=settings.AWS_S3_ENDPOINT_URL or None,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION,
                    config=Config(signature_version="s3v4", s3={"addressing_style": "virtual" if not settings.AWS_S3_ENDPOINT_URL else "path"}),
                )
            except Exception:
                self._client = None
        return self._client

    async def upload_file(
        self,
        key: str,
        file_obj: BinaryIO,
        content_type: str = "application/octet-stream",
        metadata: Optional[Dict[str, str]] = None,
    ) -> str:
        """Uploads a file object to S3 / Cloudflare R2 or local disk."""
        loop = asyncio.get_running_loop()

        def _upload():
            file_obj.seek(0)
            if self.is_s3_configured and self.client:
                extra_args: Dict[str, Any] = {"ContentType": content_type}
                if metadata:
                    extra_args["Metadata"] = metadata
                self.client.upload_fileobj(file_obj, self.bucket_name, key, ExtraArgs=extra_args)
            else:
                dest = self.local_root / key
                dest.parent.mkdir(parents=True, exist_ok=True)
                with open(dest, "wb") as f:
                    f.write(file_obj.read())
            return key

        return await loop.run_in_executor(None, _upload)

    async def get_file_bytes(self, key: str) -> bytes:
        """Reads file bytes directly from storage."""
        loop = asyncio.get_running_loop()

        def _read():
            if self.is_s3_configured and self.client:
                resp = self.client.get_object(Bucket=self.bucket_name, Key=key)
                return resp["Body"].read()
            else:
                dest = self.local_root / key
                if dest.exists():
                    with open(dest, "rb") as f:
                        return f.read()
                return b""

        return await loop.run_in_executor(None, _read)

    async def generate_presigned_url(self, key: str, expires_seconds: int = 900) -> str:
        """Generates a presigned URL or local file path."""
        loop = asyncio.get_running_loop()

        def _gen():
            if self.is_s3_configured and self.client:
                try:
                    return self.client.generate_presigned_url(
                        "get_object",
                        Params={"Bucket": self.bucket_name, "Key": key},
                        ExpiresIn=expires_seconds,
                    )
                except Exception:
                    pass
            dest = self.local_root / key
            return f"file:///{dest.resolve().as_posix()}"

        return await loop.run_in_executor(None, _gen)

    async def delete_file(self, key: str) -> None:
        """Deletes an object from storage."""
        loop = asyncio.get_running_loop()

        def _delete():
            if self.is_s3_configured and self.client:
                try:
                    self.client.delete_object(Bucket=self.bucket_name, Key=key)
                except Exception:
                    pass
            else:
                dest = self.local_root / key
                if dest.exists():
                    try:
                        dest.unlink()
                    except Exception:
                        pass

        await loop.run_in_executor(None, _delete)

    async def file_exists(self, key: str) -> bool:
        """Verifies if an object key exists."""
        loop = asyncio.get_running_loop()

        def _check():
            if self.is_s3_configured and self.client:
                try:
                    self.client.head_object(Bucket=self.bucket_name, Key=key)
                    return True
                except Exception:
                    return False
            else:
                dest = self.local_root / key
                return dest.exists()

        return await loop.run_in_executor(None, _check)


StorageAdapter = UnifiedStorageAdapter
storage_adapter = UnifiedStorageAdapter()


def get_storage() -> UnifiedStorageAdapter:
    """Dependency provider returning singleton storage adapter instance."""
    return storage_adapter

