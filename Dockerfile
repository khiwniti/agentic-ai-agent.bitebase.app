FROM python:3.13-slim-bookworm

WORKDIR /app

COPY requirements.txt .
RUN uv pip install -r requirements.txt

COPY . .

CMD ["python", "schedule_orchestration.py"]
