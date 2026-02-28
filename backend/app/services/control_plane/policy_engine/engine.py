from typing import Dict, Any, List, Optional
from enum import Enum
import yaml
import os
from pathlib import Path

from app.core.config import settings
from app.core.logging import logger


class PolicyDecision(str, Enum):
    ALLOW = "ALLOW"
    DENY = "DENY"
    REQUIRE_APPROVAL = "REQUIRE_APPROVAL"


class PolicyEngine:
    """
    Rule-based policy evaluator for enterprise governance.
    Loads YAML policies and evaluates context against rules.
    """
    
    def __init__(self, policy_dir: str = "config/policies"):
        self.policy_dir = Path(policy_dir)
        self._rules_cache: Dict[str, List[Dict]] = {}
        self._load_policies()
    
    def _load_policies(self) -> None:
        """Load policy YAML files into memory cache"""
        if not self.policy_dir.exists():
            logger.warning(f"Policy directory not found: {self.policy_dir}")
            return
        
        for policy_file in self.policy_dir.glob("*.yaml"):
            try:
                with open(policy_file, "r") as f:
                    policies = yaml.safe_load(f) or []
                    enterprise_id = policy_file.stem
                    self._rules_cache[enterprise_id] = policies
                    logger.info(f"Loaded {len(policies)} rules for {enterprise_id}")
            except Exception as e:
                logger.error(f"Failed to load policy {policy_file}: {e}")
    
    def evaluate(
        self,
        action_id: str,
        context: Dict[str, Any],
        enterprise_id: Optional[str] = None
    ) -> PolicyDecision:
        """
        Evaluate policy rules against action + context.
        
        Args:
            action_id: The action being requested (e.g., "approve_refund")
            context: User + enterprise + action context dict
            enterprise_id: Optional enterprise override
            
        Returns:
            PolicyDecision: ALLOW, DENY, or REQUIRE_APPROVAL
        """
        # Get applicable rules
        rules = self._rules_cache.get(
            enterprise_id or "default", 
            self._rules_cache.get("default", [])
        )
        
        # Evaluate rules in order (first match wins for DENY/REQUIRE)
        for rule in rules:
            if not self._rule_matches(rule, action_id, context):
                continue
                
            decision = rule.get("decision", "ALLOW").upper()
            if decision in [d.value for d in PolicyDecision]:
                logger.info(
                    "Policy decision",
                    action=action_id,
                    decision=decision,
                    rule_id=rule.get("id"),
                    reason=rule.get("reason")
                )
                return PolicyDecision(decision)
        
        # Default allow if no rules match
        logger.debug("No matching policy rules, defaulting to ALLOW")
        return PolicyDecision.ALLOW
    
    def _rule_matches(
        self, 
        rule: Dict[str, Any], 
        action_id: str, 
        context: Dict[str, Any]
    ) -> bool:
        """Check if a rule's conditions match the current context"""
        conditions = rule.get("if", {})
        
        # Action match
        if "action" in conditions:
            if conditions["action"] != action_id:
                return False
        
        # Amount threshold check
        if "amount_threshold" in conditions:
            amount = context.get("data", {}).get("amount", 0)
            threshold = conditions["amount_threshold"]
            operator = conditions.get("amount_operator", "lt")
            
            if operator == "lt" and not (amount < threshold):
                return False
            elif operator == "gte" and not (amount >= threshold):
                return False
        
        # Role/permission check
        if "required_role" in conditions:
            if context.get("user_role") != conditions["required_role"]:
                return False
        
        # Enterprise type check
        if "enterprise_type" in conditions:
            if context.get("enterprise_type") != conditions["enterprise_type"]:
                return False
        
        return True


# Global instance (lazy loaded)
_policy_engine: Optional[PolicyEngine] = None


def get_policy_engine() -> PolicyEngine:
    global _policy_engine
    if _policy_engine is None:
        _policy_engine = PolicyEngine()
    return _policy_engine