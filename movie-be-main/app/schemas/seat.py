from dataclasses import Field
from datetime import datetime,date,time
from typing import List
from typing import Optional
from pydantic import BaseModel

class Seat(BaseModel):
    name: str
    id_seat: int
    type: str
    state: str
    class Config:
        orm_mode = True
class ListSeat(BaseModel):
    seats: List[Seat]
    id_room: int
    id_showtime: int
    class Config:
        orm_mode = True
class Food(BaseModel):
    name: str
    id_food: int
    price: float
    class Config:
        orm_mode = True
class ListFood(BaseModel):
    foods: List[Food]
    class Config:
        orm_mode = True
class CreateSeat(BaseModel):
    id_seat: int
    id_room:int
    name: str
    type:str
    class Config:
        orm_mode = True

class ListCreateSeat(BaseModel):
    seats: List[CreateSeat]
    total_seat:int
    class Config:
        orm_mode = True