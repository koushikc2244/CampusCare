from .services.priority_service import calculate_priority
from .services.status_service import can_change_status

from .auth import create_access_token
from fastapi import Depends, FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from .dependencies import get_current_user, require_role
from .database import Base, engine

from .models.user import User
from .models.incident import Incident
from .models.status_history import IncidentStatusHistory
from .models.comment import IncidentComment

from .schemas import CommentCreate, IncidentCreate, UserCreate
from .security import hash_password, verify_password


app = FastAPI(title="CampusCare API")


# Create database tables
Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to CampusCare!",
        "status": "API is running"
    }


# ============================================================
# DATABASE HEALTH
# ============================================================

@app.get("/health/database")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "database": "connected",
            "result": result.scalar()
        }


# ============================================================
# USER REGISTRATION
# ============================================================

@app.post("/users")
def create_user(user: UserCreate):
    with Session(engine) as session:

        existing_user = session.query(User).filter(
            User.email == user.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        new_user = User(
            name=user.name,
            email=user.email,
            password_hash=hash_password(user.password)
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        return {
            "message": "User created successfully",
            "user_id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }


# ============================================================
# LOGIN
# ============================================================

@app.post("/login")
def login(
    email: str = Form(...),
    password: str = Form(...)
):
    with Session(engine) as session:

        user = session.query(User).filter(
            User.email == email
        ).first()

        if not user or not verify_password(
            password,
            user.password_hash
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        access_token = create_access_token(
            user_id=user.id,
            role=user.role
        )

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }


# ============================================================
# CURRENT USER
# ============================================================

@app.get("/me")
def get_my_profile(
    current_user: dict = Depends(get_current_user)
):
    return {
        "message": "You are authenticated!",
        "user": current_user
    }


# ============================================================
# ADMIN TEST
# ============================================================

@app.get("/admin-test")
def admin_test(
    current_user: dict = Depends(require_role("admin"))
):
    return {
        "message": "Welcome, Admin!",
        "user": current_user
    }


# ============================================================
# CREATE INCIDENT
# ============================================================

@app.post("/incidents")
def create_incident(
    incident: IncidentCreate,
    current_user: dict = Depends(get_current_user)
):
    with Session(engine) as session:

        calculated_priority = calculate_priority(
            incident.category,
            incident.description
        )

        new_incident = Incident(
            title=incident.title,
            description=incident.description,
            category=incident.category,
            priority=calculated_priority,
            location=incident.location,
            latitude=incident.latitude,
            longitude=incident.longitude,
            reported_by=current_user["user_id"]
        )

        session.add(new_incident)
        session.commit()
        session.refresh(new_incident)

        return {
            "message": "Incident reported successfully",
            "incident_id": new_incident.id,
            "status": new_incident.status,
            "priority": new_incident.priority,
            "reported_by": new_incident.reported_by
        }


# ============================================================
# STUDENT - MY INCIDENTS
# ============================================================

@app.get("/incidents/my")
def get_my_incidents(
    current_user: dict = Depends(get_current_user)
):
    with Session(engine) as session:

        incidents = session.query(Incident).filter(
            Incident.reported_by == current_user["user_id"]
        ).all()

        return {
            "count": len(incidents),
            "incidents": [
                {
                    "id": incident.id,
                    "title": incident.title,
                    "description": incident.description,
                    "category": incident.category,
                    "priority": incident.priority,
                    "status": incident.status,
                    "location": incident.location,
                    "latitude": incident.latitude,
                    "longitude": incident.longitude,

                    "reported_by": {
                        "id": incident.reporter.id,
                        "name": incident.reporter.name,
                        "email": incident.reporter.email
                    },

                    "assigned_to": (
                        {
                            "id": incident.assigned_staff.id,
                            "name": incident.assigned_staff.name,
                            "email": incident.assigned_staff.email
                        }
                        if incident.assigned_staff
                        else None
                    ),

                    "created_at": incident.created_at
                }
                for incident in incidents
            ]
        }


# ============================================================
# ADMIN - ALL INCIDENTS
# ============================================================

@app.get("/admin/incidents")
def get_all_incidents(
    current_user: dict = Depends(require_role("admin"))
):
    with Session(engine) as session:

        incidents = session.query(Incident).all()

        return {
            "count": len(incidents),
            "incidents": [
                {
                    "id": incident.id,
                    "title": incident.title,
                    "description": incident.description,
                    "category": incident.category,
                    "priority": incident.priority,
                    "status": incident.status,
                    "location": incident.location,
                    "latitude": incident.latitude,
                    "longitude": incident.longitude,

                    "reported_by": {
                        "id": incident.reporter.id,
                        "name": incident.reporter.name,
                        "email": incident.reporter.email
                    },

                    "assigned_to": (
                        {
                            "id": incident.assigned_staff.id,
                            "name": incident.assigned_staff.name,
                            "email": incident.assigned_staff.email
                        }
                        if incident.assigned_staff
                        else None
                    ),

                    "created_at": incident.created_at,
                    "updated_at": incident.updated_at
                }
                for incident in incidents
            ]
        }

@app.get("/admin/staff")
def get_staff_members(
    current_user: dict = Depends(require_role("admin"))
):
    with Session(engine) as session:

        staff_members = (
            session.query(User)
            .filter(User.role == "staff")
            .order_by(User.name)
            .all()
        )

        return [
            {
                "id": staff.id,
                "name": staff.name,
                "email": staff.email,
                "role": staff.role
            }
            for staff in staff_members
        ]

# ============================================================
# ADMIN - UPDATE INCIDENT STATUS
# ============================================================

@app.patch("/admin/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    status: str,
    current_user: dict = Depends(require_role("admin"))
):
    with Session(engine) as session:

        incident = session.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if not incident:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        # Check whether this status transition is allowed
        if not can_change_status(
            incident.status,
            status
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Cannot change status from "
                    f"{incident.status} to {status}"
                )
            )

        incident.status = status

        # Record status history
        history = IncidentStatusHistory(
            incident_id=incident.id,
            changed_by=current_user["user_id"],
            status=status
        )

        session.add(history)
        session.commit()
        session.refresh(incident)

        return {
            "message": "Incident status updated successfully",
            "incident_id": incident.id,
            "status": incident.status
        }


# ============================================================
# ADMIN - ASSIGN INCIDENT TO STAFF
# ============================================================

@app.patch("/admin/incidents/{incident_id}/assign")
def assign_incident(
    incident_id: int,
    staff_id: int,
    current_user: dict = Depends(require_role("admin"))
):
    with Session(engine) as session:

        # Find incident
        incident = session.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if not incident:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        # Find staff user
        staff = session.query(User).filter(
            User.id == staff_id
        ).first()

        if not staff:
            raise HTTPException(
                status_code=404,
                detail="Staff user not found"
            )

        # Make sure selected user is staff
        if staff.role != "staff":
            raise HTTPException(
                status_code=400,
                detail="User is not a staff member"
            )

        # Do not allow assignment of incidents that are already finished.
        if incident.status in ["resolved", "closed", "rejected"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot assign an incident with status {incident.status}"
            )

        # Assign incident.
        incident.assigned_to = staff.id

        # Only create an "assigned" history entry when the incident
        # actually enters the assigned state. This prevents duplicate
        # Assigned entries when the same assignment is submitted again.
        if incident.status != "assigned":
            incident.status = "assigned"

            history = IncidentStatusHistory(
                incident_id=incident.id,
                changed_by=current_user["user_id"],
                status="assigned"
            )

            session.add(history)

        session.commit()
        session.refresh(incident)

        return {
            "message": "Incident assigned successfully",
            "incident_id": incident.id,
            "assigned_to": incident.assigned_to,
            "status": incident.status
        }


# ============================================================
# STAFF - MY ASSIGNED INCIDENTS
# ============================================================

@app.get("/staff/incidents")
def get_staff_incidents(
    current_user: dict = Depends(require_role("staff"))
):
    with Session(engine) as session:

        incidents = session.query(Incident).filter(
            Incident.assigned_to == current_user["user_id"]
        ).all()

        return {
            "count": len(incidents),
            "incidents": [
                {
                    "id": incident.id,
                    "title": incident.title,
                    "description": incident.description,
                    "category": incident.category,
                    "priority": incident.priority,
                    "status": incident.status,
                    "location": incident.location,
                    "latitude": incident.latitude,
                    "longitude": incident.longitude,

                    "reported_by": {
                        "id": incident.reporter.id,
                        "name": incident.reporter.name,
                        "email": incident.reporter.email
                    },

                    "assigned_to": (
                        {
                            "id": incident.assigned_staff.id,
                            "name": incident.assigned_staff.name,
                            "email": incident.assigned_staff.email
                        }
                        if incident.assigned_staff
                        else None
                    ),

                    "created_at": incident.created_at,
                    "updated_at": incident.updated_at
                }
                for incident in incidents
            ]
        }


# ============================================================
# STAFF - UPDATE INCIDENT STATUS
# ============================================================

@app.patch("/staff/incidents/{incident_id}/status")
def staff_update_incident_status(
    incident_id: int,
    status: str,
    current_user: dict = Depends(require_role("staff"))
):
    with Session(engine) as session:

        incident = session.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if not incident:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        # Make sure this incident belongs to the logged-in staff member
        if incident.assigned_to != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="You are not assigned to this incident"
            )

        # Check whether status transition is allowed
        if not can_change_status(
            incident.status,
            status
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Cannot change status from "
                    f"{incident.status} to {status}"
                )
            )

        incident.status = status

        # Record status history
        history = IncidentStatusHistory(
            incident_id=incident.id,
            changed_by=current_user["user_id"],
            status=status
        )

        session.add(history)
        session.commit()
        session.refresh(incident)

        return {
            "message": "Incident status updated successfully",
            "incident_id": incident.id,
            "status": incident.status
        }


