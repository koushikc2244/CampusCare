from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from .user import User

class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    category: Mapped[str] = mapped_column(
        Enum(
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
            name="incident_category"
        ),
        nullable=False
    )

    priority: Mapped[str] = mapped_column(
        Enum(
            "low",
            "medium",
            "high",
            "critical",
            name="incident_priority"
        ),
        default="medium",
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        Enum(
            "reported",
            "under_review",
            "assigned",
            "in_progress",
            "resolved",
            "closed",
            "rejected",
            name="incident_status"
        ),
        default="reported",
        nullable=False
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    reported_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )

    reporter: Mapped["User"] = relationship(
        "User",
        foreign_keys=[reported_by],
        backref="reported_incidents"
    )
    
    assigned_staff: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[assigned_to],
        backref="assigned_incidents"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )