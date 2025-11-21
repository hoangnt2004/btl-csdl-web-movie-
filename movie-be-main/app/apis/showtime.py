from fastapi import FastAPI,Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from sqlalchemy.orm.sync import update
from starlette.status import HTTP_200_OK
from sqlalchemy import desc
from app.core.database import get_db
from sqlalchemy.sql import func
from sqlalchemy import cast, Time
from app.model import Showtime
from app.schemas import *
from app import model
from typing import Optional
from app.ultils import *

from datetime import date,time,datetime

router=APIRouter(
    prefix="/showtime",tags=["Showtimes"]
)
@router.get("/all", response_model=list[ShowtimeWithDetails])
def get_all_showtimes(db: Session = Depends(get_db)):
    # Join giữa Showtime, Movie, Room, Cinema
    results = (
        db.query(
            model.Showtime.id_showtime,
            model.Showtime.time_begin,
            model.Movie.name.label("movie_name"),
            model.Room.name.label("room_name"),
            model.Cinema.name.label("cinema_name"),
        )
        .join(model.Movie, model.Showtime.id_movie == model.Movie.id_movie)
        .join(model.Room, model.Showtime.id_room == model.Room.id_room)
        .join(model.Cinema, model.Room.id_cinema == model.Cinema.id_cinema)
        .order_by(desc(model.Showtime.time_begin))
        .all()
    )

    return results


@router.post("/", response_model=ShowtimeResponse, status_code=status.HTTP_201_CREATED)
def create_showtime(showtime: CreateShowtime, db: Session = Depends(get_db)):
    new_showtime = model.Showtime(**showtime.model_dump())
    db.add(new_showtime)
    db.commit()
    db.refresh(new_showtime)

    # ✅ Khởi tạo SeatStatus cho tất cả ghế của phòng này
    seats = db.query(model.Seat).filter(model.Seat.id_room == showtime.id_room).all()
    for seat in seats:
        seat_status = model.SeatStatus(
            id_seat=seat.id_seat,
            id_room=seat.id_room,
            id_showtime=new_showtime.id_showtime,
            state='AVAILABLE'
        )
        db.add(seat_status)
    db.commit()

    return new_showtime


@router.put("/{id}", response_model=ShowtimeResponse)
def update_showtime(id: int, showtime: CreateShowtime, db: Session = Depends(get_db)):
    query = db.query(model.Showtime).filter(model.Showtime.id_showtime == id)
    if not query.first():
        raise HTTPException(status_code=404, detail="Showtime not found")

    query.update(showtime.model_dump(), synchronize_session=False)
    db.commit()
    return query.first()


#
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_showtime(id: int, db: Session = Depends(get_db)):
    showtime = db.query(model.Showtime).filter(model.Showtime.id_showtime == id).first()
    if not showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    db.delete(showtime)
    db.commit()

