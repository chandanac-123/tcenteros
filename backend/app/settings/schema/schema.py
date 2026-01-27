from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class CenterCategorySuperadminSchema(BaseModel):
    name : str = Field(..., example="gym")

    
