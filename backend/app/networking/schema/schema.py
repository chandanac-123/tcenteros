from pydantic import BaseModel



class NetworkingAccessRequest(BaseModel):

    start_date: str  # "YYYY-MM-DD"
    end_date: str    # "YYYY-MM-DD"
    time_slot_id: str