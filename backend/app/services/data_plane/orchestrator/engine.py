from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import asyncio
import uuid

from app.core.logging import logger
from app.schemas.canonical.request import CanonicalRequest
from app.schemas.canonical.response import (
    CanonicalResponse, 
    ExecutionStatus, 
    AgentStepResult
)
from app.services.control_plane.policy_engine.engine import (
    get_policy_engine, 
    PolicyDecision
)
from app.services.control_plane.risk_approval.engine import (
    get_risk_approval_engine,
    RiskLevel
)


class WorkflowOrchestrator:
    """
    Executes workflows as DAGs of agent calls.
    Handles sequencing, parallelism, retries, and state management.
    """
    
    def __init__(self):
        self.policy_engine = get_policy_engine()
        self.risk_engine = get_risk_approval_engine()
        # In MVP: mock agent executor (replace with real connectors)
        self._agent_executors = {}
    
    async def execute_workflow(
        self,
        request: CanonicalRequest
    ) -> CanonicalResponse:
        """
        Execute a full workflow: policy check → agent calls → response normalization
        """
        workflow_id = str(uuid.uuid4())
        logger.info(
            "Workflow started",
            workflow_id=workflow_id,
            action=request.action,
            trace_id=request.context.trace_id
        )
        
        # Step 1: Policy evaluation
        policy_decision = self.policy_engine.evaluate(
            action_id=request.action,
            context={
                "user_role": "member",  # From auth in real impl
                "enterprise_type": request.context.enterprise_type,
                "data": request.data,
            },
            enterprise_id=request.context.enterprise_id
        )
        
        # Step 2: Risk assessment
        risk_level, risk_score = self.risk_engine.calculate_risk_score(
            action_id=request.action,
            context={"data": request.data}
        )
        
        # Step 3: Check if approval needed
        if self.risk_engine.requires_approval(risk_level, policy_decision):
            return await self._handle_approval_flow(
                workflow_id=workflow_id,
                request=request,
                policy_decision=policy_decision,
                risk_level=risk_level,
                risk_score=risk_score
            )
        
        # Step 4: Execute agent sequence
        return await self._execute_agent_sequence(
            workflow_id=workflow_id,
            request=request,
            policy_decision=policy_decision,
            risk_level=risk_level
        )
    
    async def _handle_approval_flow(
        self,
        workflow_id: str,
        request: CanonicalRequest,
        policy_decision: PolicyDecision,
        risk_level: RiskLevel,
        risk_score: float
    ) -> CanonicalResponse:
        """Pause workflow and create approval request"""
        logger.info(
            "Workflow paused for approval",
            workflow_id=workflow_id,
            risk_level=risk_level.value
        )
        
        # Create approval request (simplified approvers list)
        approval_req = self.risk_engine.create_approval_request(
            workflow_id=workflow_id,
            action_id=request.action,
            context={
                "data": request.data,
                "enterprise_id": request.context.enterprise_id,
            },
            risk_level=risk_level,
            risk_score=risk_score,
            approvers=["admin@enterprise.com"]  # Dynamic in prod
        )
        
        return CanonicalResponse(
            request_id=request.request_id,
            workflow_id=workflow_id,
            status=ExecutionStatus.pending_approval,
            policy_decision=policy_decision.value,
            approval_request_id=approval_req["id"],
            risk_flag=True,
            trace_id=request.context.trace_id or str(uuid.uuid4())
        )
    
    async def _execute_agent_sequence(
        self,
        workflow_id: str,
        request: CanonicalRequest,
        policy_decision: PolicyDecision,
        risk_level: RiskLevel
    ) -> CanonicalResponse:
        """Execute agents in sequence (MVP: mock execution)"""
        agent_results = []
        total_tokens = 0
        total_duration = 0
        start_time = datetime.now(timezone.utc)
        
        for agent_id in request.target_agents:
            try:
                # Mock agent execution (replace with real connector calls)
                result = await self._mock_execute_agent(
                    agent_id=agent_id,
                    action=request.action,
                    data=request.data
                )
                
                agent_results.append(AgentStepResult(
                    agent_id=agent_id,
                    status=ExecutionStatus.success,
                    result=result,
                    confidence=0.95,
                    tokens_used=150,
                    duration_ms=200
                ))
                total_tokens += 150
                total_duration += 200
                
            except Exception as e:
                logger.error(
                    "Agent execution failed",
                    agent_id=agent_id,
                    error=str(e)
                )
                return CanonicalResponse(
                    request_id=request.request_id,
                    workflow_id=workflow_id,
                    status=ExecutionStatus.failed,
                    error=f"Agent {agent_id} failed: {str(e)}",
                    agent_results=agent_results,
                    total_tokens_used=total_tokens,
                    total_duration_ms=total_duration,
                    policy_decision=policy_decision.value,
                    risk_flag=risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL],
                    trace_id=request.context.trace_id or str(uuid.uuid4())
                )
        
        # Build final response
        duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
        
        return CanonicalResponse(
            request_id=request.request_id,
            workflow_id=workflow_id,
            status=ExecutionStatus.success,
            result={"message": f"{request.action} completed successfully"},
            agent_results=agent_results,
            total_tokens_used=total_tokens + 150,  # Final aggregation
            total_duration_ms=max(duration_ms, total_duration),
            overall_confidence=0.95,
            policy_decision=policy_decision.value,
            risk_flag=risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL],
            compliance_tags=["finance_transaction"] if "finance" in request.target_agents else [],
            trace_id=request.context.trace_id or str(uuid.uuid4())
        )
    
    async def _mock_execute_agent(
        self,
        agent_id: str,
        action: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Mock agent execution for MVP testing"""
        await asyncio.sleep(0.1)  # Simulate network call
        
        # Return agent-specific mock responses
        mocks = {
            "support": {"ticket_id": f"ZD-{uuid.uuid4().hex[:6].upper()}"},
            "finance": {"transaction_id": f"ch_{uuid.uuid4().hex[:8]}"},
            "hr": {"confirmation_id": f"HR-{uuid.uuid4().hex[:6].upper()}"},
            "it_ops": {"ticket_id": f"JIRA-{uuid.uuid4().hex[:6].upper()}"},
            "sales": {"opportunity_id": f"OPP-{uuid.uuid4().hex[:6].upper()}"},
        }
        return mocks.get(agent_id, {"status": "completed"})


# Global instance
_orchestrator: Optional[WorkflowOrchestrator] = None


def get_workflow_orchestrator() -> WorkflowOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = WorkflowOrchestrator()
    return _orchestrator