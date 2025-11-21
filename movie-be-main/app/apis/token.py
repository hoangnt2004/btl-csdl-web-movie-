from fastapi import FastAPI,Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas import *

from app.ultils import *

router=APIRouter( tags=["Oauth2"])

@router.post("/token",response_model=TokenData)
def checktoken(token:accessToken):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                          detail="Could not validate credentials",
                                          headers={"WWW-Authenticate": "Bearer"})
    token=verify_access_token(token.access_token,credentials_exception)
    return token