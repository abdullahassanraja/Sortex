import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    print("Health check: PASS")

def test_auth_and_endpoints():
    # 1. Register a test operator
    username = "test_operator_99"
    password = "supersecretpassword"
    
    # Clean up if already exists (in memory fallback will be clean anyway)
    # Register
    reg_response = client.post("/register", json={
        "username": username,
        "password": password
    })
    assert reg_response.status_code in [201, 400]
    print("Register operator: PASS")

    # 2. Login to get token
    token_response = client.post("/token", data={
        "username": username,
        "password": password
    })
    assert token_response.status_code == 200
    token_data = token_response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    print("Login & Token retrieval: PASS")

    # 3. Get metrics with token
    headers = {"Authorization": f"Bearer {token}"}
    metrics_response = client.get("/metrics", headers=headers)
    assert metrics_response.status_code == 200
    metrics_data = metrics_response.json()
    assert "model_accuracy" in metrics_data
    assert "total_classified" in metrics_data
    print("Fetch metrics with JWT: PASS")

    # 4. Get classifications history with token
    history_response = client.get("/classifications", headers=headers)
    assert history_response.status_code == 200
    history_data = history_response.json()
    assert isinstance(history_data, list)
    print("Fetch classification logs with JWT: PASS")

if __name__ == "__main__":
    print("Starting backend integration tests...")
    try:
        test_health()
        test_auth_and_endpoints()
        print("All API integration tests PASSED successfully!")
    except Exception as e:
        print(f"Test failure encountered: {e}")
        sys.exit(1)
