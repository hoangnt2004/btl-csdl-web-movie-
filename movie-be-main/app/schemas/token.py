from datetime import datetime

from pydantic import BaseModel,EmailStr
from typing_extensions import Optional
class Token(BaseModel):
    access_token: str
    token_type: str
class TokenData(BaseModel):
    id: Optional[int] = None
    id_role: Optional[int] = None
class accessToken(BaseModel):
    access_token: str
