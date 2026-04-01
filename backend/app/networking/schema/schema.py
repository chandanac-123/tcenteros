
from pydantic import BaseModel, condecimal
from typing import Optional
from uuid import UUID



class NetworkingAccessRequest(BaseModel):

    start_date: str  # "YYYY-MM-DD"
    end_date: str    # "YYYY-MM-DD"
    time_slot_id: str





class InventoryProfitCreateUpdate(BaseModel):
    inventory_profit: condecimal(max_digits=10, decimal_places=2)


class InventoryProfitOut(BaseModel):
    center_id: UUID
    inventory_profit: float

    class Config:
        orm_mode = True