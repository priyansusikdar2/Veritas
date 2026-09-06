import json
import requests
from typing import Optional, Dict, Any

class VeritasLLMClient:
    """
    Multi-Provider LLM Client supporting:
    - Google Gemini (API key)
    - OpenAI (API key)
    - Groq (API key)
    - Fallback Intelligent Local Extraction
    """

    def __init__(self, api_keys: Optional[Dict[str, str]] = None):
        self.api_keys = api_keys or {}

    @property
    def has_active_llm(self) -> bool:
        return bool(self.api_keys.get("gemini") or self.api_keys.get("openai") or self.api_keys.get("groq"))

    def get_active_provider(self) -> str:
        if self.api_keys.get("gemini"):
            return "Google Gemini"
        if self.api_keys.get("openai"):
            return "OpenAI"
        if self.api_keys.get("groq"):
            return "Groq LLaMA-3"
        return "Autonomous Built-In Engine"

    def generate(self, prompt: str, system_prompt: str = "") -> Optional[str]:
        # 1. Try Gemini
        gemini_key = self.api_keys.get("gemini")
        if gemini_key:
            try:
                # Try gemini-1.5-flash or gemini-2.0-flash
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{
                        "parts": [{"text": f"{system_prompt}\n\n{prompt}" if system_prompt else prompt}]
                    }]
                }
                resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=12)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        return candidates[0]["content"]["parts"][0]["text"].strip()
                else:
                    print(f"[LLMClient] Gemini returned HTTP {resp.status_code}: {resp.text[:120]}")
            except Exception as e:
                print(f"[LLMClient] Gemini error: {e}")

        # 2. Try OpenAI
        openai_key = self.api_keys.get("openai")
        if openai_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {openai_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt or "You are an adversarial fact-checker and deep-researcher."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2
                }
                resp = requests.post(url, json=payload, headers=headers, timeout=12)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    print(f"[LLMClient] OpenAI returned HTTP {resp.status_code}: {resp.text[:120]}")
            except Exception as e:
                print(f"[LLMClient] OpenAI error: {e}")

        # 3. Try Groq
        groq_key = self.api_keys.get("groq")
        if groq_key:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt or "You are an adversarial fact-checker and deep-researcher."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2
                }
                resp = requests.post(url, json=payload, headers=headers, timeout=12)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    print(f"[LLMClient] Groq returned HTTP {resp.status_code}: {resp.text[:120]}")
            except Exception as e:
                print(f"[LLMClient] Groq error: {e}")

        return None

    def cross_examine_claim(
        self,
        query: str,
        context_snippets: list,
        paper_text: str = ""
    ) -> Optional[Dict[str, Any]]:
        """
        Adversarially evaluates a query and evidence snippets using the active LLM.
        Calibrates truth score into a 0-100 mathematical scale with clear debunk target distinction.
        """
        if self.get_active_provider() == "Autonomous Built-In Engine":
            return None

        system_prompt = (
            "You are an adversarial investigative cross-examiner and empirical epistemologist in Veritas. "
            "Your task is to analyze an empirical claim or research query against the provided search snippets and document text. "
            "Adhere strictly to these 5 score tiers without arbitrary clamping:\n"
            "- DEBUNKED_FALSEHOOD: Score 4-18 (Explicitly disproven hoaxes, pseudo-science, or falsified claims)\n"
            "- UNSUBSTANTIATED_RUMOR: Score 22-38 (Anecdotal claims, viral unverified rumors, lacking peer backing)\n"
            "- MIXED_EVIDENCE: Score 42-58 (Active scientific or factual disputes, competing empirical data sets)\n"
            "- MOSTLY_TRUE: Score 62-78 (Substantiated by credible reporting with minor caveats or pending final replication)\n"
            "- CONFIRMED_FACTUAL: Score 85-98 (Peer-reviewed consensus, established historical or empirical fact)\n\n"
            "CRITICAL: Distinguish debunk target polarity! E.g., if evidence says 'moon landing hoax debunked', "
            "the hoax is false, meaning human moon landings are CONFIRMED_FACTUAL (~95).\n"
            "Return ONLY raw JSON with no conversational text or markdown code fences."
        )

        evidence_str = "\n".join([f"- {s}" for s in context_snippets[:10] if s])
        paper_str = f"\nResearch Paper Context:\n{paper_text[:800]}" if paper_text else ""

        prompt = f"""Subject Query: "{query}"
Collected Live Evidence:
{evidence_str}
{paper_str}

Evaluate this query and evidence. Return a JSON object with this exact schema:
{{
  "verdict": "CONFIRMED_FACTUAL" | "MOSTLY_TRUE" | "MIXED_EVIDENCE" | "UNSUBSTANTIATED_RUMOR" | "DEBUNKED_FALSEHOOD",
  "truth_score": <int 4-98 calibrated according to criteria>,
  "reasoning": "<clear analytical summary explaining why this score was awarded>",
  "debunk_target_distinction": "<clarify whether the claim itself is debunked or a counter-hoax is debunked>",
  "extracted_sub_claims": [
    {{
      "claim_text": "<substantive propositional statement>",
      "category": "VERIFIED_FACT" | "DEBUNKED_FALSEHOOD" | "UNSUBSTANTIATED_CLAIM" | "CONTRADICTORY_VIEWPOINT",
      "confidence": <int 50-98>,
      "reasoning": "<analytical rationale>"
    }}
  ]
}}"""

        raw_output = self.generate(prompt, system_prompt=system_prompt)
        if not raw_output:
            return None

        # Clean JSON markdown fences if present
        clean_json = raw_output.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        elif clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()

        try:
            parsed = json.loads(clean_json)
            if isinstance(parsed, dict) and "truth_score" in parsed:
                # Ensure truth_score is an int within 0-100
                parsed["truth_score"] = max(0, min(100, int(parsed["truth_score"])))
                return parsed
        except Exception as e:
            print(f"[LLMClient] Failed to parse LLM cross-examination JSON: {e}")

        return None
