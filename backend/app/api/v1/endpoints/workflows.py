from fastapi import APIRouter, Depends, WebSocket
from typing import List, Optional
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.get("/")
async def list_workflows(limit: int = 20, status_filter: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    return {"workflows": [], "total": 0, "limit": limit}

@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str, current_user: dict = Depends(get_current_user)):
    return {"id": workflow_id, "status": "completed", "progress": 100, "result": {"message": "Workflow completed"}}

@router.websocket("/ws/{workflow_id}")
async def workflow_ws(websocket: WebSocket, workflow_id: str, current_user: dict = Depends(get_current_user)):
    await websocket.accept()
    await websocket.send_json({"type": "status", "workflow_id": workflow_id, "progress": 100, "message": "Demo complete"})
    await websocket.close()
