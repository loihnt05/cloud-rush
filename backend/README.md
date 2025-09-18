# Flight Tickets Sale System Backend

This is a FastAPI backend for a flight ticket sales system. It provides RESTful APIs for managing flights, bookings, users, and payments.

## Features

- User registration and authentication (JWT)
- Flight search and management (CRUD)
- Ticket booking and cancellation
- Payment processing integration
- Admin endpoints for managing flights and bookings

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL (via SQLAlchemy)
- **Authentication:** JWT
- **ORM:** SQLAlchemy
- **Migrations:** Alembic

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL

### Installation

```bash
git clone https://github.com/yourusername/flight-tickets-backend.git
cd flight-tickets-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Configuration

Copy `.env.example` to `.env` and update database credentials and secret keys.

### Database Migration

```bash
alembic upgrade head
```

### Running the Server

```bash
uvicorn app.main:app --reload
```

## API Documentation

Interactive docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

```
app/
├── main.py
├── models/
├── schemas/
├── routers/
├── services/
└── utils/
```

## License

MIT
