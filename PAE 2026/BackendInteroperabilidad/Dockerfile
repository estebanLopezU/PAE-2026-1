FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create scripts directory if not exists
RUN mkdir -p scripts

# Expose default port (Render inyecta $PORT; en local/docker usa 8000)
EXPOSE 8000

ENV PYTHONUTF8=1

# Run application (usa $PORT si el proveedor la define, p. ej. Render)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]