from pydantic import BaseModel
from typing import List
from datetime import datetime,date,time
class FoodOrder(BaseModel):
    id_food: int
    quantity: int
class CreateTicket(BaseModel):
    price: float
    id_seat: int
    id_room: int
    id_showtime: int

class CreateReceipt(BaseModel):
    method_pay: str
    id_user: int
    foods: List[FoodOrder]
    tickets: List[CreateTicket]

    class Config:
        from_attributes = True
class FoodDetail(BaseModel):
    id_food: int
    name: str
    price: float
    quantity: int
    total:int

class TicketDetail(BaseModel):
    id_ticket: int
    price: float
    id_seat: int
    id_room: int
    id_showtime: int
    room_name: str
    cinema_name: str

class ReceiptDetail(BaseModel):
    id_receipt: int
    time: datetime
    method_pay: str
    state: str
    foods: List[FoodDetail]
    tickets: List[TicketDetail]
    total_amount: float
    class Config:
        orm_mode = True
class ListReceipts(BaseModel):
    movie_name:str
    date_begin:date
    time_begin:time
    cinema_name:str
    id_receipt:int
    seats:list[str]
    class Config:
        orm_mode = True

