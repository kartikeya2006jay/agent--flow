from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any, List, Optional
from enum import Enum
import uuid


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class CanonicalRequestContext(BaseModel):
    """Context metadata for canonical requests"""
    user_id: str
    enterprise_id: str
    enterprise_type: Optional[str] = "general"
    risk_level: RiskLevel = RiskLevel.low
    request_source: Optional[str] = "dashboard"  # dashboard, sdk, api
    trace_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))


class CanonicalRequest(BaseModel):
    """
    Standardized request schema for all agent communications.
    Ensures protocol consistency across heterogeneous agents.
    """
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action: str  # e.g., "approve_refund"
    target_agents: List[str]  # Execution order: ["support", "finance"]
    
    # Validated action-specific data
    data: Dict[str, Any]
    
    # Execution context
    context: CanonicalRequestContext
    
    # Execution parameters
    timeout_ms: int = 30000
    retry_count: int = 0
    max_retries: int = 3
    
    @field_validator("target_agents")
    @classmethod
    def validate_agents_not_empty(cls, v):
        if not v:
            raise ValueError("At least one target agent required")
        return v
    
    @field_validator("timeout_ms")
    @classmethod
    def validate_timeout(cls, v):
        if v < 1000 or v > 300000:  # 1s to 5min
            raise ValueError("timeout_ms must be between 1000 and 300000")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "action": "approve_refund",
                "target_agents": ["support", "finance"],
                "data": {
                    "order_id": "ORD-123",
                    "amount": 500.00,
                    "reason": "damaged_item"
                },
                "context": {
                    "user_id": "usr_abc123",
                    "enterprise_id": "ent_xyz789",
                    "risk_level": "medium"
                }
            }
        }