import uuid
import os
import io
from .client import s3

BUCKET = os.getenv("AWS_S3_BUCKET")

def upload_file(file_bytes, key, content_type="image/jpeg"):
    file_obj = io.BytesIO(file_bytes)
    s3.upload_fileobj(
        file_obj,
        BUCKET,
        key,
        ExtraArgs={
            "ContentType": content_type,
            "ACL": "public-read",  # Make the file public
        },
    )
    return key  # Always return only the key

def get_file_url(key: str):
    import urllib.parse
    # Ensure only the key is passed, not a full URL
    if key.startswith("http://") or key.startswith("https://"):
        from urllib.parse import urlparse
        parsed = urlparse(key)
        key = parsed.path.lstrip("/")
    key = urllib.parse.unquote(key)
    return f"https://{BUCKET}.s3.amazonaws.com/{key}"

def delete_file(key: str):
    s3.delete_object(Bucket=BUCKET, Key=key)