# CampusCare

CampusCare is a real-time campus safety and incident management system designed to help students report campus issues and allow staff and administrators to manage them efficiently.

The system provides role-based access for students, staff, and administrators, along with incident tracking, automatic priority calculation, status history, comments, staff assignment, and location-based visualization.

---

## Features

### Student

- Register and log in securely
- Report campus incidents
- Select incident category and location
- Share incident location using latitude and longitude
- Automatically receive an incident priority
- View personal reported incidents
- View campus-wide active incidents
- Track incident progress
- View status history
- View permitted incident comments
- View incidents on a map

### Staff

- Log in using role-based authentication
- View incidents assigned to them
- View assigned incidents on a map
- Update incident status
- Add progress comments
- View incident history
- Access only incidents assigned to them

### Administrator

- View all incidents
- Search and filter incidents
- Assign incidents to staff
- Change incident status
- View incident status history
- View incident comments
- View staff members
- View campus incidents on a map
- View incident statistics
- Manage the complete incident lifecycle

---

## Incident Lifecycle

REPORTED → UNDER REVIEW → ASSIGNED → IN PROGRESS → RESOLVED → CLOSED

Rejected incidents are also supported.

---

## Automatic Priority

CampusCare calculates incident priority based on the incident category and description.

Supported priorities:

- Low
- Medium
- High
- Critical

Examples of high-priority situations include electrical hazards, exposed wires, major leaks, flooding, and security-related incidents.

---

## User Roles

| Role | Main Responsibilities |
|------|------------------------|
| Student | Report and track incidents |
| Staff | Handle assigned incidents |
| Admin | Manage incidents and staff |

Role-based access control is implemented using JWT authentication.

---

## Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- JWT Authentication
- Passlib / bcrypt

### Frontend

- React
- Vite
- Tailwind CSS
- Leaflet
- OpenStreetMap

### Development & Infrastructure

- Git
- GitHub
- Docker
- Docker Compose

---

## Project Structure

```text
CampusCare/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── services/
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── security.py
│   ├── alembic/
│   │   └── versions/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md


## Prerequisites

Make sure the following are installed:

- Python 3.12+
- Node.js
- npm
- Docker Desktop
- Git

---

## Backend Setup

Clone the repository:

git clone https://github.com/koushikc2244/CampusCare.git
cd CampusCare

Create a Python virtual environment:

python3 -m venv .venv

Activate it:

source .venv/bin/activate

Install backend dependencies:

pip install -r backend/requirements.txt

---

## Environment Variables

Create a .env file in the project root:

DATABASE_URL=postgresql+psycopg://campuscare:campuscare_dev@localhost:5433/campuscare
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

Do not commit .env to Git.

---

## PostgreSQL Setup

CampusCare uses PostgreSQL through Docker.

Start the database:

docker compose up -d

Check the database:

docker exec campuscare-postgres pg_isready -U campuscare -d campuscare

Expected result:

accepting connections

---

## Database Migrations

CampusCare uses Alembic for database schema management.

Check the current migration:

alembic current

Run pending migrations:

alembic upgrade head

Create a new migration after changing database models:

alembic revision --autogenerate -m "describe your change"

Then apply it:

alembic upgrade head

---

## Running the Backend

From the project root:

source .venv/bin/activate
uvicorn backend.app.main:app --reload

The API will be available at:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs

---

## Running the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Vite will provide the local frontend URL in the terminal.

---

## API Overview

### Authentication

POST /users
POST /login
GET /me

### Student

POST /incidents
GET /incidents/my
GET /incidents/public
POST /incidents/{incident_id}/comments
GET /incidents/{incident_id}/comments
GET /incidents/{incident_id}/history

### Staff

GET /staff/incidents
PATCH /staff/incidents/{incident_id}/status

### Admin

GET /admin/incidents
GET /admin/staff
GET /admin/stats
PATCH /admin/incidents/{incident_id}/status
PATCH /admin/incidents/{incident_id}/assign

---

## Security

CampusCare uses:

- JWT-based authentication
- Password hashing
- Role-based authorization
- Protected API endpoints
- Environment-based configuration
- Permission checks for incident comments
- Staff assignment validation
- Status transition validation

Sensitive configuration such as database credentials and secret keys is stored in .env and excluded from Git.

---

## Maps

CampusCare uses:

- Leaflet for interactive maps
- OpenStreetMap for map tiles
- Browser geolocation for incident reporting

Incidents containing geographic coordinates can be displayed on campus maps.

---

## Database

The main database entities include:

- Users
- Incidents
- Incident Status History
- Incident Comments

Relationships allow CampusCare to track:

- Who reported an incident
- Which staff member is assigned
- Who changed its status
- Status history
- Incident comments

---

## Future Improvements

Potential future improvements include:

- Email notifications
- Push notifications
- Image attachments for incidents
- Real-time updates using WebSockets
- Advanced analytics
- Incident heatmaps
- Mobile application
- Improved notification system
- Production deployment

---

## Project Purpose

CampusCare was developed as a full-stack software project to demonstrate practical implementation of:

- REST APIs
- Authentication and authorization
- Database design
- Role-based access control
- Frontend development
- Backend development
- Database migrations
- Docker
- Maps and geolocation
- Git/GitHub workflows