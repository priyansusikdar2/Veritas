from typing import List, Dict, Any, Optional, TypedDict
from pydantic import BaseModel, Field

class SourceDoc(BaseModel):
    id: str
    url: str
    title: str
    snippet: str
    domain: str
    credibility_score: int = 50  # 0 to 100
    credibility_tier: str = "MEDIUM"  # HIGH, MEDIUM, LOW, UNVERIFIED
    bias_indicator: str = "NEUTRAL"  # LEAN_LEFT, LEAN_RIGHT, SENSATIONALIST, OBJECTIVE, ACADEMIC
    source_type: str = "web"  # academic, official, news, blog, forum
    raw_content: Optional[str] = None

class SubQuery(BaseModel):
    id: str
    query: str
    angle: str  # "primary", "adversarial", "authoritative", "evidence"
    rationale: str
    status: str = "pending"  # pending, searching, completed, failed
    results_count: int = 0

class AnalyzedClaim(BaseModel):
    id: str
    claim_text: str
    category: str  # "VERIFIED_FACT", "UNSUBSTANTIATED_CLAIM", "DEBUNKED_FALSEHOOD", "CONTRADICTORY_VIEWPOINT"
    confidence: int  # 0-100
    supporting_sources: List[str] = Field(default_factory=list)  # titles or URLs
    opposing_sources: List[str] = Field(default_factory=list)
    counter_evidence: Optional[str] = None
    reasoning: str
    fallacies_detected: List[str] = Field(default_factory=list)

class Contradiction(BaseModel):
    id: str
    topic: str
    viewpoint_a: str
    source_a: str
    viewpoint_b: str
    source_b: str
    divergence_summary: str
    veritas_resolution: str

class GraphNode(BaseModel):
    id: str
    label: str
    node_type: str  # root, subquery, source, claim, verdict
    status: str  # idle, active, success, warning, danger
    category: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    edge_type: str = "default"

class DossierReport(BaseModel):
    query: str
    verdict: str  # "CONFIRMED TRUE", "MOSTLY TRUE", "MIXED / CONTEXT NEEDED", "UNSUBSTANTIATED", "DEBUNKED / FALSE"
    truth_score: int  # 0 to 100
    executive_summary: str
    key_findings: List[str]
    claims_breakdown: List[AnalyzedClaim]
    contradictions: List[Contradiction]
    sources: List[SourceDoc]
    citations: List[Dict[str, str]]
    investigation_depth: str
    generated_at: str

class ResearchState(TypedDict):
    query: str
    depth: str  # "quick", "deep", "exhaustive"
    subqueries: List[Dict[str, Any]]
    sources: List[Dict[str, Any]]
    claims: List[Dict[str, Any]]
    contradictions: List[Dict[str, Any]]
    graph_nodes: List[Dict[str, Any]]
    graph_edges: List[Dict[str, Any]]
    logs: List[Dict[str, Any]]
    dossier: Optional[Dict[str, Any]]
    api_keys: Dict[str, str]
