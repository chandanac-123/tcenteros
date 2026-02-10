import uuid
import os
import io
from .client import s3

BUCKET = os.getenv("AWS_S3_BUCKET")
KMS_KEY = os.getenv("AWS_KMS_KEY_ID")

def upload_file(file_bytes, key, content_type="image/jpeg"):
    file_obj = io.BytesIO(file_bytes)
    s3.upload_fileobj(
        file_obj,
        BUCKET,
        key,
        ExtraArgs={
            "ServerSideEncryption": "aws:kms",
            "SSEKMSKeyId": KMS_KEY,
            "ContentType": content_type,
        },
    )
    return key  # Always return only the key

def get_file_url(key: str):
    import urllib.parse
    # Ensure only the key is passed, not a full URL
    if key.startswith("http://") or key.startswith("https://"):
        # If a full URL is passed by mistake, extract the key part
        from urllib.parse import urlparse
        parsed = urlparse(key)
        key = parsed.path.lstrip("/")
    key = urllib.parse.unquote(key)
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET, "Key": key},
        ExpiresIn=3600,
    )

def delete_file(key: str):
    s3.delete_object(Bucket=BUCKET, Key=key)