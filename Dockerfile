FROM python:3.10-slim-bookworm

WORKDIR /app

# Install uv and other dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir uv && uv sync

# Copy the rest of the application code
COPY . .

# Set the command to run the application with uv
CMD ["uv", "run", "dev"]
