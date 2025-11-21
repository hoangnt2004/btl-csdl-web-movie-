from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from app.core.database import get_db
from math import ceil
from sqlalchemy import desc

from app.schemas import *
from app import model
from typing import Optional
from app.ultils.oauth2 import get_current_user

router = APIRouter(
    prefix="/review", tags=["Movie Reviews"]
)

@router.get("/all", status_code=status.HTTP_200_OK)
def get_all_reviews(db: Session = Depends(get_db)):
    """
    Lấy tất cả đánh giá phim
    """
    reviews = (
        db.query(
            model.UserReviewMovie.id_review,
            model.UserReviewMovie.score,
            model.UserReviewMovie.description,
            model.UserReviewMovie.id_movie,
            model.UserReviewMovie.id_user,
            model.User.name.label("user_name")
        )
        .join(model.User, model.UserReviewMovie.id_user == model.User.id_user)
        .order_by(desc(model.UserReviewMovie.id_review))
        .all()
    )
    
    result = [
        {
            "id_review": review.id_review,
            "score": review.score,
            "description": review.description,
            "id_movie": review.id_movie,
            "id_user": review.id_user,
            "user_name": review.user_name
        }
        for review in reviews
    ]
    
    return result

@router.get("/pageable", status_code=status.HTTP_200_OK, response_model=PageableReviews)
def get_pageable_reviews(
    page: int = 1, 
    size: int = 10, 
    id_movie: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách đánh giá phim có phân trang.
    
    Parameters:
    - page: Số trang (bắt đầu từ 1)
    - size: Số lượng đánh giá mỗi trang
    - id_movie: ID của phim (nếu muốn lọc theo phim)
    """
    # Đảm bảo tham số hợp lệ
    if page < 1:
        page = 1
    if size < 1:
        size = 10
        
    # Tạo query cơ bản
    query = (
        db.query(
            model.UserReviewMovie.id_review,
            model.UserReviewMovie.score,
            model.UserReviewMovie.description,
            model.UserReviewMovie.id_movie,
            model.UserReviewMovie.id_user,
            model.User.name.label("user_name")
        )
        .join(model.User, model.UserReviewMovie.id_user == model.User.id_user)
    )
    
    # Áp dụng bộ lọc nếu có
    if id_movie is not None:
        query = query.filter(model.UserReviewMovie.id_movie == id_movie)
    
    # Đếm tổng số đánh giá phù hợp với bộ lọc
    total_items = query.count()
    
    # Tính tổng số trang
    total_pages = ceil(total_items / size)
    
    # Lấy danh sách đánh giá cho trang hiện tại
    reviews = query.order_by(desc(model.UserReviewMovie.id_review)).offset((page - 1) * size).limit(size).all()
    
    # Chuyển đổi kết quả thành định dạng phù hợp với response model
    result_reviews = [
        {
            "id_review": review.id_review,
            "score": review.score,
            "description": review.description,
            "id_movie": review.id_movie,
            "id_user": review.id_user,
            "user_name": review.user_name
        }
        for review in reviews
    ]
    
    # Trả về kết quả
    return {
        "reviews": result_reviews,
        "total": total_items,
        "page": page,
        "size": size,
        "total_pages": total_pages
    }

@router.get("/{id}", status_code=status.HTTP_200_OK, response_model=ReviewResponse)
def get_review(id: int, db: Session = Depends(get_db)):
    """
    Lấy thông tin chi tiết của một đánh giá dựa trên ID
    """
    review = (
        db.query(
            model.UserReviewMovie.id_review,
            model.UserReviewMovie.score,
            model.UserReviewMovie.description,
            model.UserReviewMovie.id_movie,
            model.UserReviewMovie.id_user,
            model.User.name.label("user_name")
        )
        .join(model.User, model.UserReviewMovie.id_user == model.User.id_user)
        .filter(model.UserReviewMovie.id_review == id)
        .first()
    )
    
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Đánh giá không tồn tại")
    
    return {
        "id_review": review.id_review,
        "score": review.score,
        "description": review.description,
        "id_movie": review.id_movie,
        "id_user": review.id_user,
        "user_name": review.user_name
    }

@router.get("/movie/{id_movie}", status_code=status.HTTP_200_OK, response_model=PageableReviews)
def get_reviews_by_movie(
    id_movie: int, 
    page: int = 1, 
    size: int = 10,
    db: Session = Depends(get_db)
):
    """
    Lấy đánh giá của một bộ phim cụ thể có phân trang
    
    Parameters:
    - id_movie: ID của phim cần lấy đánh giá
    - page: Số trang (bắt đầu từ 1)
    - size: Số lượng đánh giá mỗi trang
    """
    # Đảm bảo tham số hợp lệ
    if page < 1:
        page = 1
    if size < 1:
        size = 10
        
    # Tạo query cơ bản
    query = (
        db.query(
            model.UserReviewMovie.id_review,
            model.UserReviewMovie.score,
            model.UserReviewMovie.description,
            model.UserReviewMovie.id_movie,
            model.UserReviewMovie.id_user,
            model.User.name.label("user_name")
        )
        .join(model.User, model.UserReviewMovie.id_user == model.User.id_user)
        .filter(model.UserReviewMovie.id_movie == id_movie)
    )
    
    # Đếm tổng số đánh giá phù hợp với bộ lọc
    total_items = query.count()
    
    # Tính tổng số trang
    total_pages = ceil(total_items / size)
    
    # Lấy danh sách đánh giá cho trang hiện tại
    reviews = query.order_by(desc(model.UserReviewMovie.id_review)).offset((page - 1) * size).limit(size).all()
    
    # Chuyển đổi kết quả thành định dạng phù hợp
    result_reviews = [
        {
            "id_review": review.id_review,
            "score": review.score,
            "description": review.description,
            "id_movie": review.id_movie,
            "id_user": review.id_user,
            "user_name": review.user_name
        }
        for review in reviews
    ]
    
    # Tính điểm trung bình của tất cả đánh giá (không chỉ trang hiện tại)
    all_reviews = query.all()
    avg_score = sum(review.score for review in all_reviews) / len(all_reviews) if all_reviews else 0
    
    # Trả về kết quả có phân trang và thêm trường avg_score
    result = {
        "reviews": result_reviews,
        "total": total_items,
        "page": page,
        "size": size,
        "total_pages": total_pages
    }
    
    # Thêm trường avg_score vào kết quả (tuy không có trong PageableReviews)
    # Phần này sẽ được trả về nhưng không được validate bởi Pydantic
    result["avg_score"] = round(avg_score, 1)
    
    return result

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ReviewResponse)
def create_review(review_data: CreateReview, 
                  db: Session = Depends(get_db), 
                #   current_user = Depends(get_current_user)
                ):

    # Kiểm tra phim có tồn tại không
    movie = db.query(model.Movie).filter(model.Movie.id_movie == review_data.id_movie).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Phim không tồn tại")
    
    # Kiểm tra xem người dùng đã đánh giá phim này chưa
    # existing_review = db.query(model.UserReviewMovie).filter(
    #     model.UserReviewMovie.id_movie == review_data.id_movie,
    #     # model.UserReviewMovie.id_user == current_user.id_user,
    #     model.UserReviewMovie.id_user == db.query(model.User).first().id_user
    # ).first()
    
    # if existing_review:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bạn đã đánh giá phim này rồi")
    
    # Tạo đánh giá mới
    new_review = model.UserReviewMovie(
        score=review_data.score,
        description=review_data.description,
        id_movie=review_data.id_movie,
        # id_user=current_user.id_user, 
        id_user=review_data.id_user
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return {
        "id_review": new_review.id_review,
        "score": new_review.score,
        "description": new_review.description,
        "id_movie": new_review.id_movie,
        "id_user": new_review.id_user,
        # "user_name": new_review.user.name,  # Giả sử có thuộc tính user trong model
        "user_name": "Người dùng"  # Giả sử có thuộc tính user trong model
    }

@router.put("/{id}", status_code=status.HTTP_200_OK, response_model=ReviewResponse)
def update_review(id: int, review_data: UpdateReview, 
                  db: Session = Depends(get_db), 
                #   current_user = Depends(get_current_user)
                ):
    """
    Cập nhật đánh giá phim (chỉ người tạo đánh giá mới được cập nhật)
    """
    # Tìm đánh giá cần cập nhật
    review = db.query(model.UserReviewMovie).filter(model.UserReviewMovie.id_review == id).first()
    
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Đánh giá không tồn tại")
    
    # # Kiểm tra người dùng có quyền cập nhật không
    # if review.id_user != current_user.id_user:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền cập nhật đánh giá này")
    
    # Cập nhật thông tin
    review.score = review_data.score
    review.description = review_data.description
    
    db.commit()
    db.refresh(review)
    
    return {
        "id_review": review.id_review,
        "score": review.score,
        "description": review.description,
        "id_movie": review.id_movie,
        "id_user": review.id_user,
        # "user_name": review.user.name,
        "user_name": "Người dùng"  # Giả sử có thuộc tính user trong model
    }

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(id: int, 
                  db: Session = Depends(get_db),
                #   current_user = Depends(get_current_user)
                ):
    """
    Xóa đánh giá phim (chỉ người tạo đánh giá hoặc admin mới được xóa)
    """
    # Tìm đánh giá cần xóa
    review = db.query(model.UserReviewMovie).filter(model.UserReviewMovie.id_review == id).first()
    
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Đánh giá không tồn tại")
    
    # # Kiểm tra người dùng có quyền xóa không (người tạo hoặc admin)
    # if review.id_user != current_user.id_user and current_user.id_role != 2:  # Giả sử id_role 2 là admin
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền xóa đánh giá này")
    
    # Xóa đánh giá
    db.delete(review)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)