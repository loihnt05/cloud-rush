FROM python:3.12-slim

# Copy uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy lock file trước để tận dụng cache
COPY pyproject.toml uv.lock ./

# Install deps
RUN uv sync --frozen --no-cache

# Copy source
COPY . .

# Env
ENV PYTHONPATH=/app

# Run (prod, no reload)
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
