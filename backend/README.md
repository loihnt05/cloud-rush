# CloudRush Backend

FastAPI service powering the CloudRush platform. It ships with Auth0-backed OAuth2 client credentials, PostgreSQL persistence, and interactive documentation via Swagger UI.

## Highlights

- 🚀 **FastAPI + Uvicorn** with automatic table creation on startup.
- 🔐 **Auth0 integration** using the Client Credentials grant directly in Swagger UI.
- 🗄️ **PostgreSQL** datastore with connection retry logic for smoother local startup.
- 🔄 **Hot reload** support both in Docker (bind mount) and when running locally with `uv`.

## Tech Stack

- Python 3.12
- FastAPI 0.116 (with `fastapi[standard]` CLI)
- SQLAlchemy 2 & Alembic
- PostgreSQL 13 (via Docker Compose)
- Auth0 (or compatible OAuth2 provider)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [pnpm](https://pnpm.io/installation) if you want to run the frontend side by side
- An Auth0 (or compatible) application configured for the **Client Credentials** grant
- (Optional) [uv](https://docs.astral.sh/uv/) for local development without Docker

## Environment Variables

Create a `.env` file in `\backend`. Docker Compose reads it automatically.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy connection string for PostgreSQL (e.g. `postgresql+psycopg://admin:admin@localhost:5432/crdb`) |
| `AUTH0_DOMAIN` | Your Auth0 domain (e.g. `dev-123456.us.auth0.com`) |
| `API_AUDIENCE` | Auth0 API audience that issued access tokens should target |
| `AUTH0_CLIENT_ID` | Machine-to-machine client ID used in Swagger UI |
| `AUTH0_CLIENT_SECRET` | Client secret for the same application |
| `AUTH0_TOKEN_URL` *(optional)* | Explicit token URL. Defaults to `https://AUTH0_DOMAIN/oauth/token` |
| `AUTH0_SCOPES` *(optional)* | Space-separated scopes to request in the docs |

```dotenv
# backend/.env
DATABASE_URL=postgresql+psycopg://admin:admin@localhost:5432/crdb
AUTH0_DOMAIN=dev-123456.us.auth0.com
API_AUDIENCE=https://cloudrush-api
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SCOPES=read:pets write:pets
```

> **Security Note:** `AUTH0_CLIENT_SECRET` is injected into Swagger UI when present. Do not commit your `.env` file.

## Getting Started

### Option A — Docker Compose (recommended)

```bash
cd backend
docker compose up --build
```

What you get:

- `fastapi-app` running on [http://localhost:8000](http://localhost:8000)
- `database` container exposing PostgreSQL on port `5432`
- Code hot reload thanks to the project being bind-mounted into the container

Stop everything with:

```bash
docker compose down
```

### Option B — Local Python runtime (uv)

> Requires `uv` to be installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`).

```bash
cd backend
uv sync
# Ensure PostgreSQL is running and reachable via DATABASE_URL
uv run fastapi dev app/main.py
```

This launches the dev server on <http://localhost:8000> with live reload. You can alternatively run `uv run uvicorn app.main:app --reload`.

## API Docs & OAuth2 Client Credentials

Visit [http://localhost:8000/docs](http://localhost:8000/docs) and click **Authorize**. You'll see fields for `client_id`, `client_secret`, and optional scopes.

1. Enter the machine-to-machine credentials from your Auth0 application.
2. (Optional) Provide scopes separated by spaces.
3. Click **Authorize** — Swagger stores the access token for the session and sends it on protected routes.

Endpoints that require authentication (e.g. `GET /auth`) automatically enforce this security scheme, while public routes remain accessible without credentials.

## Project Structure

```
backend/
├── app/
│   ├── core/          # Config, database engine, auth helpers
│   ├── routers/       # FastAPI routers (e.g. pets)
│   ├── schemas/       # Pydantic schemas
│   └── main.py        # Application entrypoint
├── docker-compose.yaml
├── Dockerfile
├── pyproject.toml
└── uv.lock
```

## Useful Commands

```bash
# Tear down containers and remove volumes
docker compose down -v

# Run only the database service (useful for local dev without full stack)
docker compose up database

# Format & check the project (if you add tools like ruff/black later)
uv run ruff check app
```

## Troubleshooting

- **Database connection retries forever** — confirm PostgreSQL credentials in `DATABASE_URL` match your running instance. The default Docker Compose values are `admin:admin@localhost:5432/crdb`.
- **Swagger Authorize button missing fields** — make sure `AUTH0_DOMAIN` and `API_AUDIENCE` are set before starting the server.
- **`uv` not found** — install it from <https://docs.astral.sh/uv/> or fall back to Docker Compose.

## License

MIT
