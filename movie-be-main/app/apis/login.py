from fastapi import FastAPI,Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from app.core.database import get_db,engine
from sqlalchemy.exc import IntegrityError
from app.schemas import *
from app import model
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from app.ultils import *

router=APIRouter(
    tags=["Authentication"]
)
@router.post("/login")
def login(user_credentials:OAuth2PasswordRequestForm=Depends(),db:Session=Depends(get_db)):
    user = db.query(model.User).filter(model.User.email==user_credentials.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Incorrect email")
    if not verify_password(user_credentials.password,user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Incorrect password")
    access_token,expire = create_access_token(data={'user_id': user.id_user,"id_role":user.id_role})

    return {"access_token": access_token, "token_type": "bearer","expire":expire}
@router.post("/register",status_code=status.HTTP_201_CREATED,response_model=UserOut)
def register(user: UserRegister, db: Session = Depends(get_db)):
    try:
        user.password = hash_password(user.password)
        new_user = model.User(**user.model_dump())
        new_user.id_role = 1
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="User already exists")

