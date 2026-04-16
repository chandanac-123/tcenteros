# import boto3
# import os
# from botocore.config import Config

# s3 = boto3.client(
#     "s3",
#     region_name=os.getenv("AWS_REGION"),
#     aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
#     aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
#     config=Config(signature_version="s3v4"),
# )

# BUCKET = os.getenv("AWS_S3_BUCKET")
# resp = s3.list_objects_v2(Bucket=BUCKET, Prefix="uploads/")
# for obj in resp.get("Contents", []):
#     print(obj["Key"])

# app/s3/client.py
import os
import logging
import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger(__name__)

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
BUCKET = os.getenv("AWS_S3_BUCKET")
AWS_ENDPOINT_URL = os.getenv("AWS_ENDPOINT_URL")  # optional (for MinIO, etc.)

s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    endpoint_url=AWS_ENDPOINT_URL,
    config=Config(signature_version="s3v4"),
)

def validate_s3_connection() -> bool:
    if not BUCKET:
        logger.warning("S3 bucket is not configured (AWS_S3_BUCKET missing).")
        return False
    try:
        s3.head_bucket(Bucket=BUCKET)
        return True
    except (ClientError, BotoCoreError) as exc:
        logger.warning("S3 validation failed: %s", exc)
        return False

# IMPORTANT: do NOT raise at import time
if os.getenv("S3_VALIDATE_ON_STARTUP", "false").lower() == "true":
    validate_s3_connection()