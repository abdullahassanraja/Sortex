# Stage 1: Build the Next.js frontend static HTML export
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve the frontend static files directly via the Python FastAPI backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies needed for compiling and ONNX Runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# Copy compiled Next.js static files from Stage 1 into the backend's static folder
COPY --from=frontend-builder /app/frontend/out/ ./static_frontend/

EXPOSE 7860

# Run uvicorn on Hugging Face default port (7860)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
