from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from pydantic import EmailStr
from sqlalchemy.schema import PrimaryKeyConstraint,ForeignKeyConstraint
from sqlalchemy import DateTime, text
class Cinema(Base):
    __tablename__ = 'cinema'
    id_cinema = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    address = Column(String(255))


class Room(Base):
    __tablename__ = 'room'
    id_room = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50))
    id_cinema = Column(Integer, ForeignKey('cinema.id_cinema', onupdate="CASCADE"), nullable=False)

    cinema = relationship("Cinema", backref="rooms")


class Seat(Base):
    __tablename__ = 'seat'
    name = Column(String(50), nullable=False)
    id_seat = Column(Integer, nullable=False)  # Không tự động tăng, vì xác định bởi id_room
    id_room = Column(Integer, ForeignKey('room.id_room', ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    type = Column(String(50), nullable=True)

    # Khóa chính tổng hợp gồm `id_seat` và `id_room`
    __table_args__ = (PrimaryKeyConstraint('id_seat', 'id_room'),)

    # Quan hệ với Room (thực thể mạnh)
    room = relationship("Room", backref="seats", passive_deletes=True)


class Showtime(Base):
    __tablename__ = 'showtime'
    id_showtime = Column(Integer, primary_key=True, autoincrement=True)
    time_begin = Column(DateTime, nullable=False)
    id_room = Column(Integer, ForeignKey('room.id_room', onupdate="CASCADE"), nullable=False)
    id_movie = Column(Integer, ForeignKey('movie.id_movie', onupdate="CASCADE"), nullable=False)
    seat_status = relationship(
        "SeatStatus",
        backref="showtime",
        cascade="all, delete-orphan",  # <--- Quan trọng
        passive_deletes=True  # <--- Quan trọng khi dùng ondelete="CASCADE"
    )
    room = relationship("Room", backref="showtimes")



class SeatStatus(Base):
    __tablename__ = 'seat_status'

    id_seat = Column(Integer, nullable=False)
    id_room = Column(Integer, ForeignKey("room.id_room"), nullable=False)
    id_showtime = Column(Integer, ForeignKey('showtime.id_showtime', ondelete="CASCADE"), nullable=False)
    state = Column(Enum('AVAILABLE', 'BOOKED', 'RESERVED', name="seat_state"), nullable=False, default='AVAILABLE')

    __table_args__ = (
        PrimaryKeyConstraint('id_seat', 'id_room', 'id_showtime'),
        ForeignKeyConstraint(['id_seat', 'id_room'], ['seat.id_seat', 'seat.id_room'], ondelete="CASCADE")
    )

    # Quan hệ với bảng `Showtime`

    seat = relationship("Seat", backref="seat_status")


class Movie(Base):
    __tablename__ = 'movie'
    id_movie = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    time = Column(Integer)
    age_limit = Column(Enum('NONE', 'T13', 'T18', name="movie_age_limit"), nullable=False, default="NONE")
    director = Column(String(255))
    actor = Column(String(255))
    poster = Column(String(255))
    banner = Column(String(255))
    # Link trailer (ví dụ: YouTube)
    trailer_url = Column(String(500))
    time_release = Column(DateTime)
    overview = Column(String(5000))
    state = Column(Enum('COMING_SOON', 'NOW_SHOWING', 'ENDED', name="movie_state"), nullable=False,
                   default="COMING_SOON")

    showtime = relationship("Showtime", backref="movies")
    @property
    def id_type(self):
        return [mt.id_type for mt in self.movie_type]

class Ticket(Base):
    __tablename__ = 'ticket'

    id_ticket = Column(Integer, primary_key=True, autoincrement=True)
    price = Column(Float, nullable=False)

    receipt_id = Column(Integer, ForeignKey("receipt.id_receipt", onupdate="CASCADE"), nullable=False)
    id_seat = Column(Integer, nullable=False)
    id_room = Column(Integer, ForeignKey('room.id_room', onupdate="CASCADE"), nullable=False)
    id_showtime = Column(Integer, ForeignKey('showtime.id_showtime', onupdate="CASCADE"), nullable=False)

    # Khóa ngoại kết hợp đến seat (id_seat, id_room)
    __table_args__ = (
        ForeignKeyConstraint(
            ['id_seat', 'id_room'],
            ['seat.id_seat', 'seat.id_room'],
            onupdate="CASCADE"
        ),
    )

    receipt = relationship("Receipt", back_populates="tickets")
    room = relationship("Room", backref="tickets")
    seat = relationship("Seat", backref="tickets")
    showtime = relationship("Showtime", backref="tickets")
class Receipt(Base):
    __tablename__ = 'receipt'
    id_receipt = Column(Integer, primary_key=True, autoincrement=True)
    time = Column(DateTime, nullable=False, server_default=text("now()"))
    method_pay = Column(String(50))
    state = Column(Enum('PENDING', 'PAID', 'CANCELED', name="payment_state"), nullable=False, default='PAID')
    # id_ticket = Column(Integer, ForeignKey('ticket.id_ticket', onupdate="CASCADE"), nullable=False)
    id_food = Column(Integer, ForeignKey('food.id_food', onupdate="CASCADE"), nullable=True)
    id_user = Column(Integer, ForeignKey('user.id_user', onupdate="CASCADE"), nullable=False)

    food = relationship("Food", backref="receipts")
    user = relationship("User", backref="receipts")
    tickets = relationship("Ticket", back_populates="receipt")
    receipt_foods = relationship("ReceiptFood", back_populates="receipt", cascade="all, delete-orphan")

class Food(Base):
    __tablename__ = 'food'
    id_food = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    receipt_foods = relationship("ReceiptFood", back_populates="food")

class User(Base):
    __tablename__ = 'user'
    id_user = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    phone_number = Column(String(20))
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    id_role = Column(Integer, ForeignKey('role.id_role', onupdate="CASCADE"), nullable=False)

    # role = relationship("Role", backref="users")


class Role(Base):
    __tablename__ = 'role'
    id_role = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)


class UserReviewMovie(Base):
    __tablename__ = 'user_review_movie'
    id_review = Column(Integer, primary_key=True, autoincrement=True)
    score = Column(Float, nullable=False)
    description = Column(String(500))
    id_movie = Column(Integer, ForeignKey('movie.id_movie', onupdate="CASCADE"), nullable=False)
    id_user = Column(Integer, ForeignKey('user.id_user', onupdate="CASCADE"), nullable=False)

    movie = relationship("Movie", backref="reviews")
    user = relationship("User", backref="reviews")


class Type(Base):
    __tablename__ = 'type'
    id_type = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)

class  MovieType(Base):
    __tablename__ = 'movie_type'
    id_type = Column(Integer, ForeignKey('type.id_type', onupdate="CASCADE"), primary_key=True)
    id_movie = Column(Integer, ForeignKey('movie.id_movie', onupdate="CASCADE"), primary_key=True)
    movie = relationship("Movie", backref="movie_type")
    type = relationship("Type", backref="movie_type")
class ReceiptFood(Base):
    __tablename__ = "receipt_food"
    id_receipt = Column(Integer, ForeignKey('receipt.id_receipt', ondelete="CASCADE"), primary_key=True)
    id_food = Column(Integer, ForeignKey('food.id_food', ondelete="CASCADE"), primary_key=True)
    quantity = Column(Integer, nullable=False, default=1)

    receipt = relationship("Receipt", back_populates="receipt_foods")
    food = relationship("Food", back_populates="receipt_foods")
