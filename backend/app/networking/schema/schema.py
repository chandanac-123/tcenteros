
from pydantic import BaseModel, condecimal
from typing import Optional
from uuid import UUID



class NetworkingAccessRequest(BaseModel):

    start_date: str  # "YYYY-MM-DD"
    end_date: str    # "YYYY-MM-DD"
    time_slot_id: str





