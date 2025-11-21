from dns.e164 import query
from fastapi import FastAPI,Response,status,HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from app.core.database import get_db

from app.schemas import *
from app import model
from typing import Optional
from app.schemas.movie import PageableMovies
from app.ultils import *
from math import ceil

router=APIRouter(
    prefix="/movie",tags=["Movies"]
)
@router.get("/all",status_code=status.HTTP_200_OK,response_model=ListMoviesAll)
async def get_all_movies(db:Session=Depends(get_db)):
    movies=db.query(model.Movie).order_by(model.Movie.state.asc()).all()
    if not movies:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"movies":movies,"total":len(movies)}


@router.get("/pageable", status_code=status.HTTP_200_OK, response_model=PageableMovies)
def get_pageable_movies(
    page: int = 1, 
    size: int = 10, 
    state: Optional[str] = None, 
    type_id: Optional[int] = None, 
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách phim có phân trang.
    
    Parameters:
    - page: Số trang (bắt đầu từ 1)
    - size: Số lượng phim mỗi trang
    - state: Trạng thái phim ("COMING_SOON", "NOW_SHOWING", "ENDED")
    - type_id: ID của thể loại phim
    """
    # Đảm bảo tham số hợp lệ
    if page < 1:
        page = 1
    if size < 1:
        size = 10
        
    # Tạo query cơ bản
    query = db.query(model.Movie)
    
    # Áp dụng bộ lọc nếu có
    if type_id is not None:
        query = query.join(model.MovieType).filter(model.MovieType.id_type == type_id)
    
    if state is not None:
        query = query.filter(model.Movie.state == state)
    
    # Đếm tổng số phim phù hợp với bộ lọc
    total_items = query.count()
    
    # Tính tổng số trang
    total_pages = ceil(total_items / size)
    
    # Lấy danh sách phim cho trang hiện tại
    movies = query.offset((page - 1) * size).limit(size).all()
    
    # Trả về kết quả
    return {
        "movies": movies,
        "total": total_items,
        "page": page,
        "size": size,
        "total_pages": total_pages
    }


@router.get("/",status_code=status.HTTP_200_OK, response_model=ListMovies)
def get_movies_by_state_id(state: Optional[str] = None, type_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(model.Movie)
    if type_id is not None:
        query=query.join(model.MovieType).filter(model.MovieType.id_type==type_id)

    if state is not None:
        query=query.filter(model.Movie.state==state)
    movies = query.all()
    if not movies:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No movies found")

    print(len(movies))
    return {"movies": movies}

@router.get("/recent", status_code=status.HTTP_200_OK,response_model=ListMovies)
def get_7_recent_movies(db: Session = Depends(get_db)):
    """
    Lấy 7 phim mới ra mắt (NOW_SHOWING) gần đây nhất,
    dựa trên trường time_release (mới nhất => time_release lớn nhất).
    """
    movies = (db.query(model.Movie)
                .filter(model.Movie.state == "NOW_SHOWING")      # Chỉ lấy phim đang chiếu
                .order_by(model.Movie.time_release.desc())       # Sắp xếp theo time_release giảm dần
                .limit(7)                                        # Lấy tối đa 7 phim
                .all())

    if not movies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phim nào"
        )

    return {"movies": movies}

@router.get("/banner",status_code=status.HTTP_200_OK,response_model=ListMovieBanners)
def get_movie_banners(state :str,db:Session=Depends(get_db )):
    movies=db.query(model.Movie).filter(model.Movie.state==state , model.Movie.banner.isnot(None)).all()
    if not movies:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    print(len(movies))
    return {"movies":movies}
@router.get("/{id}", status_code=status.HTTP_200_OK,response_model=MovieDetail)
async def get_details(id: int,db: Session = Depends(get_db) ):
    movie = db.query(model.Movie).join(model.MovieType).join(model.Type).filter(model.Movie.id_movie==id).all()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
    types =[mt.type.name for m in movie for mt in m.movie_type]

    response ={
        "id_movie":id,
        "name":movie[0].name,
        "type":types,
        "actor":movie[0].actor,
        "director":movie[0].director,
        "time":movie[0].time,
        "poster":movie[0].poster,
        "overview":movie[0].overview,
        "state":movie[0].state,
        "trailer_url": movie[0].trailer_url,
    }
    return response
@router.post("/",response_model=MovieResponse,status_code=status.HTTP_201_CREATED)
def create_movie(movie: CreateMovie,db:Session=Depends(get_db)):
    movie.age_limit="NONE"
    new_movie = model.Movie(**movie.model_dump(exclude={"id_type"}))
    db.add(new_movie)
    db.commit()
    db.refresh(new_movie)
    for type_id in movie.id_type:
        db.add(model.MovieType(id_movie=new_movie.id_movie,id_type=type_id))
    db.commit()
    return new_movie
@router.put("/revise/{id}", response_model=MovieResponse,status_code=status.HTTP_200_OK)
def update_movie(id:int,movie:CreateMovie,db:Session=Depends(get_db)):
    movie_update=db.query(model.Movie).filter(model.Movie.id_movie==id)
    tmp=movie_update.first()
    movie.banner=tmp.banner
    movie.poster=tmp.poster
    movie.time_release=tmp.time_release
    if not movie_update.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
    movie_update.update(movie.model_dump(exclude={"id_type"}), synchronize_session=False)
    db.commit()
    db.query(model.MovieType).filter(model.MovieType.id_movie == id).delete()
    # Tạo liên kết mới
    for type_id in movie.id_type:
        db.add(model.MovieType(id_movie=id, id_type=type_id))
    db.commit()

    return movie_update.first()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(id:int,db:Session=Depends(get_db)):
    movie = db.query(model.Movie).filter(model.Movie.id_movie==id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
    db.query(model.MovieType).filter(model.MovieType.id_movie == id).delete()
    db.delete(movie)
    db.commit()

