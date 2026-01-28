import uuid
import os
from .client import s3

BUCKET = os.getenv("AWS_S3_BUCKET")
KMS_KEY = os.getenv("AWS_KMS_KEY_ID")


import io

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
    return key


def get_file_url(key: str):
    import urllib.parse
    key = urllib.parse.unquote(key)  # <-- decode any %XX first
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET, "Key": key},
        ExpiresIn=3600,
    )


def delete_file(key: str):
    s3.delete_object(Bucket=BUCKET, Key=key)
