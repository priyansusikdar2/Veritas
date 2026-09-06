import re
import uuid
import urllib.parse
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup
from ddgs import DDGS

class ReaderAgent:
    """
    Scraper & Reader Agent: Executes web searches across parallel sub-queries,
    fetches live web pages, extracts textual evidence, and calculates domain
    authority & credibility scores.
    """

    HIGH_TRUST_DOMAINS = {
        "gov": 95, "edu": 92, "nature.com": 95, "science.org": 94, "nih.gov": 98,
        "cdc.gov": 96, "who.int": 94, "reuters.com": 92, "apnews.com": 92,
        "bbc.com": 90, "bbc.co.uk": 90, "wsj.com": 88, "bloomberg.com": 88,
        "nytimes.com": 85, "snopes.com": 90, "factcheck.org": 92, "politifact.com": 90,
        "wikipedia.org": 82, "arxiv.org": 90, "mit.edu": 95, "stanford.edu": 95,
        "harvard.edu": 95, "ft.com": 88, "theguardian.com": 84, "economist.com": 89
    }

    LOW_TRUST_INDICATORS = [
        "buzzfeed", "dailymail", "infowars", "naturalnews", "beforeitsnews",
        "thegatewaypundit", "worldnewsdailyreport", "rumble", "bitchute",
        "tiktok.com", "instagram.com", "facebook.com", "4chan.org", "forum"
    ]

    def __init__(self, tavily_api_key: Optional[str] = None):
        self.tavily_key = tavily_api_key
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Veritas-Research-Agent/1.0"
        }

    def assess_domain_credibility(self, url: str) -> Dict[str, Any]:
        """Calculates domain credibility score (0-100), trust tier, and bias."""
        try:
            domain = urllib.parse.urlparse(url).netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]
        except Exception:
            domain = "unknown"

        # Check high trust
        tld = domain.split(".")[-1] if "." in domain else ""
        if tld in ["gov", "mil"]:
            return {"domain": domain, "score": 96, "tier": "HIGH", "bias": "OFFICIAL", "type": "official"}
        if tld == "edu":
            return {"domain": domain, "score": 93, "tier": "HIGH", "bias": "ACADEMIC", "type": "academic"}

        for htd, score in self.HIGH_TRUST_DOMAINS.items():
            if htd in domain:
                bias = "ACADEMIC" if any(k in domain for k in ["arxiv", "nature", "science", "edu"]) else "OBJECTIVE"
                return {"domain": domain, "score": score, "tier": "HIGH", "bias": bias, "type": "reputable_press"}

        # Check low trust
        for ltd in self.LOW_TRUST_INDICATORS:
            if ltd in domain:
                return {"domain": domain, "score": 32, "tier": "LOW", "bias": "SENSATIONALIST", "type": "social_or_tabloid"}

        # Default standard web source
        return {"domain": domain, "score": 65, "tier": "MEDIUM", "bias": "MODERATE", "type": "web"}

    def search_subquery(self, subquery: Dict[str, Any], max_results: int = 4) -> List[Dict[str, Any]]:
        """Executes search for a given subquery using DDGS (with Tavily if available)."""
        query_text = subquery["query"]
        target_assertion = subquery.get("target_assertion", "")
        raw_results = []

        # Try DDGS primary query
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query_text, max_results=max_results))
                for r in results:
                    raw_results.append({
                        "url": r.get("href", ""),
                        "title": r.get("title", ""),
                        "snippet": r.get("body", "")
                    })
        except Exception as e:
            print(f"[ReaderAgent] DDGS query error for '{query_text}': {e}")

        # Fallback: if DDGS returned nothing, simplify query and retry
        if not raw_results:
            try:
                # Take top 4-5 core alphanumeric words
                clean_words = [w for w in re.findall(r"\b[A-Za-z0-9\-]{3,}\b", query_text) if w.lower() not in ["investigation", "evidence", "original", "claims", "facts", "controversy", "criticism", "debunk"]]
                if clean_words:
                    fallback_query = " ".join(clean_words[:5])
                    with DDGS() as ddgs:
                        fb_results = list(ddgs.text(fallback_query, max_results=max_results))
                        for r in fb_results:
                            raw_results.append({
                                "url": r.get("href", ""),
                                "title": r.get("title", ""),
                                "snippet": r.get("body", "")
                            })
            except Exception as fe:
                print(f"[ReaderAgent] DDGS fallback query error: {fe}")

        # If empty or Tavily provided, try Tavily
        if (not raw_results or self.tavily_key) and self.tavily_key:
            try:
                import requests
                resp = requests.post(
                    "https://api.tavily.com/search",
                    json={"query": query_text, "max_results": max_results},
                    headers={"Authorization": f"Bearer {self.tavily_key}"},
                    timeout=5
                )
                if resp.status_code == 200:
                    t_data = resp.json()
                    for r in t_data.get("results", []):
                        raw_results.append({
                            "url": r.get("url", ""),
                            "title": r.get("title", ""),
                            "snippet": r.get("content", "")
                        })
            except Exception as te:
                print(f"[ReaderAgent] Tavily fallback error: {te}")

        docs = []
        seen_urls = set()
        # Domains to filter out for research investigations
        BLOCKED_RESEARCH_DOMAINS = ["facebook.com", "instagram.com", "tiktok.com", "4chan.org", "pinterest.com"]

        for item in raw_results:
            url = item.get("url")
            if not url or url in seen_urls:
                continue
            
            # Filter noise domains
            if any(bd in url.lower() for bd in BLOCKED_RESEARCH_DOMAINS):
                continue

            seen_urls.add(url)

            cred = self.assess_domain_credibility(url)
            doc_id = f"doc_{uuid.uuid4().hex[:8]}"

            docs.append({
                "id": doc_id,
                "subquery_id": subquery["id"],
                "url": url,
                "title": item.get("title") or cred["domain"],
                "snippet": item.get("snippet", ""),
                "domain": cred["domain"],
                "credibility_score": cred["score"],
                "credibility_tier": cred["tier"],
                "bias_indicator": cred["bias"],
                "source_type": cred["type"],
                "subquery_angle": subquery["angle"],
                "target_assertion": target_assertion,
                "subquery_query": query_text
            })

        return docs

    def fetch_page_sample(self, url: str) -> Optional[str]:
        """Fetches and cleans the top paragraph text from a live URL for deep inspection."""
        try:
            resp = requests.get(url, headers=self.headers, timeout=4)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                # Remove scripts, styles, nav, footer
                for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
                    element.extract()
                paragraphs = [p.get_text().strip() for p in soup.find_all("p") if len(p.get_text().strip()) > 40]
                return " ".join(paragraphs[:4])[:1000]
        except Exception:
            pass
        return None