# ============================================================
# ADD COMMENT
# ============================================================

@app.post("/incidents/{incident_id}/comments")
def add_incident_comment(
    incident_id: int,
    comment_data: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    with Session(engine) as session:

        incident = session.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if not incident:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        # Check whether the user is allowed to comment
        is_admin = current_user["role"] == "admin"

        is_reporter = (
            incident.reported_by == current_user["user_id"]
        )

        is_assigned_staff = (
            incident.assigned_to == current_user["user_id"]
        )

        if not (
            is_admin
            or is_reporter
            or is_assigned_staff
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You do not have permission "
                    "to comment on this incident"
                )
            )

        new_comment = IncidentComment(
            incident_id=incident.id,
            user_id=current_user["user_id"],
            comment=comment_data.comment
        )

        session.add(new_comment)
        session.commit()
        session.refresh(new_comment)

        return {
            "message": "Comment added successfully",
            "comment_id": new_comment.id,
            "incident_id": new_comment.incident_id,
            "user_id": new_comment.user_id,
            "comment": new_comment.comment,
            "created_at": new_comment.created_at
        }


# ============================================================
# GET INCIDENT COMMENTS
# ============================================================

@app.get("/incidents/{incident_id}/comments")
def get_incident_comments(
    incident_id: int,
    current_user: dict = Depends(get_current_user)
):
    with Session(engine) as session:

        incident = session.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if not incident:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        comments = session.query(IncidentComment).filter(
            IncidentComment.incident_id == incident_id
        ).order_by(
            IncidentComment.created_at.asc()
        ).all()

        return {
            "incident_id": incident_id,
            "count": len(comments),
            "comments": [
                {
                    "id": comment.id,
                    "user_id": comment.user_id,
                    "comment": comment.comment,
                    "created_at": comment.created_at
                }
                for comment in comments
            ]
        }


