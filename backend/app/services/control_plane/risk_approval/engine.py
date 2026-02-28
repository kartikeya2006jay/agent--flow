from typing import Dict, Any, Optional, List
from enum import Enum
from datetime import datetime, timezone
import uuid

from app.core.config import settings
from app.core.logging import logger


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"


class RiskApprovalEngine:
    """
    Human-in-the-Loop approval workflow manager.
    Calculates risk scores and manages approval lifecycle.
    """
    
    def __init__(self):
        # In-memory store for MVP (replace with Redis/DB in prod)
        self._approval_requests: Dict[str, Dict] = {}
    
    def calculate_risk_score(
        self,
        action_id: str,
        context: Dict[str, Any],
        agent_responses: Optional[List[Dict]] = None
    ) -> tuple[RiskLevel, float]:
        """
        Calculate risk level (0-100 score) based on triggers.
        
        Returns:
            tuple: (RiskLevel enum, numeric score 0-100)
        """
        score = 0.0
        reasons = []
        
        # Financial impact trigger
        amount = context.get("data", {}).get("amount", 0)
        if amount > settings.AUTO_APPROVAL_AMOUNT_THRESHOLD * 10:
            score += 40
            reasons.append(f"High financial impact: ${amount}")
        elif amount > settings.AUTO_APPROVAL_AMOUNT_THRESHOLD:
            score += 20
            reasons.append(f"Medium financial impact: ${amount}")
        
        # Low confidence from agents
        if agent_responses:
            avg_confidence = sum(
                r.get("confidence", 1.0) for r in agent_responses
            ) / len(agent_responses)
            if avg_confidence < settings.HIGH_RISK_CONFIDENCE_THRESHOLD:
                score += 25
                reasons.append(f"Low agent confidence: {avg_confidence:.2f}")
        
        # Sensitive data detection (simplified)
        data_str = str(context.get("data", {}))
        if any(pattern in data_str for pattern in settings.PII_PATTERNS):
            score += 30
            reasons.append("Potential PII/PHI detected")
        
        # Normalize to 0-100
        score = min(100, max(0, score))
        
        # Map to RiskLevel enum
        if score >= 75:
            level = RiskLevel.CRITICAL
        elif score >= 50:
            level = RiskLevel.HIGH
        elif score >= 25:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW
        
        logger.info(
            "Risk assessment",
            action=action_id,
            risk_level=level.value,
            score=score,
            reasons=reasons
        )
        
        return level, score
    
    def requires_approval(
        self,
        risk_level: RiskLevel,
        policy_decision: "PolicyDecision"  # type: ignore
    ) -> bool:
        """Determine if human approval is required"""
        if policy_decision.value == "REQUIRE_APPROVAL":
            return True
        if risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
            return True
        return False
    
    def create_approval_request(
        self,
        workflow_id: str,
        action_id: str,
        context: Dict[str, Any],
        risk_level: RiskLevel,
        risk_score: float,
        approvers: List[str]
    ) -> Dict[str, Any]:
        """Create a new approval request"""
        request_id = str(uuid.uuid4())
        
        request = {
            "id": request_id,
            "workflow_id": workflow_id,
            "action_id": action_id,
            "context": context,
            "risk_level": risk_level.value,
            "risk_score": risk_score,
            "status": ApprovalStatus.PENDING.value,
            "approvers": approvers,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "decisions": [],
            "escalation_deadline": None,
        }
        
        self._approval_requests[request_id] = request
        logger.info("Approval request created", request_id=request_id)
        
        return request
    
    def get_approval_request(self, request_id: str) -> Optional[Dict]:
        return self._approval_requests.get(request_id)
    
    def submit_decision(
        self,
        request_id: str,
        approver_id: str,
        decision: ApprovalStatus,
        comments: Optional[str] = None
    ) -> Optional[Dict]:
        """Record an approval decision"""
        request = self._approval_requests.get(request_id)
        if not request:
            return None
        
        # Record decision
        request["decisions"].append({
            "approver_id": approver_id,
            "decision": decision.value,
            "comments": comments,
            "timestamp": datetime.now(timezone.utc)
        })
        request["updated_at"] = datetime.now(timezone.utc)
        
        # If approved or rejected, update status
        if decision in [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED]:
            request["status"] = decision.value
            logger.info(
                "Approval decision recorded",
                request_id=request_id,
                decision=decision.value
            )
        
        return request
    
    def list_pending_approvals(
        self, 
        enterprise_id: str, 
        user_id: Optional[str] = None
    ) -> List[Dict]:
        """List pending approvals for a user/enterprise"""
        pending = []
        for req in self._approval_requests.values():
            if req["status"] != ApprovalStatus.PENDING.value:
                continue
            if req["context"].get("enterprise_id") != enterprise_id:
                continue
            if user_id and user_id not in req["approvers"]:
                continue
            pending.append(req)
        return pending


# Global instance
_risk_engine: Optional[RiskApprovalEngine] = None


def get_risk_approval_engine() -> RiskApprovalEngine:
    global _risk_engine
    if _risk_engine is None:
        _risk_engine = RiskApprovalEngine()
    return _risk_engine