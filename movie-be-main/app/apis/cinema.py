from http.client import HTTPResponse

from fastapi import FastAPI,Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from sqlalchemy.orm.sync import update

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
    prefix="/cinema",tags=["Cinema"]
)
@router.get("/all",status_code=status.HTTP_200_OK,response_model=ListCinema)
def get_all_cinema(db:Session=Depends(get_db)):
    cinemas = db.query(model.Cinema).order_by(model.Cinema.id_cinema.asc()).all()
    return {"cinemas": cinemas}

@router.get("/get_cinema/{id_movie}",status_code=status.HTTP_200_OK,response_model=ListCinema)
def get_cinema(id_movie:int,db: Session= Depends(get_db)):
    cinemas=(
        db.query(model.Cinema).join(model.Room, model.Cinema.id_cinema == model.Room.id_cinema)
        .join(model.Showtime,model.Room.id_room==model.Showtime.id_room)
        .filter(model.Showtime.id_movie==id_movie)
        .distinct()
        .all()
    )
    return {"cinemas":cinemas}
@router.get("/get_date/{id_movie}/{id_cinema}", status_code=status.HTTP_200_OK, response_model=ListDate)
def get_date(id_movie: int, id_cinema: int, db: Session = Depends(get_db)):
    today = datetime.now().date()   # dùng giờ VN, không dùng UTC

    dates = (
        db.query(func.date(model.Showtime.time_begin).label("date"))
        .join(model.Room, model.Showtime.id_room == model.Room.id_room)
        .filter(
            model.Showtime.id_movie == id_movie,
            model.Room.id_cinema == id_cinema,
            func.date(model.Showtime.time_begin) >= today
        )
        .distinct()
        .all()
    )

    return ListDate(
        id_movie=id_movie,
        id_cinema=id_cinema,
        dates=[row.date for row in dates]
    )
@router.get("/get_time/{id_movie}/{id_cinema}/{date}",status_code=status.HTTP_200_OK,response_model=ListTime)
def get_time(id_movie:int,id_cinema:int,date:str,db: Session=Depends(get_db)):
    date_obj = datetime.strptime(date, "%Y-%m-%d").date()
    times_data=(
        db.query(cast(model.Showtime.time_begin, Time).label("time"),
                 model.Showtime.id_showtime)  # ✅ Sửa lỗi PostgreSQL
        .join(model.Room, model.Room.id_room == model.Showtime.id_room)
        .filter(
            model.Room.id_cinema == id_cinema,
            model.Showtime.id_movie == id_movie,
            func.date(model.Showtime.time_begin) == date_obj
        )
        .distinct()
        .all()
    )
    # Trả về danh sách suất chiếu kèm id_showtime để FE dễ xử lý
    return ListTime(
        id_movie=id_movie,
        id_cinema=id_cinema,
        date=date_obj,
        showtimes=[
            ShowtimeTime(time=row.time, id_showtime=row.id_showtime)
            for row in times_data
        ],
    )

@router.post("/",status_code=status.HTTP_201_CREATED,response_model=CreateCinema)
def create_cinema(cinema:CreateCinema,db: Session=Depends(get_db)):
    new_cinema=model.Cinema(name=cinema.name,address=cinema.address)
    db.add(new_cinema)
    db.commit()
    db.refresh(new_cinema)
    return new_cinema
@router.put("/{id}",status_code=status.HTTP_200_OK,response_model=CreateCinema)
def revise_cinema(id:int,cinema:CreateCinema,db: Session=Depends(get_db)):
    update_cinema=db.query(model.Cinema).filter(model.Cinema.id_cinema==id)
    f_cinema=update_cinema.first()
    if not f_cinema:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    else:
        update_cinema.update(cinema.model_dump(),synchronize_session=False)
        db.commit()

    return update_cinema.first()
@router.delete("/{id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_cinema(id:int,db: Session=Depends(get_db)):
    delete_cinema=db.query(model.Cinema).filter(model.Cinema.id_cinema==id)
    if not delete_cinema.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    else:
        delete_cinema.delete(synchronize_session=False)
        db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
