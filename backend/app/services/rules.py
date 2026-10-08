import ast
import yaml
import logging
from pathlib import Path
from typing import Dict, List, Any, Set

logger = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent.parent.parent.parent

class TriggerEvaluator(ast.NodeVisitor):
    def __init__(self, findings: Set[str], history: Dict[str, bool], age: int):
        self.findings = findings
        self.history = history
        self.age = age

    def evaluate(self, expr_str: str) -> bool:
        tree = ast.parse(expr_str, mode='eval')
        return self.visit(tree.body)

    def visit_BoolOp(self, node: ast.BoolOp) -> bool:
        if isinstance(node.op, ast.And):
            return all(self.visit(val) for val in node.values)
        elif isinstance(node.op, ast.Or):
            return any(self.visit(val) for val in node.values)
        raise ValueError(f"Unsupported BoolOp: {type(node.op)}")

    def visit_UnaryOp(self, node: ast.UnaryOp) -> bool:
        if isinstance(node.op, ast.Not):
            return not self.visit(node.operand)
        raise ValueError(f"Unsupported UnaryOp: {type(node.op)}")

    def visit_Compare(self, node: ast.Compare) -> bool:
        left = self.visit(node.left)
        if len(node.ops) != 1 or len(node.comparators) != 1:
            raise ValueError("Only simple comparisons supported")
        op = node.ops[0]
        right = self.visit(node.comparators[0])
        
        if isinstance(op, ast.Eq):
            return left == right
        elif isinstance(op, ast.NotEq):
            return left != right
        elif isinstance(op, ast.Gt):
            return left > right
        elif isinstance(op, ast.GtE):
            return left >= right
        elif isinstance(op, ast.Lt):
            return left < right
        elif isinstance(op, ast.LtE):
            return left <= right
        raise ValueError(f"Unsupported comparison: {type(op)}")

    def visit_Call(self, node: ast.Call) -> bool:
        if isinstance(node.func, ast.Name) and node.func.id == "has_finding":
            finding = node.args[0].value
            return finding in self.findings
        raise ValueError(f"Unsupported function call: {ast.dump(node.func)}")

    def visit_Name(self, node: ast.Name) -> Any:
        # Standardize true/false constants
        if node.id.lower() == "true":
            return True
        if node.id.lower() == "false":
            return False
        
        if node.id == "age":
            return self.age
        
        if node.id in self.history:
            return self.history[node.id]
        
        # Any other variable is treated as a missing history flag -> False
        return False

    def visit_Constant(self, node: ast.Constant) -> Any:
        return node.value

class RuleEngine:
    def __init__(self):
        with open(ROOT / "config" / "comorbidity_rules.yaml", "r", encoding="utf-8") as f:
            self.rules = yaml.safe_load(f).get("rules", [])
        with open(ROOT / "config" / "triage.yaml", "r", encoding="utf-8") as f:
            triage_conf = yaml.safe_load(f)
            self.urgent_findings = {x["finding"] for x in triage_conf.get("urgent_findings", [])}
            self.unreliable_findings = {x["finding"] for x in triage_conf.get("unreliable_findings", [])}

    def _extract_graph_nodes(self, trigger_str: str) -> List[Dict]:
        """Simple AST walk to extract used finding/history nodes for the UI graph."""
        nodes = []
        tree = ast.parse(trigger_str, mode='eval')
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and getattr(node.func, "id", "") == "has_finding":
                val = node.args[0].value
                nodes.append({"id": val, "type": "finding"})
            elif isinstance(node, ast.Name):
                if node.id.lower() not in ("true", "false", "age"):
                    nodes.append({"id": node.id, "type": "history"})
        return nodes

    def evaluate(self, analysis_result: List[Dict], history_flags: Dict[str, bool], age: int) -> Dict:
        # Analysis result is list of e.g. {"label": "Pneumothorax", "probability": 0.85, "tier": "high"}
        # For evaluation, we just need a set of finding labels that are present.
        # Let's say we only count medium/high tiers as "present".
        present_findings = {
            res["label"] for res in analysis_result 
            if res.get("tier", "low") in ("medium", "high")
        }
        
        evaluator = TriggerEvaluator(present_findings, history_flags, age)
        
        interactions = []
        graph_nodes = {}
        graph_edges = []
        highest_triage_val = 0
        triage_map = {"routine": 1, "soon": 2, "urgent": 3}
        triage_reasons = set()
        needs_human_review = False
        
        # Populate analysis nodes
        for f in present_findings:
            tier = next((res.get("tier") for res in analysis_result if res["label"] == f), "low")
            graph_nodes[f] = {"id": f, "type": "finding", "tier": tier}
            
            if f in self.urgent_findings:
                triage_reasons.add(f)
                highest_triage_val = max(highest_triage_val, triage_map["urgent"])
            if f in self.unreliable_findings:
                needs_human_review = True
        
        # Populate history nodes
        for h_key, h_val in history_flags.items():
            if h_val:
                graph_nodes[h_key] = {"id": h_key, "type": "history", "tier": "n/a"}

        for rule in self.rules:
            # Rule R3: if source is missing, refuse to emit
            if not rule.get("source"):
                logger.error(f"Rule {rule.get('id')} is missing a source citation. Refusing to evaluate.")
                continue

            try:
                fired = evaluator.evaluate(rule["trigger"])
            except Exception as e:
                logger.error(f"Failed to evaluate rule {rule.get('id')}: {e}")
                continue

            if fired:
                rule_id = rule["id"]
                draft = (rule.get("review_status") == "draft")
                statement = rule["statement_template"]
                if draft:
                    statement += " (Draft rule, not clinician-reviewed)."
                
                interactions.append({
                    "rule_id": rule_id,
                    "title": rule["title"],
                    "statement": statement,
                    "quantity": rule.get("quantity"),
                    "source": rule.get("source"),
                    "evidence_quality": rule.get("evidence_quality"),
                    "triage_level": rule["triage_level"],
                    "review_status": rule.get("review_status", "draft"),
                    "needs_clinician_signoff": draft
                })
                
                val = triage_map.get(rule["triage_level"], 1)
                if val > highest_triage_val:
                    highest_triage_val = val
                
                if val >= 2:
                    triage_reasons.add(rule_id)
                
                # Extract graph edges for this rule
                involved_entities = self._extract_graph_nodes(rule["trigger"])
                
                # Filter to only the entities that are actually true/present
                true_entities = []
                for entity in involved_entities:
                    eid = entity["id"]
                    if entity["type"] == "finding" and eid in present_findings:
                        true_entities.append(eid)
                        graph_nodes[eid] = {"id": eid, "type": "finding", "tier": "present"}
                    elif entity["type"] == "history" and history_flags.get(eid, False):
                        true_entities.append(eid)
                        graph_nodes[eid] = {"id": eid, "type": "history", "tier": "present"}
                
                # Connect all true entities of this rule to each other
                for i in range(len(true_entities)):
                    for j in range(i + 1, len(true_entities)):
                        graph_edges.append({
                            "source": true_entities[i],
                            "target": true_entities[j],
                            "rule_id": rule_id
                        })

        rev_triage_map = {1: "routine", 2: "soon", 3: "urgent"}
        final_level = rev_triage_map.get(highest_triage_val, "routine")
        
        return {
            "interactions": interactions,
            "graph": {
                "nodes": list(graph_nodes.values()),
                "edges": graph_edges
            },
            "triage": {
                "level": final_level,
                "reasons": list(triage_reasons),
                "needs_human_review": needs_human_review
            }
        }
