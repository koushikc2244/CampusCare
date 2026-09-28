from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class IncidentCreate(BaseModel):
    title: str
    description: str
    category: Literal[
        "safety",
        "electrical",
        "water",
        "infrastructure",
        "cleanliness",
        "security",
        "network",
        "hostel",
        "classroom",
        "other",
    ]
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
    comment: str = Field(
        min_length=1,
        max_length=1000
    )


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class StatusUpdateRequest(BaseModel):
    status: Literal[
        "reported",
        "under_review",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
        "rejected",
    ]


class AssignIncidentRequest(BaseModel):
    staff_id: int = Field(
        gt=0
    )