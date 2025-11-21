from dataclasses import Field
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel,EmailStr
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone_number: str
    class Config:
        orm_mode = True
class UserOut(BaseModel):
    email: EmailStr
    name: str
    class Config:
        orm_mode = True
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    class Config:
        orm_mode = True
class UserRoles(BaseModel):
    id: int
    id_role:int
    class Config:
        orm_mode = True
class User(BaseModel):
    name: str
    email: str
    phone_number: str
    id_user:int
    class Config:
        orm_mode = True

class ListUsers(BaseModel):
    users: List[User]
    class Config:
        orm_mode = True

class ReviseUser(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    class Config:
        orm_mode = True

class PageableUsers(BaseModel):
    users: List[User]
    total: int
    page: int
    size: int
    total_pages: int
    
    class Config:
        orm_mode = True
