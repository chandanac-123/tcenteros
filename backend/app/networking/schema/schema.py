from pydantic import BaseModel



class NetworkingAccessRequest(BaseModel):
    network_center_id: str
    start_date: str  # "YYYY-MM-DD"
    end_date: str    # "YYYY-MM-DD"
    time_slot_id: str