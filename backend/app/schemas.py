from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class IncidentCreate(BaseModel):
    title: str
    description: str
    category: str
    location: str
    latitude: float | None = Field(
        default=None,
        ge=-90,
        le=90
    )

    longitude: float | None = Field(
        default=None,
        ge=-180,
        le=180
    )
    
class CommentCreate(BaseModel):
    comment: str