from backend.app.services.rules import TriggerEvaluator, RuleEngine
import pytest

def test_trigger_evaluator():
    findings = {"TB-pattern", "Pneumonia"}
    history = {"diabetes": True, "smoker": False}
    age = 70
    
    evaluator = TriggerEvaluator(findings, history, age)
    
    assert evaluator.evaluate("diabetes == true") is True
    assert evaluator.evaluate("diabetes == false") is False
    assert evaluator.evaluate("smoker == true") is False
    assert evaluator.evaluate("has_finding('TB-pattern')") is True
    assert evaluator.evaluate("has_finding('Consolidation')") is False
    assert evaluator.evaluate("diabetes == true and has_finding('TB-pattern')") is True
    assert evaluator.evaluate("age >= 65 and has_finding('Pneumonia')") is True
    assert evaluator.evaluate("smoker == true and has_finding('TB-pattern')") is False
    assert evaluator.evaluate("(has_finding('Osteopenia_Pattern') or has_finding('Osteoporosis_Pattern')) and has_finding('Fracture')") is False

def test_rule_engine_integration():
    engine = RuleEngine()
    analysis_result = [
        {"label": "TB-pattern", "probability": 0.8, "tier": "high"},
        {"label": "Pneumothorax", "probability": 0.9, "tier": "high"},
        {"label": "Infiltration", "probability": 0.6, "tier": "medium"}
    ]
    history = {"diabetes": True, "pregnancy": False}
    age = 50
    
    res = engine.evaluate(analysis_result, history, age)
    
    # interactions
    rule_ids = [i["rule_id"] for i in res["interactions"]]
    assert "diabetes_tb" in rule_ids
    assert "pneumothorax_urgent" in rule_ids
    assert "pregnancy_cardiomegaly" not in rule_ids
    
    # triage
    assert res["triage"]["level"] == "urgent"
    assert "Pneumothorax" in res["triage"]["reasons"]
    assert "pneumothorax_urgent" in res["triage"]["reasons"]
    assert res["triage"]["needs_human_review"] is True # due to infiltration
    
    # graph
    nodes = {n["id"] for n in res["graph"]["nodes"]}
    assert "TB-pattern" in nodes
    assert "diabetes" in nodes
    assert "Pneumothorax" in nodes
    
    edges = res["graph"]["edges"]
    assert any(e["rule_id"] == "diabetes_tb" for e in edges)
