from pydantic import BaseModel

class SuperadminLoginRequest(BaseModel):
    email: str
    password: str