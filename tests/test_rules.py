import yaml
import pytest
from backend.app.schemas.rules import RuleList

def test_comorbidity_rules_validity():
    with open("config/comorbidity_rules.yaml", "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    
    # This will raise ValidationError if schema constraints are not met
    # e.g., missing DOI/URL, missing review_status, missing source, etc.
    rule_list = RuleList(**data)
    
    for rule in rule_list.rules:
        assert rule.source is not None and len(rule.source.strip()) > 0, f"Rule {rule.id} lacks a source"
        assert ("doi:" in rule.source.lower() or "http" in rule.source.lower()), f"Rule {rule.id} lacks a DOI/URL in source"
        assert rule.review_status in ["draft", "reviewed"], f"Rule {rule.id} review_status is invalid"
