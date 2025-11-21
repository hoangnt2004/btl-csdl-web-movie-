from fastapi import FastAPI
from app import model
from app.core.database import engine
from app.apis import api_router
from fastapi.middleware.cors import CORSMiddleware
model.Base.metadata.create_all(bind=engine)

app =FastAPI()
# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc ["http://localhost:63342"] để chặt chẽ hơn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)
