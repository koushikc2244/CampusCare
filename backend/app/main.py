from fastapi import FastAPI

app = FastAPI(title="CampusCare API")


@app.get("/")
def home():
    return {
        "message": "Welcome to CampusCare!",
        "status": "API is running"
    }