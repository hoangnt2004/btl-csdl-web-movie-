from dns.e164 import query
from fastapi import FastAPI,Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.engine import row
from sqlalchemy.orm import Session
from app.core.database import get_db

from app.schemas import *
from app import model
from typing import Optional
from app.ultils import *

router=APIRouter(
    prefix="/seat",tags=["Seats"]
)
@router.get("/all",status_code=status.HTTP_200_OK,response_model=ListCreateSeat)
def get_all(db:Session=Depends(get_db)):
    seats=db.query(model.Seat).all()
    return {"seats": seats,"total_seat":len(seats)}
@router.get("/{id_showtime}",status_code=status.HTTP_200_OK,response_model=ListSeat)
def get_seats(id_showtime:int,db:Session=Depends(get_db)):
    result=(db.query(model.SeatStatus)
            .join(model.Seat,model.SeatStatus.id_seat==model.Seat.id_seat)
            .filter(model.SeatStatus.id_showtime==id_showtime)
            # .order_by(model.Seat.name.asc())
            ).all()
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    seats=[
        Seat(
            name=row.seat.name,
            id_seat=row.id_seat,
            type=row.seat.type,
            state=row.state
        )
        for row in result
    ]
    response = ListSeat(seats=seats,id_showtime=id_showtime,id_room=result[0].id_room)
    return response
