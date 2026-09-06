import re
import uuid
from typing import List, Dict, Any, Optional

class SearchCoordinatorAgent:
    """
    Search Coordinator: Formulates targeted sub-queries across complementary
    investigative vectors (primary check, adversarial/counter-narrative,
    authoritative consensus, and specific paper assertion audits).
    """

    def __init__(self):
        pass

    def formulate_subqueries(
        self,
        query: str,
        depth: str = "deep",
        research_paper: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        clean_query = query.strip().rstrip("?.!")
        subqueries = []

        # =============================================================
        # Mode A: Dedicated Research Paper Ingestion Vectors
        # =============================================================
        if research_paper:
            paper_title = research_paper.get("title") or research_paper.get("filename") or clean_query
            paper_title = re.sub(r"\.pdf$", "", paper_title, flags=re.IGNORECASE).replace("_", " ").strip()
            assertions = research_paper.get("key_assertions") or []
            venue = research_paper.get("venue") or ""

            # Vector 1: Primary Paper Benchmark & Empirical Replication
            subqueries.append({
                "id": f"sq_{uuid.uuid4().hex[:8]}",
                "query": f"{paper_title} replication benchmark empirical results",
                "display_label": f"[REPLICATION] {paper_title[:35]}...",
                "angle": "primary",
                "target_assertion": "Independent Benchmark Replication",
                "rationale": f"Auditing independent empirical replications and benchmark validity for '{paper_title}'",
                "status": "pending",
                "results_count": 0
            })

            # Vector 2: Primary Hypothesis / Assertion 1 Verification
            if assertions and len(assertions) > 0:
                # Clean assertion to top informative words
                a1_words = [w for w in re.findall(r"\b[A-Za-z0-9\-]{4,}\b", assertions[0]) if w.lower() not in ["this", "paper", "that", "with", "from", "into", "their"]][:6]
                a1_query = f"{paper_title} {' '.join(a1_words)}" if a1_words else f"{paper_title} core hypothesis"
                subqueries.append({
                    "id": f"sq_{uuid.uuid4().hex[:8]}",
                    "query": a1_query,
                    "display_label": f"[ASSERTION 1] {assertions[0][:32]}...",
                    "angle": "evidence",
                    "target_assertion": assertions[0],
                    "rationale": f"Testing Primary Paper Assertion: '{assertions[0][:50]}...'",
                    "status": "pending",
                    "results_count": 0
                })

            # Vector 3: Secondary Hypothesis / Assertion 2 Verification
            if assertions and len(assertions) > 1:
                a2_words = [w for w in re.findall(r"\b[A-Za-z0-9\-]{4,}\b", assertions[1]) if w.lower() not in ["this", "paper", "that", "with", "from", "into", "their"]][:6]
                a2_query = f"{paper_title} {' '.join(a2_words)}" if a2_words else f"{paper_title} methodology"
                subqueries.append({
                    "id": f"sq_{uuid.uuid4().hex[:8]}",
                    "query": a2_query,
                    "display_label": f"[ASSERTION 2] {assertions[1][:32]}...",
                    "angle": "evidence",
                    "target_assertion": assertions[1],
                    "rationale": f"Auditing Secondary Paper Assertion: '{assertions[1][:50]}...'",
                    "status": "pending",
                    "results_count": 0
                })

            # Vector 4: Adversarial Peer Review & Disproof Probe
            subqueries.append({
                "id": f"sq_{uuid.uuid4().hex[:8]}",
                "query": f"{paper_title} criticism controversy rebuttal limitations dispute",
                "display_label": f"[CRITIQUE] {paper_title[:35]}...",
                "angle": "adversarial",
                "target_assertion": "Adversarial Peer Review & Critique",
                "rationale": f"Uncovering adversarial peer reviews, critique preprints, and methodological disputes regarding '{paper_title}'",
                "status": "pending",
                "results_count": 0
            })

            # Vector 5: Institutional Consensus & Venue Validation
            clean_venue = re.sub(r"\(.*?\)", "", venue).strip()
            authoritative_terms = f"{paper_title} {clean_venue}".strip()
            subqueries.append({
                "id": f"sq_{uuid.uuid4().hex[:8]}",
                "query": f"{authoritative_terms} peer review scientific consensus",
                "display_label": f"[CONSENSUS] {paper_title[:35]}...",
                "angle": "authoritative",
                "target_assertion": "Institutional Peer Consensus",
                "rationale": f"Validating official conference/journal publication record and academic consensus",
                "status": "pending",
                "results_count": 0
            })

            return subqueries

        # =============================================================
        # Mode B: Standard Fact-Checking Investigation Vectors
        # =============================================================
        vectors = [
            {
                "angle": "primary",
                "suffix": "evidence facts investigation",
                "rationale": "Gather direct claims, primary coverage, and original reporting context"
            },
            {
                "angle": "adversarial",
                "suffix": "debunk criticism dispute false",
                "rationale": "Uncover counter-arguments, known hoaxes, debunkings, and alternative viewpoints"
            },
            {
                "angle": "authoritative",
                "suffix": "official report scientific consensus",
                "rationale": "Cross-reference against trusted institutions, academic papers, and official bodies"
            },
            {
                "angle": "evidence",
                "suffix": "data analysis timeline verified",
                "rationale": "Verify chronological timeline, technical feasibility, and hard metrics"
            }
        ]

        if depth == "exhaustive":
            vectors.append({
                "angle": "adversarial",
                "suffix": "whistleblowers contradictory evidence audits",
                "rationale": "Probe adversarial critiques, whistleblower testimony, or forensic audits"
            })

        for v in vectors:
            sub_id = f"sq_{uuid.uuid4().hex[:8]}"
            search_str = f"{clean_query} {v['suffix']}"
            subqueries.append({
                "id": sub_id,
                "query": search_str,
                "display_label": f"[{v['angle'].upper()}] {clean_query[:40]}...",
                "angle": v["angle"],
                "target_assertion": f"Investigative Vector: {v['angle'].title()}",
                "rationale": v["rationale"],
                "status": "pending",
                "results_count": 0
            })

        return subqueries

    def create_initial_graph(self, query: str, subqueries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Builds initial Graph Nodes & Edges for the React Flow Thought Canvas."""
        nodes = [
            {
                "id": "root",
                "label": query,
                "node_type": "root",
                "status": "active",
                "category": "QUERY",
                "metadata": {
                    "title": "Investigative Subject",
                    "full_query": query
                }
            }
        ]
        edges = []

        for sq in subqueries:
            nodes.append({
                "id": sq["id"],
                "label": sq["display_label"],
                "node_type": "subquery",
                "status": "pending",
                "category": sq["angle"].upper(),
                "metadata": {
                    "angle": sq["angle"],
                    "rationale": sq["rationale"],
                    "query": sq["query"],
                    "target_assertion": sq.get("target_assertion", "")
                }
            })
            edges.append({
                "id": f"edge_root_{sq['id']}",
                "source": "root",
                "target": sq["id"],
                "label": sq["angle"],
                "edge_type": "investigate"
            })

        return {"nodes": nodes, "edges": edges}
