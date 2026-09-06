export interface SourceDoc {
  id: string;
  subquery_id?: string;
  url: string;
  title: string;
  snippet: string;
  domain: string;
  credibility_score: number;
  credibility_tier: "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED";
  bias_indicator: "OFFICIAL" | "ACADEMIC" | "OBJECTIVE" | "MODERATE" | "SENSATIONALIST";
  source_type: string;
  subquery_angle?: string;
}

export interface SubQuery {
  id: string;
  query: string;
  display_label: string;
  angle: "primary" | "adversarial" | "authoritative" | "evidence";
  rationale: string;
  status: "pending" | "searching" | "completed" | "failed";
  results_count: number;
}

export interface AnalyzedClaim {
  id: string;
  claim_text: string;
  category: "VERIFIED_FACT" | "UNSUBSTANTIATED_CLAIM" | "DEBUNKED_FALSEHOOD" | "CONTRADICTORY_VIEWPOINT";
  confidence: number;
  supporting_sources: string[];
  opposing_sources: string[];
  counter_evidence?: string | null;
  reasoning: string;
  fallacies_detected: string[];
}

export interface Contradiction {
  id: string;
  topic: string;
  viewpoint_a: string;
  source_a: string;
  viewpoint_b: string;
  source_b: string;
  divergence_summary: string;
  veritas_resolution: string;
}

export interface Citation {
  id?: string;
  title: string;
  url: string;
  domain: string;
  tier: string;
  score: string;
  snippet?: string;
  subquery_angle?: string;
  target_assertion?: string;
}

export interface PaperEvidenceTraceItem {
  assertion_id: string;
  assertion_text: string;
  status: "CORROBORATED" | "DISPUTED_OR_FALSIFIED" | "PARTIALLY_VERIFIED";
  matched_sources: {
    title: string;
    domain: string;
    url: string;
    tier: string;
    score: string;
    snippet: string;
  }[];
}

export interface MethodologyAudit {
  replication_hazard_score: number;
  methodology_verdict: "HIGH_METHODOLOGICAL_RIGOR" | "MODERATE_REPLICATION_RISK" | "HIGH_P_HACKING_HAZARD";
  summary_label: string;
  sample_size_score: number;
  sample_size_note: string;
  primary_sample_count?: number | null;
  p_hacking_risk: number;
  baseline_score: number;
  coi_score: number;
  coi_note: string;
  red_flags: string[];
  strengths: string[];
  has_ablation: boolean;
  has_ci: boolean;
}

export interface InterrogationMessage {
  id: string;
  speaker: string;
  role: 'inquisitor' | 'advocate' | 'user';
  text: string;
  timestamp: string;
}

export interface ResearchPaperAnalysis {
  filename: string;
  title: string;
  page_count: number;
  word_count: number;
  abstract_summary: string;
  key_assertions: string[];
  evidence_trace?: PaperEvidenceTraceItem[];
  methodology_audit?: MethodologyAudit;
  empirical_status: string;
}

export interface DebateRound {
  round_number: number;
  title: string;
  advocate_argument?: string;
  inquisitor_argument?: string;
  arbiter_ruling?: string;
  evidence_focus: string;
  momentum_score: number;
}

export interface DebateArenaData {
  title: string;
  advocate_name: string;
  inquisitor_name: string;
  arbiter_name: string;
  verdict_score: number;
  verdict_label: string;
  rounds: DebateRound[];
}

export interface RadarVector {
  name: string;
  score: number;
  fullMark: number;
}

export interface CognitiveFallacy {
  name: string;
  severity: "BENIGN" | "LOW" | "MEDIUM" | "HIGH";
  description: string;
}

export interface BiasTelemetry {
  axes: RadarVector[];
  overall_integrity_index: number;
  detected_fallacies: CognitiveFallacy[];
}

export interface CitationIntegrity {
  hallucination_safety_score: number;
  audit_verdict: "VERIFIED_AUTHENTIC" | "MIXED_ACCURACY" | "HIGH_HALLUCINATION_RISK";
  total_citations_audited: number;
  peer_reviewed_or_institutional: number;
  secondary_corroborated: number;
  unverified_or_anecdotal: number;
  has_primary_doi_or_pdf: boolean;
  integrity_notes: string;
}

export interface VerificationCertificate {
  certificate_id: string;
  sha256_hash: string;
  issuer: string;
  issued_at: string;
  investigation_subject: string;
  verdict: string;
  truth_score: number;
  chief_arbiter_seal: string;
  document_audited: string;
  tamper_status: string;
}

export interface DossierReport {
  query: string;
  verdict: string;
  verdict_desc: string;
  truth_score: number;
  executive_summary: string;
  audio_briefing_script?: string;
  paper_analysis?: ResearchPaperAnalysis;
  debate_arena?: DebateArenaData;
  bias_telemetry?: BiasTelemetry;
  citation_integrity?: CitationIntegrity;
  verification_certificate?: VerificationCertificate;
  key_findings: string[];
  claims_breakdown: AnalyzedClaim[];
  contradictions: Contradiction[];
  sources: SourceDoc[];
  citations: Citation[];
  markdown_report: string;
  investigation_depth: string;
  generated_at: string;
}

export interface ResearchUploadedFile {
  id?: string;
  filename: string;
  title?: string;
  authors?: string;
  venue?: string;
  badge?: string;
  page_count: number;
  word_count: number;
  abstract_summary?: string;
  key_assertions?: string[];
  preview: string;
  full_text: string;
  suggested_query: string;
  methodology_audit?: MethodologyAudit;
}

export interface AgentLog {
  id: string;
  agent: string;
  level: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
  message: string;
  timestamp: string;
}

export interface ResearchPreset {
  id: string;
  category: string;
  title: string;
  query: string;
  badge: string;
  description: string;
}

export interface ApiKeys {
  gemini?: string;
  openai?: string;
  tavily?: string;
  groq?: string;
}

export interface ClashPaperProfile {
  title: string;
  authors: string;
  venue: string;
  empiricalScore: number;
  sampleSize: string;
  coreHypothesis: string;
  reproducibility: string;
  keyPros: string[];
  rawPaperId?: string;
  fullText?: string;
}

export interface PaperClashItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  paperA: ClashPaperProfile;
  paperB: ClashPaperProfile;
  arbiterVerdict: {
    winner: 'Paper A' | 'Paper B' | 'EQUALLY_CONTESTED';
    verdictLabel: string;
    consensusSummary: string;
    recommendedTargetQuery: string;
  };
}

export interface SwarmTuningConfig {
  skepticismLevel: number;
  credibilityFloor: number;
  parallelVectors: number;
}
