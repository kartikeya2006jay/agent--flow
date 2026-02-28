from sqlalchemy import Column, String, JSON, Float, Integer
from app.db.base import Base
from app.models.base import TimestampMixin


class ActionDefinition(Base, TimestampMixin):
    """Predefined safe actions from Action Library"""
    __tablename__ = "action_definitions"
    
    id = Column(String, primary_key=True, index=True)  # e.g., "approve_refund"
    name = Column(String, nullable=False)
    description = Column(String)
    
    # Required agents in execution order
    target_agents = Column(JSON, nullable=False)  # ["support", "finance"]
    
    # Risk configuration
    risk_level = Column(String, default="medium")  # low, medium, high
    auto_approval_threshold = Column(Float)  # Amount threshold for auto-approve
    
    # Schema validation
    input_schema = Column(JSON, nullable=False)  # JSON Schema for validation
    output_schema = Column(JSON)  # Expected canonical response schema
    
    # Cost estimation
    estimated_tokens = Column(Integer, default=500)
    base_cost = Column(Float, default=0.01)
    
    # Enterprise overrides
    enterprise_id = Column(String, index=True)  # NULL = global default
    
    def __repr__(self) -> str:
        return f"<ActionDefinition(id='{self.id}', risk='{self.risk_level}')>"