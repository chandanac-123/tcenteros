from fastapi import APIRouter
from fastapi import APIRouter, UploadFile, File
from app.s3.service import upload_file, get_file_url, delete_file
import urllib.parse

router = APIRouter()

@router.post("/login")
async def login():
    return {"message": "login ok"}



@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    key = upload_file(file)
    # key = "uploads/uuid_filename with spaces.png"

    # remove "uploads/" prefix
    filename = key.replace("uploads/", "", 1)

    # URL-encode ONLY the filename
    encoded_filename = urllib.parse.quote(filename)

    return {
        "message": "Uploaded",
        "key": encoded_filename
    }

@router.get("/{key:path}")
def get_file(key: str):
    url = get_file_url(key)
    return {"url": url}


@router.delete("/{key}")
def delete(key: str):
    delete_file(key)
    return {"message": "Deleted"}


