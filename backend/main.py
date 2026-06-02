import os
import io
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from PIL import Image
import pymongo
from pymongo.errors import ConnectionFailure

# Local imports
from auth import verify_password, get_password_hash, create_access_token, get_current_user
from ml.model import predict_textile, load_model_and_metrics

# Initialize FastAPI
app = FastAPI(
    title="Sortex: Textile Waste Classification API",
    description="Enterprise-grade security and classification API for Sortex systems",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup with in-memory fallback
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB", "sortex_db")

db_client = None
db = None
use_in_memory = False

# In-memory storage fallback
IN_MEMORY_DB = {
    "operators": {},  # username -> hashed_password
    "classifications": []  # list of classification records
}

try:
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    db_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    # Check connection
    db_client.server_info()
    db = db_client[MONGO_DB_NAME]
    print("Successfully connected to MongoDB.")
except (ConnectionFailure, Exception) as e:
    use_in_memory = True
    print(f"Could not connect to MongoDB: {e}.")
    print("Falling back to IN-MEMORY database for this session.")

# Pydantic schemas
class OperatorRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str

class ClassificationRecord(BaseModel):
    id: Optional[str] = None
    filename: str
    predicted_class: str
    confidence: float
    confidences: Dict[str, float]
    operator: str
    timestamp: str

# Helper db operations to abstract MongoDB vs In-Memory
def get_operator(username: str) -> Optional[Dict[str, Any]]:
    if use_in_memory:
        hashed_password = IN_MEMORY_DB["operators"].get(username)
        if hashed_password:
            return {"username": username, "password": hashed_password}
        return None
    else:
        return db.operators.find_one({"username": username})

def create_operator(username: str, hashed_pass: str):
    if use_in_memory:
        IN_MEMORY_DB["operators"][username] = hashed_pass
    else:
        db.operators.insert_one({"username": username, "password": hashed_pass})

def save_classification(record: Dict[str, Any]):
    if use_in_memory:
        record["_id"] = str(len(IN_MEMORY_DB["classifications"]) + 1)
        IN_MEMORY_DB["classifications"].append(record)
    else:
        db.classifications.insert_one(record)

def get_recent_classifications(limit: int = 10) -> List[Dict[str, Any]]:
    if use_in_memory:
        # Return recent items reversed
        return IN_MEMORY_DB["classifications"][-limit:][::-1]
    else:
        cursor = db.classifications.find().sort("timestamp", -1).limit(limit)
        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

# Load model and metrics on startup
@app.on_event("startup")
def startup_event():
    print("Initializing AI models...")
    # This triggers model training/loading
    _, metrics = load_model_and_metrics()
    print(f"AI models loaded. Baseline Accuracy: {metrics['accuracy']:.4f}")

# Endpoints
@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(operator: OperatorRegister):
    existing = get_operator(operator.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Operator already registered"
        )
    
    hashed_password = get_password_hash(operator.password)
    create_operator(operator.username, hashed_password)
    return {"message": "Operator registered successfully"}

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    operator = get_operator(form_data.username)
    if not operator or not verify_password(form_data.password, operator["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": operator["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/classify", response_model=Dict[str, Any])
async def classify_image(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    # Verify file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid image."
        )
        
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Run inference
        prediction = predict_textile(image)
        
        # Save record
        record = {
            "filename": file.filename,
            "predicted_class": prediction["class"],
            "confidence": prediction["confidence"],
            "confidences": prediction["confidences"],
            "operator": current_user,
            "timestamp": datetime.utcnow().isoformat()
        }
        save_classification(record)
        
        # Format response
        response_data = {
            "filename": file.filename,
            "predicted_class": prediction["class"],
            "confidence": prediction["confidence"],
            "confidences": prediction["confidences"],
            "operator": current_user,
            "timestamp": record["timestamp"]
        }
        
        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification pipeline failed: {str(e)}"
        )

@app.get("/classifications", response_model=List[Dict[str, Any]])
async def classifications_history(
    limit: int = 15,
    current_user: str = Depends(get_current_user)
):
    return get_recent_classifications(limit)

@app.get("/metrics", response_model=Dict[str, Any])
async def dashboard_metrics(current_user: str = Depends(get_current_user)):
    _, model_metrics = load_model_and_metrics()
    
    # Retrieve all classifications to calculate runtime distributions
    if use_in_memory:
        all_records = IN_MEMORY_DB["classifications"]
    else:
        all_records = list(db.classifications.find())
        for r in all_records:
            r["_id"] = str(r["_id"])
            
    total_classifications = len(all_records)
    
    # Calculate operational class counts
    operational_counts = {cls: 0 for cls in model_metrics["class_distribution"].keys()}
    for r in all_records:
        cls = r.get("predicted_class")
        if cls in operational_counts:
            operational_counts[cls] += 1
            
    # Calculate average confidence
    avg_confidence = 0.0
    if total_classifications > 0:
        avg_confidence = sum(r.get("confidence", 0.0) for r in all_records) / total_classifications

    # Create dashboard-specific data
    return {
        "model_accuracy": model_metrics["accuracy"],
        "model_precision": model_metrics["precision"],
        "model_recall": model_metrics["recall"],
        "model_f1_score": model_metrics["f1_score"],
        "confusion_matrix": model_metrics["confusion_matrix"],
        "total_classified": total_classifications,
        "average_confidence": avg_confidence,
        "operational_distribution": [
            {"name": cls, "value": count} for cls, count in operational_counts.items()
        ],
        "database_type": "In-Memory Fallback" if use_in_memory else "MongoDB Production"
    }

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "database": "In-Memory Fallback" if use_in_memory else "MongoDB connected",
        "timestamp": datetime.utcnow().isoformat()
    }
