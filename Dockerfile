FROM python:3.10-slim-bookworm

WORKDIR /app

# Install uv and other dependencies
COPY requirements.txt .
RUN pip install  -r requirements.txt && pip install -e .

# Copy the rest of the application code
COPY . .

# Set the command to run the application with uv
CMD ["python", "-c", "from src.services import watch_services; watch_services()"]
