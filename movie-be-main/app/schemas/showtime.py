from pydantic import BaseModel
from datetime import datetime

class CreateShowtime(BaseModel):
    time_begin: datetime
    id_room: int
    id_movie: int

class ShowtimeResponse(BaseModel):
    id_showtime: int
    time_begin: datetime
    id_room: int
    id_movie: int

    class Config:
        orm_mode = True
class ShowtimeWithDetails(BaseModel):
    id_showtime: int
    time_begin: datetime
    movie_name: str
    room_name: str
    cinema_name: str

    class Config:
        orm_mode = True