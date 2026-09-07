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
            gemini_models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
            for gm in gemini_models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{gm}:generateContent?key={gemini_key}"
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
                    elif resp.status_code == 404:
                        continue
                    else:
                        print(f"[LLMClient] Gemini ({gm}) returned HTTP {resp.status_code}: {resp.text[:120]}")
                        break
                except Exception as e:
                    print(f"[LLMClient] Gemini error on {gm}: {e}")

        # 2. Try OpenAI
        openai_key = self.api_keys.get("openai")
        if openai_key:
            openai_models = ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-4o"]
            for om in openai_models:
                try:
                    url = "https://api.openai.com/v1/chat/completions"
                    headers = {
                        "Authorization": f"Bearer {openai_key}",
                        "Content-Type": "application/json"
                    }
                    payload = {
                        "model": om,
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
                    elif resp.status_code == 404:
                        continue
                    else:
                        print(f"[LLMClient] OpenAI ({om}) returned HTTP {resp.status_code}: {resp.text[:120]}")
                        break
                except Exception as e:
                    print(f"[LLMClient] OpenAI error on {om}: {e}")

        # 3. Try Groq (with dynamic model discovery and fallback for deprecated models)
        groq_key = self.api_keys.get("groq")
        if groq_key:
            # If active model hasn't been discovered yet, query Groq's models endpoint
            if not getattr(self, "_groq_model_discovered", False):
                try:
                    m_resp = requests.get(
                        "https://api.groq.com/openai/v1/models",
                        headers={"Authorization": f"Bearer {groq_key}"},
                        timeout=5
                    )
                    if m_resp.status_code == 200:
                        m_data = m_resp.json().get("data", [])
                        active_ids = [m.get("id") for m in m_data if m.get("id") and m.get("active", True)]
                        # Preference order for best available text models on Groq
                        preferred_order = [
                            "llama-3.3-70b-versatile",
                            "llama-3.1-70b-versatile",
                            "llama-3.3-70b-specdec",
                            "llama-3.1-8b-instant",
                            "qwen-2.5-32b",
                            "mixtral-8x7b-32768",
                            "gemma2-9b-it"
                        ]
                        for pref in preferred_order:
                            if pref in active_ids:
                                self._active_groq_model = pref
                                break
                        # Fallback to any non-audio/non-guard model if preferred wasn't matched
                        if not getattr(self, "_active_groq_model", None):
                            for aid in active_ids:
                                if not any(k in aid.lower() for k in ["whisper", "guard", "embed", "vision"]):
                                    self._active_groq_model = aid
                                    break
                except Exception as me:
                    pass
                self._groq_model_discovered = True

            groq_models = [
                "llama-3.1-8b-instant",
                "llama-3.3-70b-versatile",
                "llama-3.3-70b-specdec",
                "llama-3.1-70b-versatile",
                "mixtral-8x7b-32768",
                "gemma2-9b-it"
            ]
            cached = getattr(self, "_active_groq_model", None)
            if cached:
                groq_models = [cached] + [m for m in groq_models if m != cached]

            for g_model in groq_models:
                try:
                    url = "https://api.groq.com/openai/v1/chat/completions"
                    headers = {
                        "Authorization": f"Bearer {groq_key}",
                        "Content-Type": "application/json"
                    }
                    payload = {
                        "model": g_model,
                        "messages": [
                            {"role": "system", "content": system_prompt or "You are an adversarial fact-checker and deep-researcher."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.2
                    }
                    resp = requests.post(url, json=payload, headers=headers, timeout=12)
                    if resp.status_code == 200:
                        data = resp.json()
                        self._active_groq_model = g_model
                        return data["choices"][0]["message"]["content"].strip()
                    
                    err_lower = resp.text.lower()
                    # If model is decommissioned, deprecated, not found, or inaccessible, continue to next candidate
                    if (
                        resp.status_code in [400, 404]
                        or any(k in err_lower for k in ["decommissioned", "model_not_found", "does not exist", "not have access", "deprecated", "retired"])
                    ):
                        continue
                    else:
                        print(f"[LLMClient] Groq ({g_model}) returned HTTP {resp.status_code}: {resp.text[:120]}")
                        break
                except Exception as e:
                    print(f"[LLMClient] Groq error on {g_model}: {e}")

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
