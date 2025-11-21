from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class ReviewBase(BaseModel):
    score: float
    description: Optional[str] = None

class CreateReview(ReviewBase):
    id_movie: int
    id_user: int
    
class UpdateReview(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id_review: int
    id_movie: int
    id_user: int
    user_name: str
    
    class Config:
        orm_mode = True

class PageableReviews(BaseModel):
    reviews: List[ReviewResponse]
    total: int
    page: int
    size: int
    total_pages: int
    
    class Config:
        orm_mode = True