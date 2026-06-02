# Campus Eat

> Full-stack online meal ordering platform for students and lounge kitchens.

## Overview
- Backend: Django + Django REST Framework
- Frontend: React (Vite)
- Database: PostgreSQL
- Cache: Redis
- Reverse proxy: Nginx

This repository contains the backend (`backend/`) and frontend (`frontend/`) applications and a `docker-compose.yml` to run the full stack locally.

See docs for full API and deployment notes: [docs/API.md](docs/API.md#L1-L1), [docs/Architecture.md](docs/Architecture.md#L1-L1), [docs/DEPLOY.md](docs/DEPLOY.md#L1-L1).

## Quick start (Docker)
1. Build and start services:

```bash
docker compose up --build
```

2. Services (defaults):
- Backend: `http://localhost:8000/` (API root `http://localhost:8000/api/`)
- Frontend: `http://localhost:3000/` (served via frontend/nginx configuration)
- Nginx reverse proxy: `http://localhost/` (port 80)
- Postgres: `localhost:5432` (pgadmin at port 5050)

3. Example: visit `http://localhost:3000` to use the web UI.

## Running locally without Docker
Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Environment
Create `.env` in `backend/` with required variables (see `.env.example`).

## Contributing
See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md#L1-L1).

## Contact
Project owner: see repo metadata or `DEFAULT_FROM_EMAIL` in `backend/campus_eat/settings.py`.
# Campus Eat

A component-based web food ordering system for university campuses. Students order food ahead of time from campus lounges, receive a pickup key, and collect their order without waiting in line.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, JavaScript, Tailwind CSS |
| Backend | Django, Django REST Framework, Python |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | JWT (Simple JWT) |
| Containers | Docker, Docker Compose |

## Architecture

Five loosely coupled components communicate via REST APIs:

1. **Student Frontend** — Browse menu, cart, orders, profile
2. **Lounge Dashboard** — Manage incoming orders and food availability
3. **Admin Dashboard** — Users, lounges, reports, analytics
4. **Backend API** — Authentication, business logic, design patterns
5. **Database** — PostgreSQL with Users, Students, Lounges, Foods, Orders, Payments, Notifications

## Design Patterns

| Pattern | Implementation |
|---------|---------------|
| Singleton | `DatabaseConfig`, `LoggerService` |
| Factory | `UserFactory`, `NotificationFactory` |
| Observer | `OrderStatusSubject` — order status notifications |
| Strategy | `PaymentContext`, `SearchContext` |
| Adapter | `StripeAdapter`, `PayPalAdapter` |
| Repository | `OrderRepository`, `FoodRepository` |

## Quick Start (Docker)

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/ |
| Admin Panel | http://localhost:8000/admin/ |
| Nginx Proxy | http://localhost |

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Student | student1 | campus123 |
| Lounge Staff | lounge1 | campus123 |
| Admin | admin | admin123 |

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
# Set DB_HOST=localhost in .env
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | Register user |
| POST | `/api/login/` | JWT login |
| POST | `/api/logout/` | Logout (blacklist token) |
| GET | `/api/foods/` | List foods (search/filter) |
| GET | `/api/categories/` | List categories |
| GET/POST | `/api/orders/` | List/create orders |
| PATCH | `/api/orders/status/<id>/` | Update order status |
| GET | `/api/lounge/orders/` | Lounge order queue |
| PATCH | `/api/lounge/orders/<id>/status/` | Lounge update status |
| GET | `/api/admin/reports/` | Admin analytics |
| GET | `/api/notifications/` | User notifications |

## Color Theme

| Purpose | Hex |
|---------|-----|
| Primary (Orange) | `#F97316` |
| Secondary (Dark Slate) | `#1E293B` |
| Background | `#F8FAFC` |
| Success | `#22C55E` |
| Error | `#EF4444` |
| Text | `#0F172A` |

## UML Diagrams

See [docs/uml/diagrams.md](docs/uml/diagrams.md) for Use Case, Component, Class, Sequence, and Deployment diagrams.

## Order Workflow

1. Student logs in and browses the menu
2. Items are added to cart and order is placed
3. Backend generates a unique order key (e.g. `CE-A3F9B2`)
4. Observer pattern notifies lounge staff
5. Lounge accepts → prepares → marks ready
6. Student receives status notifications
7. Student picks up food using the order key

## Project Structure

```
campus-eat/
├── backend/
│   ├── campus_eat/          # Django settings & URLs
│   ├── apps/                # users, foods, orders, lounges, notifications
│   ├── patterns/            # Design patterns
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/student/   # Home, Menu, Cart, Orders, Profile
│   │   ├── pages/lounge/    # Orders, Food Management
│   │   ├── pages/admin/     # Dashboard, Users, Lounges, Reports
│   │   ├── components/      # Layout, StatusBadge
│   │   ├── context/         # Auth, Cart
│   │   └── services/        # API client
│   └── Dockerfile
├── nginx/
├── docs/uml/
└── docker-compose.yml
```
