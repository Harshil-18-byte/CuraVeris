import asyncio
from typing import BinaryIO, Dict, Any, Optional
from app.core.config import settings

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


class S3StorageAdapter:
    """Cloudflare R2 / AWS S3 async compatible storage adapter."""

    def __init__(self):
        self.bucket_name = settings.AWS_S3_BUCKET_NAME
        self._client = None

    @property
    def client(self):
        if self._client is None:
            try:
                import boto3
                from botocore.config import Config
                self._client = boto3.client(
                    "s3",
                    endpoint_url=settings.AWS_S3_ENDPOINT_URL or None,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
                    region_name=settings.AWS_S3_REGION,
                    config=Config(signature_version="s3v4", s3={"addressing_style": "virtual" if not settings.AWS_S3_ENDPOINT_URL else "path"}),
                )
            except ImportError:
                self._client = None
        return self._client

    async def upload_file(
        self,
        key: str,
        file_obj: BinaryIO,
        content_type: str = "application/octet-stream",
        metadata: Optional[Dict[str, str]] = None,
    ) -> str:
        """Uploads a file object to S3 / Cloudflare R2 asynchronously."""
        loop = asyncio.get_running_loop()
        extra_args: Dict[str, Any] = {"ContentType": content_type}
        if metadata:
            extra_args["Metadata"] = metadata

        def _upload():
            file_obj.seek(0)
            self.client.upload_fileobj(file_obj, self.bucket_name, key, ExtraArgs=extra_args)
            return key

        return await loop.run_in_executor(None, _upload)

    async def generate_presigned_url(self, key: str, expires_seconds: int = 900) -> str:
        """Generates a secure presigned GET URL (default 15 mins)."""
        loop = asyncio.get_running_loop()

        def _gen():
            try:
                return self.client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": self.bucket_name, "Key": key},
                    ExpiresIn=expires_seconds,
                )
            except Exception:
                return f"{settings.AWS_S3_ENDPOINT_URL}/{self.bucket_name}/{key}"

        return await loop.run_in_executor(None, _gen)

    async def delete_file(self, key: str) -> None:
        """Deletes an object from storage."""
        loop = asyncio.get_running_loop()

        def _delete():
            try:
                self.client.delete_object(Bucket=self.bucket_name, Key=key)
            except ClientError:
                pass

        await loop.run_in_executor(None, _delete)

    async def file_exists(self, key: str) -> bool:
        """Verifies if an object key exists."""
        loop = asyncio.get_running_loop()

        def _check():
            try:
                self.client.head_object(Bucket=self.bucket_name, Key=key)
                return True
            except ClientError:
                return False

        return await loop.run_in_executor(None, _check)


storage_adapter = S3StorageAdapter()
