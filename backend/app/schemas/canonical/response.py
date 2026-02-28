from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from enum import Enum
from datetime import datetime


class ExecutionStatus(str, Enum):
    success = "success"
    failed = "failed"
    pending_approval = "pending_approval"
    timeout = "timeout"
    cancelled = "cancelled"


class AgentStepResult(BaseModel):
    """Result from a single agent in the workflow"""
    agent_id: str
    status: ExecutionStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)
    tokens_used: int = 0
    duration_ms: int = 0
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class CanonicalResponse(BaseModel):
    """
    Standardized response schema from workflow execution.
    Normalized output regardless of underlying agent implementations.
    """
    request_id: str
    workflow_id: str
    status: ExecutionStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    
    # Aggregated metrics
    agent_results: List[AgentStepResult] = Field(default_factory=list)
    total_tokens_used: int = 0
    total_duration_ms: int = 0
    overall_confidence: float = Field(ge=0.0, le=1.0, default=1.0)
    
    # Governance metadata
    policy_decision: Optional[str] = None
    approval_request_id: Optional[str] = None
    risk_flag: bool = False
    compliance_tags: List[str] = Field(default_factory=list)
    
    # Traceability
    trace_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "request_id": "req_abc123",
                "workflow_id": "wf_xyz789",
                "status": "success",
                "result": {
                    "ticket_id": "ZD-456",
                    "transaction_id": "ch_abc123"
                },
                "agent_results": [
                    {
                        "agent_id": "support",
                        "status": "success",
                        "result": {"ticket_id": "ZD-456"},
                        "confidence": 0.98,
                        "tokens_used": 200
                    }
                ],
                "total_tokens_used": 450,
                "overall_confidence": 0.95,
                "trace_id": "trace_def456"
            }
        }