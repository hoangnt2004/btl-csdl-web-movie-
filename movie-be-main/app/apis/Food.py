from dns.e164 import query
from fastapi import FastAPI,Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.engine import row
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas import *
from app import model
from typing import Optional
from app.ultils import *

router=APIRouter(prefix="/food", tags=["Food"])
@router.get("/",status_code=status.HTTP_200_OK,response_model=ListFood)
async def get_food(db:Session=Depends(get_db)):
    query=db.query(model.Food).all()
    return {"foods": query}