# ============================================================
# ADMIN - DASHBOARD STATISTICS
# ============================================================

@app.get("/admin/stats")
def get_admin_stats(
    current_user: dict = Depends(require_role("admin"))
):
    with Session(engine) as session:

        total = session.query(Incident).count()

        reported = session.query(Incident).filter(
            Incident.status == "reported"
        ).count()

        under_review = session.query(Incident).filter(
            Incident.status == "under_review"
        ).count()

        assigned = session.query(Incident).filter(
            Incident.status == "assigned"
        ).count()

        in_progress = session.query(Incident).filter(
            Incident.status == "in_progress"
        ).count()

        resolved = session.query(Incident).filter(
            Incident.status == "resolved"
        ).count()

        closed = session.query(Incident).filter(
            Incident.status == "closed"
        ).count()

        critical = session.query(Incident).filter(
            Incident.priority == "critical"
        ).count()

        high = session.query(Incident).filter(
            Incident.priority == "high"
        ).count()

        return {
            "total_incidents": total,

            "by_status": {
                "reported": reported,
                "under_review": under_review,
                "assigned": assigned,
                "in_progress": in_progress,
                "resolved": resolved,
                "closed": closed
            },

            "by_priority": {
                "critical": critical,
                "high": high
            }
        }


# ============================================================
# INCIDENT STATUS HISTORY
# ============================================================

@app.get("/incidents/{incident_id}/history")
def get_incident_history(
    incident_id: int,
    current_user: dict = Depends(get_current_user)
):
    with Session(engine) as session:

        incident = session.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if not incident:
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

        history = session.query(
            IncidentStatusHistory
        ).filter(
            IncidentStatusHistory.incident_id == incident_id
        ).order_by(
            IncidentStatusHistory.changed_at.asc()
        ).all()

        return {
            "incident_id": incident_id,
            "count": len(history),

            "history": [
                {
                    "id": item.id,
                    "changed_by": item.changed_by,
                    "status": item.status,
                    "changed_at": item.changed_at
                }
                for item in history
            ]
        }
@app.get("/admin/staff")
def get_staff_members(
    current_user: dict = Depends(require_role("admin"))
):
    with Session(engine) as session:
        staff_members = (
            session.query(User)
            .filter(User.role == "staff")
            .order_by(User.name)
            .all()
        )

        return [
            {
                "id": staff.id,
                "name": staff.name,
                "email": staff.email,
                "role": staff.role
            }
            for staff in staff_members
        ]