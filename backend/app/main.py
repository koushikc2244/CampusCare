from fastapi import FastAPI
from sqlalchemy import text

from .database import engine


app = FastAPI(title="CampusCare API")


@app.get("/")
def home():
    return {
        "message": "Welcome to CampusCare!",
        "status": "API is running"
    }


@app.get("/health/database")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "database": "connected",
            "result": result.scalar()
        }