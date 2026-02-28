from fastapi import APIRouter
from app.api.v1.endpoints import auth, actions, workflows, approvals, audit, health

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(approvals.router, prefix="/approvals", tags=["approvals"])
api_router.include_router(audit.router, prefix="/audit", tags=["audit"])
api_router.include_router(health.router, tags=["health"])
