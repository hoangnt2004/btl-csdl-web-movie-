from dataclasses import Field
from datetime import datetime,date,time
from typing import List
from typing import Optional
from pydantic import BaseModel

class Cinema(BaseModel):
    id_cinema: int
    name: str
    address: str
    class Config:
        orm_mode = True
class ListCinema(BaseModel):
    cinemas: List[Cinema]
    class Config:
        orm_mode = True
class ListDate(BaseModel):
    id_movie: int
    id_cinema: int
    dates: List[date]
    class Config:
        orm_mode = True


class ShowtimeTime(BaseModel):
    time: time
    id_showtime: int

    class Config:
        orm_mode = True


class ListTime(BaseModel):
    id_movie: int
    id_cinema: int
    date: date
    # Danh sách suất chiếu kèm id_showtime để FE dễ xử lý
    showtimes: List[ShowtimeTime]

    class Config:
        orm_mode = True

class CreateCinema(BaseModel):

    name: str
    address: str
    class Config:
        orm_mode = True
class ListCreateCinema(BaseModel):
    cinemas: List[CreateCinema]
    class Config:
        orm_mode = True

