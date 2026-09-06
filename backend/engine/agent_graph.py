import asyncio
import json
import uuid
import datetime
from typing import Dict, Any, AsyncGenerator, List, Optional

from langgraph.graph import StateGraph, END
from backend.engine.state import ResearchState
from backend.engine.search_coordinator import SearchCoordinatorAgent
from backend.engine.reader_agent import ReaderAgent
from backend.engine.cross_examiner import CrossExaminerAgent
from backend.engine.dossier_agent import DossierAgent
from backend.engine.llm_client import VeritasLLMClient

class VeritasAgentGraph:
    """
    Veritas LangGraph Orchestrator:
    Manages state transitions across Search Coordinator, Scraper & Reader,
    Cross-Examiner, and Dossier Synthesis agents.
    Provides real-time event streaming for the React Flow frontend.
    """

    def __init__(self, tavily_api_key: str = ""):
        self.coordinator = SearchCoordinatorAgent()
        self.reader = ReaderAgent(tavily_api_key=tavily_api_key)
        self.cross_examiner = CrossExaminerAgent()
        self.dossier_agent = DossierAgent()

    async def run_stream(
        self,
        query: str,
        depth: str = "deep",
        api_keys: Optional[Dict[str, str]] = None,
        research_file_text: Optional[str] = None,
        research_filename: Optional[str] = None,
        research_paper: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Executes the autonomous deep-research graph and yields SSE data events.
        """
        if api_keys is None:
            api_keys = {}

        if not research_paper and research_file_text:
            research_paper = {
                "filename": research_filename or "Uploaded_Document.pdf",
                "title": (research_filename or "Uploaded Research Paper").replace(".pdf", "").replace("_", " "),
                "page_count": 1,
                "word_count": len(research_file_text.split()),
                "abstract_summary": research_file_text[:800],
                "key_assertions": [s.strip() for s in research_file_text[:600].split(".") if len(s.strip()) > 30][:3],
                "preview": research_file_text[:400]
            }

        llm_client = VeritasLLMClient(api_keys=api_keys)
        active_llm = llm_client.get_active_provider()

        # Update reader tavily key if provided in request
        if api_keys.get("tavily"):
            self.reader.tavily_key = api_keys["tavily"]

        # Helper to format SSE message
        def sse(event_type: str, data: Any) -> str:
            payload = {
                "event": event_type,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "data": data
            }
            return f"data: {json.dumps(payload)}\n\n"

        # Step 0: Announce initialization & active LLM engine
        yield sse("agent_log", {
            "agent": "Orchestrator",
            "level": "INFO",
            "message": f"Initializing Veritas Autonomous Investigation into: '{query}' [Depth: {depth.upper()}] | LLM Engine: {active_llm}"
        })
        await asyncio.sleep(0.3)

        # Ingest research file if provided
        if research_file_text:
            yield sse("agent_log", {
                "agent": "Research File Ingestion",
                "level": "SUCCESS",
                "message": f"Loaded research document '{research_filename or 'Uploaded Paper'}'. Cross-referencing document assertions against empirical web consensus."
            })
            await asyncio.sleep(0.3)

        # -------------------------------------------------------------
        # 1. Search Coordinator Agent
        # -------------------------------------------------------------
        yield sse("agent_log", {
            "agent": "Search Coordinator",
            "level": "INFO",
            "message": f"Decomposing query into multi-vector investigative angles using {active_llm}..."
        })

        subqueries = self.coordinator.formulate_subqueries(query, depth=depth, research_paper=research_paper)
        initial_graph = self.coordinator.create_initial_graph(query, subqueries)

        yield sse("subqueries_spawned", {
            "subqueries": subqueries,
            "graph": initial_graph
        })
        yield sse("agent_log", {
            "agent": "Search Coordinator",
            "level": "SUCCESS",
            "message": f"Formulated {len(subqueries)} parallel search vectors. Spawning Scraper & Reader Agent."
        })
        await asyncio.sleep(0.4)

        # -------------------------------------------------------------
        # 2. Scraper & Reader Agent (Recursive Search & Live Web Scraping)
        # -------------------------------------------------------------
        yield sse("agent_log", {
            "agent": "Scraper & Reader Agent",
            "level": "INFO",
            "message": "Dispatching parallel web crawlers across DuckDuckGo and live web indices..."
        })

        all_sources: List[Dict[str, Any]] = []
        source_nodes = []
        source_edges = []

        for idx, sq in enumerate(subqueries):
            yield sse("subquery_status", {
                "subquery_id": sq["id"],
                "status": "searching"
            })
            yield sse("agent_log", {
                "agent": "Scraper & Reader Agent",
                "level": "INFO",
                "message": f"Searching vector [{sq['angle'].upper()}]: '{sq['query']}'"
            })

            # Execute search synchronously in threadpool to keep async loop fluid
            docs = await asyncio.to_thread(self.reader.search_subquery, sq, 4)
            all_sources.extend(docs)

            yield sse("subquery_status", {
                "subquery_id": sq["id"],
                "status": "completed",
                "results_count": len(docs)
            })

            # Stream individual discovered sources
            for doc in docs:
                node_id = doc["id"]
                node_status = "success" if doc["credibility_tier"] == "HIGH" else ("warning" if doc["credibility_tier"] == "MEDIUM" else "danger")
                
                source_node = {
                    "id": node_id,
                    "label": f"[{doc['credibility_tier']}] {doc['domain']}",
                    "node_type": "source",
                    "status": node_status,
                    "category": doc["credibility_tier"],
                    "metadata": {
                        "url": doc["url"],
                        "title": doc["title"],
                        "score": doc["credibility_score"],
                        "tier": doc["credibility_tier"],
                        "bias": doc["bias_indicator"],
                        "snippet": doc["snippet"],
                        "target_assertion": doc.get("target_assertion", ""),
                        "subquery_angle": doc.get("subquery_angle", ""),
                        "subquery_query": doc.get("subquery_query", "")
                    }
                }
                edge = {
                    "id": f"edge_{sq['id']}_{node_id}",
                    "source": sq["id"],
                    "target": node_id,
                    "label": f"{doc['credibility_score']}%",
                    "edge_type": "source"
                }

                source_nodes.append(source_node)
                source_edges.append(edge)

                yield sse("source_discovered", {
                    "source": doc,
                    "node": source_node,
                    "edge": edge
                })
                await asyncio.sleep(0.08)

        yield sse("agent_log", {
            "agent": "Scraper & Reader Agent",
            "level": "SUCCESS",
            "message": f"Successfully mapped and credibility-scored {len(all_sources)} live web sources."
        })
        await asyncio.sleep(0.3)

        # -------------------------------------------------------------
        # 3. Cross-Examiner (Adversarial) Agent
        # -------------------------------------------------------------
        yield sse("agent_log", {
            "agent": "Cross-Examiner Agent",
            "level": "WARNING",
            "message": "Initiating adversarial cross-examination: Stress-testing claims against high-authority consensus, checking for fallacies and rumors..."
        })

        claims, contradictions, truth_score = await asyncio.to_thread(
            self.cross_examiner.extract_and_cross_examine,
            query,
            all_sources,
            research_paper,
            llm_client
        )

        claim_nodes = []
        claim_edges = []
        for claim in claims:
            c_node_id = claim["id"]
            cat = claim["category"]
            c_status = "success" if cat == "VERIFIED_FACT" else ("danger" if cat == "DEBUNKED_FALSEHOOD" else ("warning" if cat == "CONTRADICTORY_VIEWPOINT" else "idle"))
            
            c_node = {
                "id": c_node_id,
                "label": f"[{cat.replace('_', ' ')}] {claim['claim_text'][:35]}...",
                "node_type": "claim",
                "status": c_status,
                "category": cat,
                "metadata": {
                    "claim_text": claim["claim_text"],
                    "category": cat,
                    "confidence": claim["confidence"],
                    "reasoning": claim["reasoning"],
                    "fallacies": claim["fallacies_detected"]
                }
            }
            claim_nodes.append(c_node)

            # Connect root or corresponding source to claim
            edge = {
                "id": f"edge_claim_{c_node_id}",
                "source": "root",
                "target": c_node_id,
                "label": f"{claim['confidence']}%",
                "edge_type": "claim"
            }
            claim_edges.append(edge)

            yield sse("claim_analyzed", {
                "claim": claim,
                "node": c_node,
                "edge": edge
            })
            await asyncio.sleep(0.06)

        yield sse("agent_log", {
            "agent": "Cross-Examiner Agent",
            "level": "SUCCESS",
            "message": f"Adversarial review complete: Isolated {len(claims)} distinct claims and {len(contradictions)} evidentiary divergence points."
        })
        await asyncio.sleep(0.3)

        # -------------------------------------------------------------
        # 4. Dossier & Synthesis Agent
        # -------------------------------------------------------------
        yield sse("agent_log", {
            "agent": "Dossier Agent",
            "level": "INFO",
            "message": "Synthesizing comprehensive investigative report, truth meter gauge, and citation dossier..."
        })

        dossier = await asyncio.to_thread(
            self.dossier_agent.compile_dossier,
            query,
            depth,
            all_sources,
            claims,
            contradictions,
            truth_score,
            research_paper,
            llm_client
        )

        # Add Verdict Node to React Flow
        verdict_node = {
            "id": "verdict",
            "label": f"VERDICT: {dossier['verdict']} ({truth_score}/100)",
            "node_type": "verdict",
            "status": "success" if truth_score >= 60 else ("danger" if truth_score <= 30 else "warning"),
            "category": "VERDICT",
            "metadata": {
                "verdict": dossier["verdict"],
                "truth_score": truth_score,
                "summary": dossier["executive_summary"]
            }
        }
        verdict_edge = {
            "id": "edge_root_verdict",
            "source": "root",
            "target": "verdict",
            "label": "final synthesis",
            "edge_type": "verdict"
        }

        yield sse("dossier_ready", {
            "dossier": dossier,
            "verdict_node": verdict_node,
            "verdict_edge": verdict_edge
        })

        yield sse("agent_log", {
            "agent": "Orchestrator",
            "level": "SUCCESS",
            "message": f"Investigation completed successfully. Verdict: '{dossier['verdict']}' with Truth Score {truth_score}/100."
        })
        yield sse("complete", {"status": "success", "truth_score": truth_score})
