from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel
from app.api.v1.deps import get_current_user

router = APIRouter()

class ApprovalStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class DecisionPayload(BaseModel):
    decision: ApprovalStatus
    comments: Optional[str] = None

@router.get("/pending")
async def list_pending(current_user: dict = Depends(get_current_user)):
    return {"approvals": [], "total": 0}

@router.get("/{request_id}")
async def get_approval(request_id: str, current_user: dict = Depends(get_current_user)):
    return {"id": request_id, "status": "pending", "action": "approve_refund", "risk_level": "high"}

@router.post("/{request_id}/decide")
async def decide_approval(request_id: str, payload: DecisionPayload, current_user: dict = Depends(get_current_user)):
    return {"status": "decision_recorded", "request_id": request_id, "decision": payload.decision.value}
