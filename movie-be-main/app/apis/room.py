from fastapi import FastAPI,Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from app.core.database import get_db
from sqlalchemy.sql import func
from sqlalchemy import cast, Time
from app.model import Showtime
from app.schemas import *
from app import model
from typing import Optional
from app.ultils import *

from datetime import date,time,datetime

router=APIRouter(prefix="/room",tags=['Room'])
@router.get("/",status_code=status.HTTP_200_OK)
def get_room_type(id_showtime:int,db:Session()=Depends(get_db)):
    room = (db.query(model.Room) .join(model.SeatStatus, model.Room.id_room == model.SeatStatus.id_room)
            .filter(model.SeatStatus.id_showtime == id_showtime)) .first()

    return {"type": room.type}
@router.post("/create",status_code=status.HTTP_201_CREATED,response_model=Room)
def create_room(room:CreateRoom,db:Session()=Depends(get_db)):
    new_room=model.Room(name=room.name,type=room.type,id_cinema=room.id_cinema)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    number_seat=room.numbers_seat
    Name=['A',"B","C","D","E","F","G","H","I","J"]
    for i in range(number_seat):
        id_seat=i+1
        tmp=i//10
        name=Name[tmp] +str(i%10+1)
        types="Thường"
        if Name[tmp] =="D" or Name[tmp] =="E" or Name[tmp] =="F":
            types="VIP"
        new_seat=model.Seat(name=name,type=types,id_room=new_room.id_room,id_seat=id_seat)
        db.add(new_seat)
    db.commit()
    return new_room
@router.get("/all",status_code=status.HTTP_200_OK,response_model=ListRoom)
def get_all_rooms(db:Session()=Depends(get_db)):
    result=db.query(model.Room).all()
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    else:
        return {"rooms":result}
@router.get("/by_cinema",status_code=status.HTTP_200_OK,response_model=ListRoomResponse)
def get_rooms_by_cinema(id_cinema:int,db:Session()=Depends(get_db)):
    result= (
        db.query(model.Room.id_room,
                 model.Room.name,
                 model.Room.type,
                 model.Room.id_cinema,
                 func.count(model.Seat.id_seat).label("total_seat")
        )
        .join(model.Seat,model.Seat.id_room == model.Room.id_room)
        .filter(model.Room.id_cinema == id_cinema)
        .group_by(model.Room.id_room)
        .all()

    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"rooms":[
        {
            "id_room":r.id_room,
            "name":r.name,
            "type":r.type,
            "id_cinema":r.id_cinema,
            "total_seat":r.total_seat
        }
        for r in result
    ]}


@router.delete("/{id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_room(id:int,db:Session()=Depends(get_db)):
    delete_room = db.query(model.Room).filter(model.Room.id_room==id)
    if not delete_room.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    else:
        delete_room.delete(synchronize_session=False)
        db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
@router.put("/{id}",status_code=status.HTTP_202_ACCEPTED,response_model=RiveRoom)
def update_room(id:int,room:RiveRoom,db:Session()=Depends(get_db)):
    update_room = db.query(model.Room).filter(model.Room.id_room==id)
    if not update_room.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    else:
        update_room.update(room.model_dump(),synchronize_session=False)
        db.commit()
    return update_room.first()