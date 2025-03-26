import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from AccountBackend import app, db, User
from flask import json

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test_users.db"
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_creation_valid(client):
    data = {
        "username": "kristenmoy",
        "email": "kristenmoy@ufl.edu",
        "password": "Ch0mpC@lend@r"
    }
    response = client.post("/register", data=json.dumps(data), content_type="application/json")
    assert response.status_code == 200
    assert response.json["success"] is True
    assert response.json["message"] == "Account created successfully! Please check your email."
    
    with app.app_context():
        user = User.query.filter_by(username="kristenmoy").first()
        assert user is not None

def test_creation_invalid(client):
    data = {
        "username": "kristenmoy",
        "email": "kristenmoy@ufl.edu",
        "password": "invalid"
    }
    response = client.post("/register", data=json.dumps(data), content_type="application/json")
    assert response.json["success"] is False
    assert "Password must be at least 8 characters long" in response.json["message"]
    
    with app.app_context():
        user = User.query.filter_by(username="kristenmoy").first()
        assert user is None
