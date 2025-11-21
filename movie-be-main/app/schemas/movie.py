from dataclasses import Field
from datetime import datetime, date
from typing import List, Optional

from pydantic import BaseModel


class Movie(BaseModel):
    name: str
    id_movie: int
    poster: str
    state: str
    id_type: List[int]
    # Link trailer (tùy chọn)
    trailer_url: Optional[str] = None

    class Config:
        orm_mode = True

class ListMovies(BaseModel):
    movies: List[Movie]
    class Config:
        orm_mode = True

class MovieBaner(BaseModel):
    banner: str
    id_movie: int
    class Config:
        orm_mode = True

class ListMovieBanners(BaseModel):
    movies: List[MovieBaner]

class MovieType(BaseModel):
    id_movie: int
    id_type: int

class MovieDetail(BaseModel):
    id_movie: int
    name: str
    actor: Optional[str]
    director: Optional[str]
    type: List[str]
    time : Optional[int]
    poster: str
    overview: Optional[str]
    state: str
    trailer_url: Optional[str] = None

    class Config:
        orm_mode = True

class MovieBase(BaseModel):
    name: str
    time: Optional[int] = None
    age_limit: str = "NONE"  # "NONE", "T13", "T18"
    director: Optional[str] = None
    actor: Optional[str] = None
    poster: Optional[str] = None
    banner: Optional[str] = None
    time_release: Optional[datetime] = None
    overview: Optional[str] = None
    state: str  # "COMING_SOON", "NOW_SHOWING", "ENDED"
    trailer_url: Optional[str] = None
    id_type: List[int]  # danh sách id_type từ bảng Type

class CreateMovie(MovieBase):
    pass

class MovieResponse(MovieBase):
    id_movie: int

    class Config:
        orm_mode = True

class MovieAll(BaseModel):
    id_movie: int
    name: str
    time: Optional[int] = None
    time_release: Optional[datetime] = None
    state: str

class ListMoviesAll(BaseModel):
    movies: List[MovieAll]
    total:int
    class Config:
        orm_mode = True

class PageableMovies(BaseModel):
    movies: List[Movie]
    total: int
    page: int
    size: int
    total_pages: int
    
    class Config:
        orm_mode = True
