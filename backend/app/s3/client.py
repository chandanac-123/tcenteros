import boto3
import os
from botocore.config import Config

s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    config=Config(signature_version="s3v4"),
)

BUCKET = os.getenv("AWS_S3_BUCKET")
resp = s3.list_objects_v2(Bucket=BUCKET, Prefix="uploads/")
for obj in resp.get("Contents", []):
    print(obj["Key"])