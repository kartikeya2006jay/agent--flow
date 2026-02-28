from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from jose import jwt
from app.core.config import settings

router = APIRouter()

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Demo mode: accept any credentials
    user_data = {
        "sub": f"usr_{form_data.username}",
        "email": f"{form_data.username}@demo.com",
        "enterprise_id": "demo-enterprise",
        "role": "admin" if form_data.username == "admin" else "member",
        "permissions": ["actions:execute", "workflows:view", "approvals:review"]
    }
    token = jwt.encode(user_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"id": user_data["sub"], "email": user_data["email"], "role": user_data["role"]}}

@router.get("/me")
async def read_me(current_user: dict = Depends(lambda: {"user_id": "demo", "email": "demo@demo.com"})):
    return current_user
