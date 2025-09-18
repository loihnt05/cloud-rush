
FROM python:3.12-slim

# Copy uv from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy only pyproject.toml and lock file first for caching
COPY pyproject.toml ./
COPY uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-cache

# Set PYTHONPATH
ENV PYTHONPATH=/app

# Copy the rest of the code
COPY . .

# Use uv to run FastAPI with hot reload
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--reload", "--reload-dir", "/app"]
