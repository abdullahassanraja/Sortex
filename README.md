---
title: Sortex
emoji: ♻️
colorFrom: gray
colorTo: black
sdk: docker
app_port: 7860
---

# Sortex: Textile Waste Classification Gateway

Sortex is an enterprise-grade, high-throughput textile waste classification platform. It uses a computer vision pipeline (Random Forest classifier on color and weave texture patterns) to analyze and redirect fabric blends away from landfills.

## Hugging Face Spaces Deployment

This repository is optimized for one-click deployment to **Hugging Face Spaces** using Docker:
1. Create a new Space on Hugging Face.
2. Select **Docker** as the SDK.
3. Push this repository to the Space.
4. Set the environment variable `MONGO_URI` (pointing to your MongoDB Atlas cluster) in your Space's Settings to enable persistent database storage, or let it connect to the fallback in-memory database.

## Running Locally

### Method A: Docker Compose
```bash
docker compose up --build
```

### Method B: Manual Run
1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
