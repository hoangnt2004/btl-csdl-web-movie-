from dataclasses import Field
from datetime import datetime,date,time
from typing import List
from typing import Optional

from fastapi.openapi.models import Schema
from pydantic import BaseModel

class CreateRoom(BaseModel):
    name: str
    type: str
    id_cinema:int
    numbers_seat:int
    class Config:
        orm_mode = True
class Room(BaseModel):
    name: str
    type: str
    id_cinema: int
    id_room:int
class ListRoom(BaseModel):
    rooms:List[Room]
    class Config:
        orm_mode = True
class RoomResponse(BaseModel):
    name: str
    type: str
    id_cinema: int
    id_room: int
    total_seat:int
class ListRoomResponse(BaseModel):
    rooms:List[RoomResponse]
    class Config:
        orm_mode = True
class RiveRoom(BaseModel):
    name: str
    type: str
    id_cinema: int


    class Config:
        orm_mode = True