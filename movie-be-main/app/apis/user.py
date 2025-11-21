from dns.e164 import query
from fastapi import FastAPI,Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from app.core.database import get_db
from math import ceil

from app.schemas import *
from app import model
from typing import Optional
from app.ultils import *

router=APIRouter(
    prefix="/user",tags=["User"]
)
@router.get("/all",status_code=status.HTTP_200_OK,response_model=ListUsers)
def get_Users(db:Session=Depends(get_db)):
    query = db.query(model.User).filter(model.User.id_role == 1).order_by(model.User.id_user.asc()) .all()
    return {"users":query}
@router.delete("/{id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_User(id:int,db:Session=Depends(get_db)):
    delete_user=db.query(model.User).filter(model.User.id_user==id)
    if not delete_user.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    delete_user.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
@router.post("",status_code=status.HTTP_201_CREATED,response_model=UserOut)
def create_User(UserInput:UserRegister,db:Session=Depends(get_db)):
    password=hash_password(UserInput.password)
    new_user=model.User(name=UserInput.name,email=UserInput.email,
                        password=password,id_role=1,phone_number=UserInput.phone_number)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/pageable", status_code=status.HTTP_200_OK, response_model=PageableUsers)
def get_pageable_users(
    page: int = 1, 
    size: int = 10, 
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách người dùng có phân trang.
    
    Parameters:
    - page: Số trang (bắt đầu từ 1)
    - size: Số lượng người dùng mỗi trang
    """
    # Đảm bảo tham số hợp lệ
    if page < 1:
        page = 1
    if size < 1:
        size = 10
        
    # Tạo query cơ bản - chỉ lấy người dùng thông thường (id_role = 1)
    query = db.query(model.User).filter(model.User.id_role == 1)
    
    # Đếm tổng số người dùng
    total_items = query.count()
    
    # Tính tổng số trang
    total_pages = ceil(total_items / size)
    
    # Lấy danh sách người dùng cho trang hiện tại
    users = query.order_by(model.User.id_user.asc()).offset((page - 1) * size).limit(size).all()
    
    # Trả về kết quả
    return {
        "users": users,
        "total": total_items,
        "page": page,
        "size": size,
        "total_pages": total_pages
    }



@router.put("/{id}",status_code=status.HTTP_202_ACCEPTED,response_model=UserOut)
def revise_User(id:int,UserInput:ReviseUser,db:Session=Depends(get_db)):
    update_user=db.query(model.User).filter(model.User.id_user==id)
    f_user=update_user.first()
    if not f_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    else:
        update_user.update(UserInput.model_dump(),synchronize_session=False)
        db.commit()
        db.refresh(f_user)
    return update_user.first()

