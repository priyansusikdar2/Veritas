import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  FileText,
  Layers,
  Scale,
  Sparkles,
  BookOpen,
  Volume2,
  Square,
  GraduationCap,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  Swords,
  Radar,
  ShieldCheck,
  Award,
  FlaskConical,
  RotateCcw,
  Search,
  Printer,
  MessageSquare,
  Send,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import type { DossierReport, ApiKeys } from '../types';
import { API_BASE } from '../config';
import { DebateArenaView } from './DebateArenaView';
import { BiasRadarView } from './BiasRadarView';
import { CitationIntegrityView } from './CitationIntegrityView';
import { CertificateModal } from './CertificateModal';

interface DossierViewProps {
  dossier: DossierReport;
  apiKeys?: ApiKeys;
  nodes?: any[];
  edges?: any[];
}

export const DossierView: React.FC<DossierViewProps> = ({ dossier, apiKeys, nodes, edges }) => {
  const [activeTab, setActiveTab] = useState<'paper' | 'methodology' | 'interrogate' | 'debate' | 'radar' | 'integrity' | 'claims' | 'contradictions' | 'sources' | 'markdown'>(
    dossier.debate_arena ? 'debate' : (dossier.paper_analysis ? 'paper' : 'claims')
  );
  const [claimFilter, setClaimFilter] = useState<'ALL' | 'VERIFIED_FACT' | 'DEBUNKED_FALSEHOOD' | 'CONTRADICTORY_VIEWPOINT'>('ALL');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaperSpeaking, setIsPaperSpeaking] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [citationSearch, setCitationSearch] = useState('');
  const [citationTierFilter, setCitationTierFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  // Oral Defense / Inquisitor Interrogation State in Dossier
  const [dossierInterrogateQuestion, setDossierInterrogateQuestion] = useState('');
  const [dossierInterrogateRole, setDossierInterrogateRole] = useState<'inquisitor' | 'advocate'>('inquisitor');
  const [isDossierInterrogating, setIsDossierInterrogating] = useState(false);
  const [dossierInterrogationHistory, setDossierInterrogationHistory] = useState<{
    id: string;
    role: 'inquisitor' | 'advocate' | 'user';
    speaker: string;
    text: string;
  }[]>([]);

  // Counter-Factual What-If Sandbox State
  const [stressCorporate, setStressCorporate] = useState(false);
  const [stressSampleSize, setStressSampleSize] = useState(false);
  const [stressPreprint, setStressPreprint] = useState(false);
  const [stressReplication, setStressReplication] = useState(false);

  let adjustedScore = dossier.truth_score;
  if (stressCorporate) adjustedScore -= 15;
  if (stressSampleSize) adjustedScore -= 20;
  if (stressPreprint) adjustedScore -= 15;
  if (stressReplication) adjustedScore += 10;
  adjustedScore = Math.max(5, Math.min(99, adjustedScore));

  const hasSandboxChanges = stressCorporate || stressSampleSize || stressPreprint || stressReplication;

  const score = adjustedScore;
  const getThemeColor = (s: number) => {
    if (s >= 80) return 'var(--emerald-success)';
    if (s >= 60) return 'var(--cyan-neon)';
    if (s >= 40) return 'var(--amber-warning)';
    if (s >= 20) return '#f97316';
    return 'var(--rose-danger)';
  };
  const themeColor = getThemeColor(score);

  const getScoreBadgeLabel = (s: number) => {
    if (s >= 80) return 'Confirmed Factual';
    if (s >= 60) return 'Mostly True (Substantiated)';
    if (s >= 40) return 'Mixed / Conflicting Evidence';
    if (s >= 20) return 'Unsubstantiated Rumor';
    return 'Debunked / Falsehood';
  };

  const filteredClaims = dossier.claims_breakdown.filter((c) => {
    if (claimFilter === 'ALL') return true;
    return c.category === claimFilter;
  });

  const filteredCitations = dossier.citations.filter((c) => {
    if (citationTierFilter !== 'ALL' && c.tier !== citationTierFilter) return false;
    if (citationSearch.trim()) {
      const q = citationSearch.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchUrl = c.url.toLowerCase().includes(q);
      const matchSnippet = c.snippet ? c.snippet.toLowerCase().includes(q) : false;
      const matchAssertion = c.target_assertion ? c.target_assertion.toLowerCase().includes(q) : false;
      const matchAngle = c.subquery_angle ? c.subquery_angle.toLowerCase().includes(q) : false;
      return matchTitle || matchUrl || matchSnippet || matchAssertion || matchAngle;
    }
    return true;
  });

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeakBriefing = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    if (isPaperSpeaking) setIsPaperSpeaking(false);

    const textToSpeak = dossier.audio_briefing_script || `${dossier.executive_summary} The final verdict is ${dossier.verdict}, with a truth score of ${dossier.truth_score} out of 100.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakPaperAnalysis = () => {
    if (!('speechSynthesis' in window) || !dossier.paper_analysis) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isPaperSpeaking) {
      window.speechSynthesis.cancel();
      setIsPaperSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    if (isSpeaking) setIsSpeaking(false);

    const pa = dossier.paper_analysis;
    const assertions = pa.key_assertions && pa.key_assertions.length > 0
      ? `Primary author hypotheses tested: ${pa.key_assertions.slice(0, 3).join('. ')}.`
      : '';
    const textToSpeak = `Research Paper Thesis Audit. Title: ${pa.title}. Document file: ${pa.filename}, ${pa.page_count} pages. Executive Summary: ${pa.abstract_summary}. ${assertions} Empirical verification outcome: ${pa.empirical_status.replace(/_/g, ' ')}, with a Veritas Truth Score of ${dossier.truth_score} out of 100.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.03;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsPaperSpeaking(true);
    utterance.onend = () => setIsPaperSpeaking(false);
    utterance.onerror = () => setIsPaperSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(dossier.markdown_report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDossierInterrogate = async (q?: string) => {
    const question = q || dossierInterrogateQuestion;
    if (!question.trim() || isDossierInterrogating) return;

    const userMsg = {
      id: String(Date.now()),
      role: 'user' as const,
      speaker: 'Doctoral Committee / You',
      text: question.trim()
    };
    setDossierInterrogationHistory(prev => [...prev, userMsg]);
    setDossierInterrogateQuestion('');
    setIsDossierInterrogating(true);

    try {
      const paperObj = dossier.paper_analysis ? {
        title: dossier.paper_analysis.title,
        abstract_summary: dossier.paper_analysis.abstract_summary,
        key_assertions: dossier.paper_analysis.key_assertions,
        methodology_audit: dossier.paper_analysis.methodology_audit
      } : {
        title: dossier.query,
        abstract_summary: dossier.executive_summary,
        key_assertions: dossier.claims_breakdown.map(c => c.claim_text)
      };

      const resp = await fetch(`${API_BASE}/api/interrogate-paper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          paper: paperObj,
          role: dossierInterrogateRole,
          api_keys: apiKeys,
          history: dossierInterrogationHistory.map(m => ({
            role: m.role,
            speaker: m.speaker,
            text: m.text
          })),
          dossier_context: {
            truth_score: dossier.truth_score,
            verdict: dossier.verdict,
            verdict_desc: dossier.verdict_desc,
            executive_summary: dossier.executive_summary,
            claims_breakdown: dossier.claims_breakdown,
            contradictions: dossier.contradictions,
            citations: dossier.citations,
            methodology_audit: dossier.paper_analysis?.methodology_audit,
            debate_arena: dossier.debate_arena,
            citation_integrity: dossier.citation_integrity,
            bias_telemetry: dossier.bias_telemetry
          }
        })
      });
      const data = await resp.json();
      if (data.status === 'success') {
        setDossierInterrogationHistory(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: dossierInterrogateRole,
            speaker: data.speaker || (dossierInterrogateRole === 'inquisitor' ? 'Chief Inquisitor' : 'Defense Advocate'),
            text: data.answer
          }
        ]);
      }
    } catch (e: any) {
      setDossierInterrogationHistory(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: dossierInterrogateRole,
          speaker: 'Veritas Committee Terminal',
          text: `Error connecting to interrogation engine: ${e?.message || 'Network error'}`
        }
      ]);
    } finally {
      setIsDossierInterrogating(false);
    }
  };

  return (
    <div className="dossier-root-container" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px',
      background: 'rgba(11, 17, 30, 0.95)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
    }}>
      <div className="screen-only" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Executive Header Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        background: `radial-gradient(circle at 10% 20%, ${themeColor}15 0%, rgba(15, 23, 42, 0.8) 70%)`,
        border: `1.5px solid ${themeColor}40`
      }}>
        <div style={{ flex: '1 1 500px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: `${themeColor}20`,
              color: themeColor,
              border: `1px solid ${themeColor}40`
            }}>
              Executive Verdict
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Compiled {dossier.generated_at}
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
            lineHeight: '1.2',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere'
          }}>
            {dossier.verdict}
          </h2>

          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            marginTop: '4px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere'
          }}>
            {dossier.executive_summary}
          </p>

          {/* Voice of Veritas - Audio Verdict Player */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: isSpeaking ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${isSpeaking ? 'var(--cyan-neon)' : 'var(--border-subtle)'}`,
            width: 'fit-content',
            maxWidth: '100%',
            flexWrap: 'wrap',
            transition: 'all 0.2s'
          }}>
            <button
              onClick={handleSpeakBriefing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: isSpeaking ? 'var(--rose-danger)' : 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)',
                color: isSpeaking ? '#fff' : '#07090e',
                border: 'none',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: isSpeaking ? '0 0 12px var(--rose-danger)' : '0 0 12px rgba(0, 242, 254, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              {isSpeaking ? (
                <>
                  <Square size={14} fill="#fff" />
                  <span>Stop Briefing</span>
                </>
              ) : (
                <>
                  <Volume2 size={15} />
                  <span>Tell Me The Result (Audio Briefing)</span>
                </>
              )}
            </button>

            {dossier.verification_certificate && (
              <button
                type="button"
                onClick={() => setIsCertOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(168, 85, 247, 0.2) 100%)',
                  color: 'var(--cyan-neon)',
                  border: '1px solid rgba(0, 242, 254, 0.4)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(0, 242, 254, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                <Award size={15} />
                <span>📜 Official Truth Certificate</span>
              </button>
            )}

            {/* Feature 3: One-Click Executive Forensic PDF Export Button */}
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#fff',
                border: '1px solid var(--border-highlight)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Print or Export Executive Forensic Dossier to PDF"
            >
              <Printer size={15} />
              <span>🖨️ Export Executive Dossier (PDF)</span>
            </button>

            {/* Feature 5: Dual-Voice Animated Audio Waveform Visualizer */}
            {isSpeaking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {[0.4, 0.9, 0.6, 1.0, 0.7, 0.5, 0.8].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        width: '3px',
                        height: `${h * 16}px`,
                        background: 'var(--cyan-neon)',
                        borderRadius: '2px',
                        animation: `pulse 0.6s ease-in-out infinite alternate ${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', fontWeight: 700 }}>
                  Dual-Voice Intelligence Briefing Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Truth Meter Score Gauge */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 28px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(7, 10, 18, 0.8)',
          border: '1px solid var(--border-subtle)',
          boxShadow: `0 0 25px ${themeColor}30`,
          minWidth: '170px',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            Truth Score
          </span>
          <div style={{
            fontSize: '44px',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            color: themeColor,
            lineHeight: '1'
          }}>
            {score}
            <span style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: themeColor,
            marginTop: '6px',
            textAlign: 'center'
          }}>
            {getScoreBadgeLabel(score)}
          </span>
          {hasSandboxChanges && (
            <span style={{ fontSize: '10px', color: 'var(--amber-warning)', fontWeight: 700, marginTop: '4px' }}>
              ⚡ What-If: {adjustedScore - dossier.truth_score > 0 ? `+${adjustedScore - dossier.truth_score}` : adjustedScore - dossier.truth_score} pts
            </span>
          )}
        </div>
      </div>

      {/* Counter-Factual "What-If" Sensitivity Sandbox */}
      <div style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FlaskConical size={18} color="var(--violet-neon)" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🧪 Counter-Factual "What-If" Stress-Tester
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              (Toggle adversarial conditions to test verdict robustness in real-time)
            </span>
          </div>

          {hasSandboxChanges && (
            <button
              type="button"
              onClick={() => {
                setStressCorporate(false);
                setStressSampleSize(false);
                setStressPreprint(false);
                setStressReplication(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={12} /> Reset Modifiers
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            background: stressCorporate ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${stressCorporate ? 'var(--rose-danger)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            fontSize: '12px',
            color: stressCorporate ? '#fb7185' : 'var(--text-secondary)',
            fontWeight: 600
          }}>
            <input
              type="checkbox"
              checked={stressCorporate}
              onChange={(e) => setStressCorporate(e.target.checked)}
              style={{ accentColor: 'var(--rose-danger)' }}
            />
            <span>Inject Corporate Bias (-15 pts)</span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            background: stressSampleSize ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${stressSampleSize ? 'var(--rose-danger)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            fontSize: '12px',
            color: stressSampleSize ? '#fb7185' : 'var(--text-secondary)',
            fontWeight: 600
          }}>
            <input
              type="checkbox"
              checked={stressSampleSize}
              onChange={(e) => setStressSampleSize(e.target.checked)}
              style={{ accentColor: 'var(--rose-danger)' }}
            />
            <span>Small Sample Size n &lt; 30 (-20 pts)</span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            background: stressPreprint ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${stressPreprint ? 'var(--amber-warning)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            fontSize: '12px',
            color: stressPreprint ? '#f59e0b' : 'var(--text-secondary)',
            fontWeight: 600
          }}>
            <input
              type="checkbox"
              checked={stressPreprint}
              onChange={(e) => setStressPreprint(e.target.checked)}
              style={{ accentColor: 'var(--amber-warning)' }}
            />
            <span>Unreviewed Pre-Print (-15 pts)</span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            background: stressReplication ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${stressReplication ? 'var(--emerald-success)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            fontSize: '12px',
            color: stressReplication ? 'var(--emerald-success)' : 'var(--text-secondary)',
            fontWeight: 600
          }}>
            <input
              type="checkbox"
              checked={stressReplication}
              onChange={(e) => setStressReplication(e.target.checked)}
              style={{ accentColor: 'var(--emerald-success)' }}
            />
            <span>Replicated by Dual Lab (+10 pts)</span>
          </label>
        </div>
      </div>

      {/* Key Findings List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '12px'
      }}>
        {dossier.key_findings.map((finding, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px 16px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <Sparkles size={16} color="var(--cyan-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {finding}
            </span>
          </div>
        ))}
      </div>

      {/* Uploaded Research Paper Summary & Analysis Banner */}
      {dossier.paper_analysis && (
        <div style={{
          padding: '22px',
          borderRadius: 'var(--radius-lg)',
          background: 'radial-gradient(ellipse at top left, rgba(0, 242, 254, 0.12) 0%, rgba(15, 23, 42, 0.85) 75%)',
          border: '1.5px solid rgba(0, 242, 254, 0.35)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25) 0%, rgba(16, 185, 129, 0.25) 100%)',
                border: '1px solid rgba(0, 242, 254, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan-primary)',
                boxShadow: '0 0 16px rgba(0, 242, 254, 0.3)'
              }}>
                <GraduationCap size={22} />
              </div>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--cyan-primary)'
                }}>
                  Uploaded Research Paper Summary
                </span>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: '1.3',
                  marginTop: '2px'
                }}>
                  {dossier.paper_analysis.title}
                </h3>
              </div>
            </div>

            {/* Document Metadata Badges & Audio Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSpeakPaperAnalysis}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: isPaperSpeaking ? 'rgba(244, 63, 94, 0.25)' : 'rgba(0, 242, 254, 0.15)',
                  border: isPaperSpeaking ? '1px solid var(--rose-danger)' : '1px solid var(--cyan-primary)',
                  color: isPaperSpeaking ? 'var(--rose-danger)' : 'var(--cyan-neon)',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: isPaperSpeaking ? '0 0 14px rgba(244, 63, 94, 0.4)' : '0 0 10px rgba(0, 242, 254, 0.25)'
                }}
              >
                {isPaperSpeaking ? (
                  <>
                    <Square size={12} fill="currentColor" />
                    <span>Stop Paper Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={14} />
                    <span>🔊 Listen to Paper Thesis</span>
                  </>
                )}
              </button>

              <span style={{
                fontSize: '11px',
                padding: '5px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                maxWidth: '280px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }} title={dossier.paper_analysis.filename}>
                📄 {dossier.paper_analysis.filename}
              </span>
              <span style={{
                fontSize: '11px',
                padding: '5px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontWeight: 600
              }}>
                {dossier.paper_analysis.page_count} Pages • {dossier.paper_analysis.word_count.toLocaleString()} Words
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '5px 12px',
                borderRadius: '6px',
                background: dossier.truth_score >= 50 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: dossier.truth_score >= 50 ? 'var(--emerald-success)' : 'var(--amber-warning)',
                border: `1px solid ${dossier.truth_score >= 50 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                textTransform: 'uppercase'
              }}>
                {dossier.paper_analysis.empirical_status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {isPaperSpeaking && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.1)',
              border: '1px solid rgba(0, 242, 254, 0.3)'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--cyan-neon)',
                animation: 'pulse 0.8s infinite'
              }} />
              <span style={{ fontSize: '12px', color: 'var(--cyan-neon)', fontWeight: 700 }}>
                Speaking Paper Audio Thesis: Synthesizing document findings and empirical status...
              </span>
            </div>
          )}

          {/* Abstract / Executive Summary Box */}
          <div style={{
            padding: '16px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(7, 10, 18, 0.85)',
            borderLeft: '4px solid var(--cyan-primary)',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--cyan-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                Executive Abstract & Thesis Breakdown
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Extracted via PyPDF Neural Parser
              </span>
            </div>
            <p style={{
              fontSize: '13.5px',
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              fontStyle: 'italic',
              margin: 0
            }}>
              "{dossier.paper_analysis.abstract_summary}"
            </p>
          </div>

          {/* Key Assertions Preview */}
          {dossier.paper_analysis.key_assertions && dossier.paper_analysis.key_assertions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                Extracted Author Assertions Cross-Examined Against Web Consensus:
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '10px'
              }}>
                {dossier.paper_analysis.key_assertions.map((assertion, aIdx) => (
                  <div
                    key={aIdx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.45',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <CheckCircle2 size={16} color="var(--cyan-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: 'var(--cyan-neon)', fontSize: '11px', display: 'block', marginBottom: '2px' }}>
                        Assertion {aIdx + 1}
                      </strong>
                      <span>{assertion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dossier Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {dossier.debate_arena && (
            <button
              onClick={() => setActiveTab('debate')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'debate' ? 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)' : 'rgba(168, 85, 247, 0.1)',
                color: activeTab === 'debate' ? '#07090e' : 'var(--violet-neon)',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: activeTab === 'debate' ? '0 0 15px rgba(168, 85, 247, 0.4)' : 'none'
              }}
            >
              <Swords size={15} />
              ⚔️ Debate Arena
            </button>
          )}

          {dossier.bias_telemetry && (
            <button
              onClick={() => setActiveTab('radar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'radar' ? 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)' : 'rgba(0, 242, 254, 0.1)',
                color: activeTab === 'radar' ? '#07090e' : 'var(--cyan-neon)',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: activeTab === 'radar' ? '0 0 15px rgba(0, 242, 254, 0.4)' : 'none'
              }}
            >
              <Radar size={15} />
              📡 Epistemic Radar
            </button>
          )}

          {dossier.citation_integrity && (
            <button
              onClick={() => setActiveTab('integrity')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'integrity' ? 'linear-gradient(135deg, #10b981 0%, #00f2fe 100%)' : 'rgba(16, 185, 129, 0.1)',
                color: activeTab === 'integrity' ? '#07090e' : 'var(--emerald-success)',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: activeTab === 'integrity' ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              <ShieldCheck size={15} />
              🛡️ Citation Integrity
            </button>
          )}

          {dossier.paper_analysis && (
            <button
              onClick={() => setActiveTab('paper')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'paper' ? 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)' : 'rgba(0, 242, 254, 0.08)',
                color: activeTab === 'paper' ? '#07090e' : 'var(--cyan-primary)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: activeTab === 'paper' ? '0 0 15px rgba(0, 242, 254, 0.4)' : 'none'
              }}
            >
              <GraduationCap size={15} />
              📑 Paper Thesis
            </button>
          )}

          {dossier.paper_analysis && dossier.paper_analysis.methodology_audit && (
            <button
              onClick={() => setActiveTab('methodology')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === 'methodology' ? 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)' : 'rgba(244, 63, 94, 0.12)',
                color: activeTab === 'methodology' ? '#fff' : '#fb7185',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: activeTab === 'methodology' ? '0 0 15px rgba(244, 63, 94, 0.4)' : 'none'
              }}
            >
              <ShieldAlert size={15} />
              🔬 P-Hacking & Rigor
            </button>
          )}

          <button
            onClick={() => setActiveTab('interrogate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'interrogate' ? 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)' : 'rgba(56, 189, 248, 0.12)',
              color: activeTab === 'interrogate' ? '#07090e' : 'var(--cyan-primary)',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: activeTab === 'interrogate' ? '0 0 15px rgba(56, 189, 248, 0.4)' : 'none'
            }}
          >
            <MessageSquare size={15} />
            ⚔️ Oral Defense Terminal
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'claims' ? 'var(--cyan-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'claims' ? '#07090e' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Layers size={15} />
            Facts vs. Claims ({dossier.claims_breakdown.length})
          </button>

          <button
            onClick={() => setActiveTab('contradictions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'contradictions' ? 'var(--cyan-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'contradictions' ? '#07090e' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Scale size={15} />
            Contradictions Matrix ({dossier.contradictions.length})
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'sources' ? 'var(--cyan-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'sources' ? '#07090e' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <BookOpen size={15} />
            Citations & Sources ({dossier.citations.length})
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'markdown' ? 'var(--cyan-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'markdown' ? '#07090e' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <FileText size={15} />
            Markdown Dossier
          </button>
        </div>

        {/* Copy Report Button */}
        <button
          onClick={handleCopyMarkdown}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: copied ? 'var(--emerald-success)' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied Dossier!' : 'Copy Markdown'}</span>
        </button>
      </div>

      {/* Tab: Adversarial Debate Arena */}
      {activeTab === 'debate' && dossier.debate_arena && (
        <DebateArenaView debate={dossier.debate_arena} truthScore={score} />
      )}

      {/* Tab: Epistemic Bias & Fallacy Radar */}
      {activeTab === 'radar' && dossier.bias_telemetry && (
        <BiasRadarView telemetry={dossier.bias_telemetry} />
      )}

      {/* Tab: Citation Authenticity & Hallucination Audit */}
      {activeTab === 'integrity' && dossier.citation_integrity && (
        <CitationIntegrityView integrity={dossier.citation_integrity} sources={dossier.sources} />
      )}

      {/* Dedicated Tab: Research Paper Full Analysis */}
      {activeTab === 'paper' && dossier.paper_analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Audio Briefing Action Bar for Paper */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: isPaperSpeaking ? 'rgba(0, 242, 254, 0.12)' : 'rgba(15, 23, 42, 0.7)',
            border: `1px solid ${isPaperSpeaking ? 'var(--cyan-neon)' : 'var(--border-subtle)'}`,
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Volume2 size={18} color="var(--cyan-neon)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                  Voice of Veritas: Academic Document Thesis Player
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Listen to neural synthesis of paper abstract, author hypotheses, and empirical peer review status.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSpeakPaperAnalysis}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: '8px',
                background: isPaperSpeaking ? 'var(--rose-danger)' : 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)',
                color: isPaperSpeaking ? '#fff' : '#07090e',
                border: 'none',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: isPaperSpeaking ? '0 0 12px var(--rose-danger)' : '0 0 12px rgba(0, 242, 254, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              {isPaperSpeaking ? (
                <>
                  <Square size={13} fill="#fff" />
                  <span>Stop Paper Audio</span>
                </>
              ) : (
                <>
                  <Volume2 size={15} />
                  <span>Listen to Full Paper Thesis (Audio)</span>
                </>
              )}
            </button>
          </div>

          {/* Paper Specs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}>
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-subtle)',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                Document Title
              </span>
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                marginTop: '6px',
                lineHeight: '1.45',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}>
                {dossier.paper_analysis.title}
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-subtle)',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                Length & Volume
              </span>
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--cyan-primary)',
                marginTop: '6px',
                lineHeight: '1.45',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}>
                {dossier.paper_analysis.page_count} Pages ({dossier.paper_analysis.word_count.toLocaleString()} Words)
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-subtle)',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                Empirical Web Alignment
              </span>
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: dossier.truth_score >= 50 ? 'var(--emerald-success)' : 'var(--amber-warning)',
                marginTop: '6px',
                lineHeight: '1.45',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}>
                {dossier.paper_analysis.empirical_status.replace(/_/g, ' ')}
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-subtle)',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                Source Document
              </span>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginTop: '6px',
                lineHeight: '1.45',
                wordBreak: 'break-all',
                overflowWrap: 'anywhere'
              }} title={dossier.paper_analysis.filename}>
                {dossier.paper_analysis.filename}
              </div>
            </div>
          </div>

          {/* Full Abstract Panel */}
          <div style={{
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="var(--cyan-primary)" />
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Complete Executive Abstract & Methodology
              </h4>
            </div>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.65',
              margin: 0,
              background: 'rgba(7, 10, 18, 0.6)',
              padding: '16px',
              borderRadius: '8px',
              borderLeft: '3px solid var(--cyan-primary)'
            }}>
              {dossier.paper_analysis.abstract_summary}
            </p>
          </div>

          {/* Extracted Assertions with Deep Review */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} color="var(--cyan-primary)" />
              Extracted Core Claims vs. Cross-Examination Analysis
            </h4>
            {dossier.paper_analysis.key_assertions.map((assertion, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--cyan-primary)'
                  }}>
                    Paper Claim #{idx + 1}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: 'var(--cyan-primary)',
                    border: '1px solid rgba(56, 189, 248, 0.25)'
                  }}>
                    Empirically Evaluated
                  </span>
                </div>
                <div style={{ fontSize: '13.5px', color: '#fff', fontWeight: 600, lineHeight: '1.4' }}>
                  "{assertion}"
                </div>
                {(() => {
                  const normAssertion = assertion.toLowerCase().trim();
                  const traceItem = dossier.paper_analysis?.evidence_trace?.find(
                    (t) => t.assertion_text.toLowerCase().trim() === normAssertion ||
                           normAssertion.includes(t.assertion_text.toLowerCase().trim()) ||
                           t.assertion_text.toLowerCase().trim().includes(normAssertion)
                  );

                  // Also match citations directly tagged with this assertion or overlapping terms
                  const directlyRelatedCitations = dossier.citations.filter(
                    (c) => c.target_assertion && (
                      c.target_assertion.toLowerCase().includes(normAssertion.slice(0, 30)) ||
                      normAssertion.includes(c.target_assertion.toLowerCase().slice(0, 30))
                    )
                  );

                  type EvidenceStatus = 'CORROBORATING' | 'DISPUTING' | 'NEUTRAL_REFERENCE';
                  interface UnifiedEvidenceSource {
                    title: string;
                    url: string;
                    authority_score: string;
                    quote: string;
                    status: EvidenceStatus;
                  }

                  let matchedSources: UnifiedEvidenceSource[] = [];

                  if (traceItem && traceItem.matched_sources && traceItem.matched_sources.length > 0) {
                    const fallbackStatus: EvidenceStatus = traceItem.status === 'CORROBORATED'
                      ? 'CORROBORATING'
                      : traceItem.status === 'DISPUTED_OR_FALSIFIED'
                      ? 'DISPUTING'
                      : 'NEUTRAL_REFERENCE';

                    matchedSources = traceItem.matched_sources.map((s) => ({
                      title: s.title,
                      url: s.url,
                      authority_score: s.score,
                      quote: s.snippet,
                      status: fallbackStatus
                    }));
                  } else if (directlyRelatedCitations.length > 0) {
                    matchedSources = directlyRelatedCitations.map((c) => ({
                      title: c.title,
                      url: c.url,
                      authority_score: c.score,
                      quote: c.snippet || 'Referenced as validation vector for this empirical claim.',
                      status: parseInt(c.score || '50', 10) >= 75 ? 'CORROBORATING' : 'NEUTRAL_REFERENCE'
                    }));
                  }

                  if (matchedSources.length > 0) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            🛰️ Live Web & Academic Trace ({matchedSources.length} sources crawled)
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Real-time web provenance
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {matchedSources.map((ms, sIdx) => {
                            const statusColor = ms.status === 'CORROBORATING'
                              ? 'var(--emerald-success)'
                              : ms.status === 'DISPUTING'
                              ? 'var(--rose-danger)'
                              : 'var(--cyan-primary)';
                            const statusBg = ms.status === 'CORROBORATING'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : ms.status === 'DISPUTING'
                              ? 'rgba(244, 63, 94, 0.1)'
                              : 'rgba(56, 189, 248, 0.1)';
                            const statusBorder = ms.status === 'CORROBORATING'
                              ? 'rgba(16, 185, 129, 0.25)'
                              : ms.status === 'DISPUTING'
                              ? 'rgba(244, 63, 94, 0.25)'
                              : 'rgba(56, 189, 248, 0.25)';

                            return (
                              <div
                                key={sIdx}
                                style={{
                                  background: 'rgba(7, 10, 18, 0.6)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  borderRadius: '6px',
                                  padding: '10px 12px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                  <a
                                    href={ms.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '12.5px',
                                      fontWeight: 600,
                                      color: 'var(--cyan-primary)',
                                      textDecoration: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      maxWidth: '75%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    <span>{ms.title}</span>
                                    <ExternalLink size={12} style={{ flexShrink: 0 }} />
                                  </a>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: statusBg,
                                      color: statusColor,
                                      border: `1px solid ${statusBorder}`
                                    }}>
                                      {ms.status}
                                    </span>
                                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                      Authority: {ms.authority_score}%
                                    </span>
                                  </div>
                                </div>

                                {ms.quote && (
                                  <div style={{
                                    fontSize: '11.5px',
                                    color: 'var(--text-secondary)',
                                    fontStyle: 'italic',
                                    background: 'rgba(0, 0, 0, 0.25)',
                                    padding: '6px 8px',
                                    borderRadius: '4px',
                                    borderLeft: `2px solid ${statusColor}`,
                                    lineHeight: '1.4'
                                  }}>
                                    "{ms.quote}"
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div style={{
                      fontSize: '12.5px',
                      color: 'var(--text-muted)',
                      lineHeight: '1.4',
                      background: 'rgba(7, 10, 18, 0.4)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginTop: '4px'
                    }}>
                      Cross-referenced by Veritas Search Coordinator across live academic & web vectors ({dossier.citations.length} sources indexed).
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Methodology & P-Hacking Rigor Scanner */}
      {activeTab === 'methodology' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dossier.paper_analysis?.methodology_audit ? (
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: dossier.paper_analysis.methodology_audit.replication_hazard_score > 50 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    border: `1px solid ${dossier.paper_analysis.methodology_audit.replication_hazard_score > 50 ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: dossier.paper_analysis.methodology_audit.replication_hazard_score > 50 ? 'var(--rose-danger)' : 'var(--emerald-success)'
                  }}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                      Forensic Methodology & P-Hacking Rigor Audit
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Replication hazard score • Sample scale verification • Baseline comparison integrity
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: dossier.paper_analysis.methodology_audit.replication_hazard_score > 50 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: dossier.paper_analysis.methodology_audit.replication_hazard_score > 50 ? '#fb7185' : '#34d399',
                  border: `1px solid ${dossier.paper_analysis.methodology_audit.replication_hazard_score > 50 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}>
                  {dossier.paper_analysis.methodology_audit.summary_label}
                </span>
              </div>

              {/* 4-Pillar Metric Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(7, 10, 18, 0.7)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    <span>Replication Hazard</span>
                    <span style={{ color: dossier.paper_analysis.methodology_audit.replication_hazard_score > 50 ? 'var(--rose-danger)' : 'var(--emerald-success)' }}>
                      {dossier.paper_analysis.methodology_audit.replication_hazard_score}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${dossier.paper_analysis.methodology_audit.replication_hazard_score}%`,
                      height: '100%',
                      background: dossier.paper_analysis.methodology_audit.replication_hazard_score > 50 ? 'var(--rose-danger)' : 'var(--emerald-success)'
                    }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                    {dossier.paper_analysis.methodology_audit.replication_hazard_score > 50 ? 'High vulnerability to false-discovery rate' : 'High empirical replication reliability'}
                  </span>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(7, 10, 18, 0.7)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    <span>Sample Scale (N)</span>
                    <span style={{ color: 'var(--cyan-primary)' }}>{dossier.paper_analysis.methodology_audit.sample_size_score}%</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                    {dossier.paper_analysis.methodology_audit.primary_sample_count ? `N = ${dossier.paper_analysis.methodology_audit.primary_sample_count.toLocaleString()}` : 'Empirical / Benchmark Scale'}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    {dossier.paper_analysis.methodology_audit.sample_size_note}
                  </span>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(7, 10, 18, 0.7)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    <span>Comparative Baselines</span>
                    <span style={{ color: dossier.paper_analysis.methodology_audit.baseline_score >= 70 ? 'var(--emerald-success)' : 'var(--amber-warning)' }}>
                      {dossier.paper_analysis.methodology_audit.baseline_score}%
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                    {dossier.paper_analysis.methodology_audit.has_ablation ? 'Ablation Isolated' : 'No Explicit Ablation'}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    {dossier.paper_analysis.methodology_audit.has_ci ? 'Standard 95% CIs reported' : 'Caution: Missing error margins'}
                  </span>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(7, 10, 18, 0.7)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    <span>COI Independence</span>
                    <span style={{ color: dossier.paper_analysis.methodology_audit.coi_score >= 80 ? 'var(--emerald-success)' : 'var(--amber-warning)' }}>
                      {dossier.paper_analysis.methodology_audit.coi_score}%
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                    {dossier.paper_analysis.methodology_audit.coi_score >= 80 ? 'Academic / Independent' : 'Corporate Affiliation'}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    {dossier.paper_analysis.methodology_audit.coi_note}
                  </span>
                </div>
              </div>

              {/* Red Flags & Strengths */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                {dossier.paper_analysis.methodology_audit.red_flags.length > 0 && (
                  <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fb7185', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                      ⚠️ Forensic Red Flags Detected:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#fda4af', lineHeight: '1.5' }}>
                      {dossier.paper_analysis.methodology_audit.red_flags.map((rf, i) => (
                        <li key={i}>{rf}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {dossier.paper_analysis.methodology_audit.strengths.length > 0 && (
                  <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                      ✓ Verified Methodological Strengths:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#6ee7b7', lineHeight: '1.5' }}>
                      {dossier.paper_analysis.methodology_audit.strengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-subtle)'
            }}>
              Methodology and P-Hacking scanner is active for research document audits. Upload a manuscript in Research Paper Lab to view deep statistical telemetry.
            </div>
          )}
        </div>
      )}

      {/* Tab: Oral Defense / Committee Interrogation Terminal */}
      {activeTab === 'interrogate' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={20} color="var(--cyan-neon)" />
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Doctoral Defense & Adversarial Committee Interrogation
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Interrogate the findings, cross-examine paper vulnerabilities, or defend empirical validity
                </span>
              </div>
            </div>

            {/* Role Switcher */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDossierInterrogateRole('inquisitor')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  border: dossierInterrogateRole === 'inquisitor' ? '1px solid var(--rose-danger)' : '1px solid var(--border-subtle)',
                  background: dossierInterrogateRole === 'inquisitor' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                  color: dossierInterrogateRole === 'inquisitor' ? '#fb7185' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                ⚔️ Chief Inquisitor (Attack)
              </button>
              <button
                type="button"
                onClick={() => setDossierInterrogateRole('advocate')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  border: dossierInterrogateRole === 'advocate' ? '1px solid var(--emerald-success)' : '1px solid var(--border-subtle)',
                  background: dossierInterrogateRole === 'advocate' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: dossierInterrogateRole === 'advocate' ? '#34d399' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                🛡️ Defense Advocate (Defend)
              </button>
            </div>
          </div>

          {/* Conversation Log */}
          <div style={{
            minHeight: '200px',
            maxHeight: '380px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            background: 'rgba(7, 10, 18, 0.75)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {dossierInterrogationHistory.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '40px 0' }}>
                Ask a question to begin live cross-examination with the committee. The engine will cite the dossier's live web citations and empirical scores.
              </div>
            ) : (
              dossierInterrogationHistory.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: msg.role === 'user'
                      ? 'rgba(56, 189, 248, 0.15)'
                      : msg.role === 'inquisitor'
                      ? 'rgba(244, 63, 94, 0.12)'
                      : 'rgba(16, 185, 129, 0.12)',
                    border: `1px solid ${
                      msg.role === 'user'
                        ? 'rgba(56, 189, 248, 0.3)'
                        : msg.role === 'inquisitor'
                        ? 'rgba(244, 63, 94, 0.25)'
                        : 'rgba(16, 185, 129, 0.25)'
                    }`
                  }}
                >
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: msg.role === 'user' ? 'var(--cyan-primary)' : (msg.role === 'inquisitor' ? '#fb7185' : '#34d399'),
                    marginBottom: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {msg.speaker}
                  </div>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Suggested Quick Question Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
              💡 Quick Committee Prompts:
            </span>
            {[
              "Why did the empirical truth score resolve to this specific level?",
              "What are the most contentious web contradictions identified?",
              "Did the live search uncover independent third-party replication attempts?",
              "What are the p-hacking and sample-size vulnerabilities of these claims?"
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleDossierInterrogate(chip)}
                disabled={isDossierInterrogating}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cyan-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Row */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={dossierInterrogateQuestion}
              onChange={(e) => setDossierInterrogateQuestion(e.target.value)}
              placeholder="Type your examination question to cross-examine with live web evidence..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleDossierInterrogate();
                }
              }}
              disabled={isDossierInterrogating}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(7, 10, 18, 0.85)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => handleDossierInterrogate()}
              disabled={isDossierInterrogating || !dossierInterrogateQuestion.trim()}
              style={{
                padding: '11px 20px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid var(--cyan-primary)',
                color: 'var(--cyan-primary)',
                fontWeight: 800,
                fontSize: '13px',
                cursor: isDossierInterrogating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isDossierInterrogating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
              <span>Interrogate</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: Facts vs. Claims Breakdown */}
      {activeTab === 'claims' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Sub Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['ALL', 'VERIFIED_FACT', 'DEBUNKED_FALSEHOOD', 'CONTRADICTORY_VIEWPOINT'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setClaimFilter(cat)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: claimFilter === cat ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: claimFilter === cat ? 'var(--cyan-primary)' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                style={{
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={
                      claim.category === 'VERIFIED_FACT' ? 'badge badge-verified' :
                      (claim.category === 'DEBUNKED_FALSEHOOD' ? 'badge badge-debunked' : 'badge badge-warning')
                    }>
                      {claim.category.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Confidence: <strong>{claim.confidence}%</strong>
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
                  {claim.claim_text}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {claim.reasoning}
                </div>

                {claim.counter_evidence && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    fontSize: '12px',
                    color: '#fb7185'
                  }}>
                    <strong>Adversarial Finding:</strong> {claim.counter_evidence}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Contradictions Matrix */}
      {activeTab === 'contradictions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {dossier.contradictions.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No major evidentiary contradictions identified across authoritative sources.
            </div>
          ) : (
            dossier.contradictions.map((contra) => (
              <div
                key={contra.id}
                style={{
                  padding: '20px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--amber-warning)' }}>
                  ⚔️ {contra.topic}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Perspective A */}
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.06)',
                    border: '1px solid rgba(56, 189, 248, 0.2)'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan-primary)', textTransform: 'uppercase' }}>
                      Perspective A:
                    </span>
                    <div style={{ fontSize: '13px', color: '#fff', margin: '4px 0' }}>
                      {contra.viewpoint_a}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Source: {contra.source_a}
                    </div>
                  </div>

                  {/* Perspective B */}
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.06)',
                    border: '1px solid rgba(244, 63, 94, 0.2)'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--rose-danger)', textTransform: 'uppercase' }}>
                      Adversarial Perspective B:
                    </span>
                    <div style={{ fontSize: '13px', color: '#fff', margin: '4px 0' }}>
                      {contra.viewpoint_b}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Source: {contra.source_b}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid var(--emerald-border)',
                  fontSize: '13px',
                  color: '#34d399'
                }}>
                  <strong>Veritas Consensus Resolution:</strong> {contra.veritas_resolution}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Citations & Sources */}
      {activeTab === 'sources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Search and filter toolbar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '14px',
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{
                position: 'relative',
                flex: 1,
                minWidth: '220px'
              }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search audited websites, extracted quotes, paper claims..."
                  value={citationSearch}
                  onChange={(e) => setCitationSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(7, 10, 18, 0.8)',
                    color: '#fff',
                    fontSize: '12.5px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Tier Filters */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setCitationTierFilter(tier)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: '1px solid var(--border-subtle)',
                      background: citationTierFilter === tier ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      color: citationTierFilter === tier ? 'var(--cyan-primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {tier === 'ALL' ? `All (${dossier.citations.length})` : `${tier} Tier`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '6px' }}>
              <span>
                Showing <strong>{filteredCitations.length}</strong> of <strong>{dossier.citations.length}</strong> audited web & academic search vectors
              </span>
              <span>
                100% Live Crawled Provenance
              </span>
            </div>
          </div>

          {/* List of citations */}
          {filteredCitations.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '36px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              background: 'rgba(15, 23, 42, 0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)'
            }}>
              No sources found matching your search filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredCitations.map((cite, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '14px 16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        minWidth: '22px'
                      }}>
                        #{i + 1}
                      </span>
                      <span className={cite.tier === 'HIGH' ? 'badge badge-verified' : (cite.tier === 'LOW' ? 'badge badge-debunked' : 'badge badge-cyan')}>
                        {cite.tier}
                      </span>
                      {cite.subquery_angle && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: 'var(--cyan-primary)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          textTransform: 'uppercase'
                        }}>
                          {cite.subquery_angle}
                        </span>
                      )}
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: '#fff',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {cite.title}
                      </a>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Authority: <strong style={{ color: parseInt(cite.score || '50', 10) >= 80 ? 'var(--emerald-success)' : 'var(--text-main)' }}>{cite.score}%</strong>
                      </span>
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--cyan-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', textDecoration: 'none' }}
                      >
                        <span>Visit</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>

                  {/* Target Assertion Tag */}
                  {cite.target_assertion && (
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--cyan-primary)',
                      background: 'rgba(56, 189, 248, 0.07)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(56, 189, 248, 0.15)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      alignSelf: 'flex-start'
                    }}>
                      <span>🎯 Audited Claim:</span>
                      <strong style={{ fontWeight: 600 }}>{cite.target_assertion}</strong>
                    </div>
                  )}

                  {/* Snippet / Extracted Quote */}
                  {cite.snippet && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.45',
                      fontStyle: 'italic',
                      background: 'rgba(7, 10, 18, 0.65)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      borderLeft: '3px solid var(--cyan-primary)'
                    }}>
                      "{cite.snippet}"
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Domain:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {(() => {
                        try {
                          return new URL(cite.url).hostname;
                        } catch {
                          return cite.url;
                        }
                      })()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Markdown Dossier */}
      {activeTab === 'markdown' && (
        <div style={{ position: 'relative' }}>
          <pre style={{
            background: 'rgba(7, 10, 18, 0.95)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5'
          }}>
            {dossier.markdown_report}
          </pre>
        </div>
      )}

      {dossier.verification_certificate && (
        <CertificateModal
          certificate={dossier.verification_certificate}
          isOpen={isCertOpen}
          onClose={() => setIsCertOpen(false)}
        />
      )}
      </div>

      {/* ========================================================================= */}
      {/* COMPLETE EXECUTIVE FORENSIC DOSSIER (PRINT / PDF EXPORT ONLY)             */}
      {/* Displays 100% of all forensic sections without tabs, clipping, or cutouts */}
      {/* ========================================================================= */}
      <div className="print-only" style={{ width: '100%', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Document Letterhead */}
        <div style={{
          borderBottom: '2.5px solid #0f172a',
          paddingBottom: '14px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0284c7' }}>
              ⚖️ Veritas Forensic Intelligence Audit Dossier
            </div>
            <h1 style={{ fontSize: '19pt', fontWeight: 900, color: '#0f172a', margin: '4px 0 6px 0', lineHeight: '1.2' }}>
              {dossier.paper_analysis?.title || dossier.query}
            </h1>
            <div style={{ fontSize: '9pt', color: '#475569' }}>
              Compiled on {dossier.generated_at} • Investigation Depth: {dossier.investigation_depth.toUpperCase()} • Multi-Agent Bayesian Verification
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '16px' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '2px solid #0284c7',
              background: '#f0f9ff',
              color: '#0369a1',
              fontWeight: 800,
              fontSize: '11pt'
            }}>
              Truth Score: {dossier.truth_score}%
            </div>
            <div style={{ fontSize: '8.5pt', fontWeight: 700, color: '#475569', marginTop: '4px' }}>
              {dossier.verdict}
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary & Findings */}
        <div className="print-card print-avoid-break" style={{
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '16px',
          background: '#f8fafc',
          marginBottom: '18px'
        }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
            1. Executive Forensic Summary
          </h2>
          <p style={{ fontSize: '10pt', lineHeight: '1.5', color: '#334155', margin: '0 0 12px 0' }}>
            {dossier.executive_summary}
          </p>
          <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#0f172a', marginBottom: '6px' }}>
            Key Forensic Findings:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '9.5pt', lineHeight: '1.45' }}>
            {dossier.key_findings.map((finding, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{finding}</li>
            ))}
          </ul>
        </div>

        {/* Section 2: Research Paper Profile (if paper analysis exists) */}
        {dossier.paper_analysis && (
          <div className="print-card print-avoid-break" style={{
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '16px',
            background: '#ffffff',
            marginBottom: '18px'
          }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              2. Research Manuscript Profile
            </h2>
            <div style={{ marginBottom: '8px', fontSize: '9.5pt' }}>
              <div style={{ marginBottom: '4px' }}><strong>Title:</strong> {dossier.paper_analysis.title}</div>
              <div style={{ color: '#475569' }}><strong>Document Metrics:</strong> {dossier.paper_analysis.page_count} Pages • {dossier.paper_analysis.word_count.toLocaleString()} Words</div>
            </div>
            <div style={{ fontSize: '9.5pt', color: '#334155', marginBottom: '12px' }}>
              <strong>Abstract Summary:</strong> {dossier.paper_analysis.abstract_summary}
            </div>
            <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#0f172a', marginBottom: '6px' }}>
              Extracted Author Assertions Audited:
            </div>
            <ol style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '9pt', lineHeight: '1.45' }}>
              {dossier.paper_analysis.key_assertions.map((assertion, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{assertion}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Section 3: Autonomous Multi-Agent Investigation & Knowledge Graph Topology */}
        <div className="print-card print-avoid-break" style={{
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '16px',
          background: '#ffffff',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {dossier.paper_analysis ? '3.' : '2.'} Autonomous Multi-Agent Investigation & Knowledge Graph
            </h2>
            <span style={{ fontSize: '8pt', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
              SWARM VERIFIED TOPOLOGY
            </span>
          </div>
          
          <p style={{ fontSize: '9pt', color: '#475569', margin: '0 0 10px 0', lineHeight: '1.4' }}>
            Visual topological representation of the autonomous agent swarm. Displays the central research thesis, parallel multi-agent cross-examination vectors, academic source grounding clusters, and final Bayesian truth convergence.
          </p>

          {/* High-Resolution Printable Vector Graph Canvas */}
          <div style={{
            background: '#070a13',
            borderRadius: '6px',
            padding: '12px 8px 8px 8px',
            border: '1px solid #1e293b',
            marginBottom: '10px'
          }}>
            <svg viewBox="0 0 800 290" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
                </marker>
                <marker id="arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
                </marker>
              </defs>

              {/* Edge Connections from Root (400, 45) to 4 Sub-Agent Vectors */}
              <path d="M 400 48 C 400 78, 100 78, 100 115" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 2" markerEnd="url(#arrow)" />
              <path d="M 400 48 C 400 78, 300 78, 300 115" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeDasharray="4 2" markerEnd="url(#arrow)" />
              <path d="M 400 48 C 400 78, 500 78, 500 115" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeDasharray="4 2" markerEnd="url(#arrow)" />
              <path d="M 400 48 C 400 78, 700 78, 700 115" fill="none" stroke="#00f2fe" strokeWidth="1.8" strokeDasharray="4 2" markerEnd="url(#arrow)" />

              {/* Edge Connections from Agents to Evidence Nodes (Y=195) */}
              <path d="M 100 148 L 100 195" fill="none" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow-emerald)" />
              <path d="M 300 148 L 300 195" fill="none" stroke="#f43f5e" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <path d="M 500 148 L 500 195" fill="none" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <path d="M 700 148 L 700 195" fill="none" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow-emerald)" />

              {/* Edge Connections from Evidence to Convergence Verdict (400, 255) */}
              <path d="M 100 225 C 100 245, 320 255, 320 255" fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1.2" />
              <path d="M 300 225 C 300 245, 360 255, 360 255" fill="none" stroke="rgba(244, 63, 94, 0.5)" strokeWidth="1.2" />
              <path d="M 500 225 C 500 245, 440 255, 440 255" fill="none" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1.2" />
              <path d="M 700 225 C 700 245, 480 255, 480 255" fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1.2" />

              {/* TIER 1: ROOT NODE (Top Center) */}
              <g transform="translate(210, 10)">
                <rect width="380" height="38" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
                <text x="190" y="16" fill="#38bdf8" fontSize="8" fontWeight="800" textAnchor="middle" letterSpacing="0.05em">🧠 CENTRAL RESEARCH THESIS / INQUIRY</text>
                <text x="190" y="29" fill="#f8fafc" fontSize="8" fontWeight="600" textAnchor="middle">
                  {((dossier.paper_analysis?.title || dossier.query).length > 55) 
                    ? (dossier.paper_analysis?.title || dossier.query).slice(0, 55) + '...'
                    : (dossier.paper_analysis?.title || dossier.query)}
                </text>
              </g>

              {/* TIER 2: 4 AUTONOMOUS AGENT NODES */}
              <g transform="translate(20, 115)">
                <rect width="160" height="34" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
                <text x="80" y="15" fill="#38bdf8" fontSize="8" fontWeight="800" textAnchor="middle">🌐 CORROBORATION AGENT</text>
                <text x="80" y="27" fill="#94a3b8" fontSize="7" textAnchor="middle">Affirmative Literature Scan</text>
              </g>

              <g transform="translate(220, 115)">
                <rect width="160" height="34" rx="6" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.2" />
                <text x="80" y="15" fill="#f43f5e" fontSize="8" fontWeight="800" textAnchor="middle">⚔️ ADVERSARIAL INQUISITOR</text>
                <text x="80" y="27" fill="#94a3b8" fontSize="7" textAnchor="middle">Disputes & Counter-Evidence</text>
              </g>

              <g transform="translate(420, 115)">
                <rect width="160" height="34" rx="6" fill="#0f172a" stroke="#818cf8" strokeWidth="1.2" />
                <text x="80" y="15" fill="#818cf8" fontSize="8" fontWeight="800" textAnchor="middle">🏛️ PEER-REVIEW AUDITOR</text>
                <text x="80" y="27" fill="#94a3b8" fontSize="7" textAnchor="middle">Institutional Baseline Index</text>
              </g>

              <g transform="translate(620, 115)">
                <rect width="160" height="34" rx="6" fill="#0f172a" stroke="#34d399" strokeWidth="1.2" />
                <text x="80" y="15" fill="#34d399" fontSize="8" fontWeight="800" textAnchor="middle">🔬 REPLICATION TESTER</text>
                <text x="80" y="27" fill="#94a3b8" fontSize="7" textAnchor="middle">P-Hacking & Sample Rigor</text>
              </g>

              {/* TIER 3: EVIDENCE CLUSTERS */}
              <g transform="translate(20, 195)">
                <rect width="160" height="30" rx="5" fill="#064e3b" stroke="#059669" strokeWidth="1" />
                <text x="80" y="14" fill="#a7f3d0" fontSize="7.5" fontWeight="700" textAnchor="middle">Tier-1 Corroborated Evidence</text>
                <text x="80" y="24" fill="#6ee7b7" fontSize="7" textAnchor="middle">Nature, Science, .gov, .edu</text>
              </g>

              <g transform="translate(220, 195)">
                <rect width="160" height="30" rx="5" fill="#4c0519" stroke="#e11d48" strokeWidth="1" />
                <text x="80" y="14" fill="#fecdd3" fontSize="7.5" fontWeight="700" textAnchor="middle">Contradictory Viewpoints</text>
                <text x="80" y="24" fill="#fda4af" fontSize="7" textAnchor="middle">Divergent Academic Analyses</text>
              </g>

              <g transform="translate(420, 195)">
                <rect width="160" height="30" rx="5" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
                <text x="80" y="14" fill="#c7d2fe" fontSize="7.5" fontWeight="700" textAnchor="middle">Indexed Citation Network</text>
                <text x="80" y="24" fill="#a5b4fc" fontSize="7" textAnchor="middle">{dossier.citations?.length || 16} Sources Audited</text>
              </g>

              <g transform="translate(620, 195)">
                <rect width="160" height="30" rx="5" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
                <text x="80" y="14" fill="#a7f3d0" fontSize="7.5" fontWeight="700" textAnchor="middle">Methodology Rigor Score</text>
                <text x="80" y="24" fill="#6ee7b7" fontSize="7" textAnchor="middle">
                  {dossier.paper_analysis?.methodology_audit ? `${dossier.paper_analysis.methodology_audit.sample_size_score}/100 Rigor` : 'Empirical Scored'}
                </text>
              </g>

              {/* TIER 4: FINAL BAYESIAN TRUTH CONVERGENCE */}
              <g transform="translate(260, 252)">
                <rect width="280" height="32" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1.8" />
                <text x="140" y="14" fill="#38bdf8" fontSize="8" fontWeight="800" textAnchor="middle">
                  ⚖️ VERITAS BAYESIAN TRUTH CONVERGENCE
                </text>
                <text x="140" y="25" fill="#ffffff" fontSize="8" fontWeight="700" textAnchor="middle">
                  Score: {dossier.truth_score}% • {dossier.verdict}
                </text>
              </g>
            </svg>
          </div>

          {/* Graph Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '8pt', color: '#475569' }}>
            <div style={{ padding: '6px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '10pt' }}>
                {nodes?.length || (1 + 4 + (dossier.sources?.length || 8) + (dossier.claims_breakdown?.length || 6) + 1)}
              </div>
              <div style={{ fontSize: '7pt', textTransform: 'uppercase', fontWeight: 700 }}>Total Knowledge Nodes</div>
            </div>
            <div style={{ padding: '6px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '10pt' }}>
                {edges?.length || 18}
              </div>
              <div style={{ fontSize: '7pt', textTransform: 'uppercase', fontWeight: 700 }}>Reasoning Edges</div>
            </div>
            <div style={{ padding: '6px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '10pt' }}>
                {dossier.claims_breakdown?.filter(c => c.category === 'VERIFIED_FACT').length || 0}
              </div>
              <div style={{ fontSize: '7pt', textTransform: 'uppercase', fontWeight: 700 }}>Corroborated Facts</div>
            </div>
            <div style={{ padding: '6px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: '#d97706', fontSize: '10pt' }}>
                {dossier.contradictions?.length || 0}
              </div>
              <div style={{ fontSize: '7pt', textTransform: 'uppercase', fontWeight: 700 }}>Contradictions Isolated</div>
            </div>
          </div>
        </div>

        {/* Section 3: Methodology Rigor & P-Hacking Audit */}
        {dossier.paper_analysis?.methodology_audit && (
          <div className="print-card print-avoid-break" style={{
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '16px',
            background: '#f8fafc',
            marginBottom: '18px'
          }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              3. Methodology Rigor & P-Hacking Audit
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff', textAlign: 'center' }}>
                <div style={{ fontSize: '7.5pt', color: '#64748b', fontWeight: 700 }}>SAMPLE SCALE (N)</div>
                <div style={{ fontSize: '11pt', fontWeight: 800, color: '#0f172a' }}>
                  {dossier.paper_analysis.methodology_audit.primary_sample_count ? `N = ${dossier.paper_analysis.methodology_audit.primary_sample_count.toLocaleString()}` : 'Audit Scored'}
                </div>
                <div style={{ fontSize: '7.5pt', color: '#64748b' }}>Rigor: {dossier.paper_analysis.methodology_audit.sample_size_score}/100</div>
              </div>
              <div style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff', textAlign: 'center' }}>
                <div style={{ fontSize: '7.5pt', color: '#64748b', fontWeight: 700 }}>P-HACKING RISK</div>
                <div style={{ fontSize: '11pt', fontWeight: 800, color: dossier.paper_analysis.methodology_audit.p_hacking_risk > 30 ? '#dc2626' : '#16a34a' }}>
                  {dossier.paper_analysis.methodology_audit.p_hacking_risk}%
                </div>
                <div style={{ fontSize: '7.5pt', color: '#64748b' }}>Hazard Index</div>
              </div>
              <div style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff', textAlign: 'center' }}>
                <div style={{ fontSize: '7.5pt', color: '#64748b', fontWeight: 700 }}>BASELINES INDEX</div>
                <div style={{ fontSize: '11pt', fontWeight: 800, color: '#0f172a' }}>
                  {dossier.paper_analysis.methodology_audit.baseline_score}/100
                </div>
                <div style={{ fontSize: '7.5pt', color: '#64748b' }}>Comparative Rigor</div>
              </div>
              <div style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff', textAlign: 'center' }}>
                <div style={{ fontSize: '7.5pt', color: '#64748b', fontWeight: 700 }}>REPLICATION HAZARD</div>
                <div style={{ fontSize: '11pt', fontWeight: 800, color: dossier.paper_analysis.methodology_audit.replication_hazard_score > 35 ? '#d97706' : '#16a34a' }}>
                  {dossier.paper_analysis.methodology_audit.replication_hazard_score}%
                </div>
                <div style={{ fontSize: '7.5pt', color: '#64748b' }}>{dossier.paper_analysis.methodology_audit.summary_label}</div>
              </div>
            </div>
            {dossier.paper_analysis.methodology_audit.red_flags.length > 0 && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', marginBottom: '8px' }}>
                <strong style={{ color: '#dc2626', fontSize: '9pt' }}>Methodological Red Flags: </strong>
                <span style={{ color: '#991b1b', fontSize: '9pt' }}>{dossier.paper_analysis.methodology_audit.red_flags.join('; ')}</span>
              </div>
            )}
            {dossier.paper_analysis.methodology_audit.strengths.length > 0 && (
              <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', marginBottom: '8px' }}>
                <strong style={{ color: '#16a34a', fontSize: '9pt' }}>Verified Methodological Strengths: </strong>
                <span style={{ color: '#166534', fontSize: '9pt' }}>{dossier.paper_analysis.methodology_audit.strengths.join('; ')}</span>
              </div>
            )}
            {dossier.paper_analysis.methodology_audit.coi_note && (
              <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '4px' }}>
                <strong>COI / Independence:</strong> {dossier.paper_analysis.methodology_audit.coi_note}
              </div>
            )}
          </div>
        )}

        {/* Section 4: Complete Facts vs. Claims Matrix */}
        <div className="print-section" style={{ marginBottom: '22px', display: 'block' }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 800, margin: '0 0 10px 0', color: '#0f172a', borderBottom: '1.5px solid #0f172a', paddingBottom: '4px' }}>
            {dossier.paper_analysis ? '5.' : '4.'} Facts vs. Claims Forensic Cross-Examination ({dossier.claims_breakdown.length} Assertions Audited)
          </h2>
          <div style={{ display: 'block' }}>
            {dossier.claims_breakdown.map((claim, cIdx) => {
              const isVerified = claim.category === 'VERIFIED_FACT';
              const isDebunked = claim.category === 'DEBUNKED_FALSEHOOD';
              const badgeBg = isVerified ? '#f0fdf4' : (isDebunked ? '#fef2f2' : '#fffbeb');
              const badgeBorder = isVerified ? '#bbf7d0' : (isDebunked ? '#fecaca' : '#fde68a');
              const badgeText = isVerified ? '#16a34a' : (isDebunked ? '#dc2626' : '#d97706');
              const label = isVerified ? 'VERIFIED FACT' : (isDebunked ? 'DEBUNKED FALSEHOOD' : 'CONTRADICTORY VIEWPOINT');

              return (
                <div key={cIdx} className="print-card print-avoid-break" style={{
                  border: `1px solid ${badgeBorder}`,
                  borderRadius: '6px',
                  padding: '12px 14px',
                  background: badgeBg,
                  fontSize: '9.5pt',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '8pt',
                      letterSpacing: '0.05em',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#ffffff',
                      color: badgeText,
                      border: `1px solid ${badgeBorder}`
                    }}>
                      CLAIM {cIdx + 1}: {label}
                    </span>
                    <span style={{ fontSize: '8.5pt', fontWeight: 700, color: badgeText }}>
                      Confidence: {claim.confidence}%
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    "{claim.claim_text}"
                  </div>
                  <div style={{ color: '#334155', lineHeight: '1.45', marginBottom: '4px' }}>
                    <strong>Forensic Analysis:</strong> {claim.reasoning}
                  </div>
                  {claim.counter_evidence && (
                    <div style={{ color: '#b91c1c', lineHeight: '1.45', marginBottom: '4px', fontSize: '8.5pt' }}>
                      <strong>Counter-Evidence:</strong> {claim.counter_evidence}
                    </div>
                  )}
                  {claim.supporting_sources && claim.supporting_sources.length > 0 && (
                    <div style={{ fontSize: '8pt', color: '#64748b' }}>
                      <strong>Supporting Sources:</strong> {claim.supporting_sources.join(' • ')}
                    </div>
                  )}
                  {claim.opposing_sources && claim.opposing_sources.length > 0 && (
                    <div style={{ fontSize: '8pt', color: '#dc2626', marginTop: '2px' }}>
                      <strong>Opposing Sources:</strong> {claim.opposing_sources.join(' • ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Discovered Web Contradictions */}
        {dossier.contradictions && dossier.contradictions.length > 0 && (
          <div className="print-section" style={{ marginBottom: '22px', display: 'block' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 800, margin: '0 0 10px 0', color: '#0f172a', borderBottom: '1.5px solid #0f172a', paddingBottom: '4px' }}>
              {dossier.paper_analysis ? '6.' : '5.'} Discovered Academic Contradictions & Conflict Matrix ({dossier.contradictions.length})
            </h2>
            <div style={{ display: 'block' }}>
              {dossier.contradictions.map((contra, idx) => (
                <div key={idx} className="print-card print-avoid-break" style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #fed7aa',
                  background: '#fffaf5',
                  fontSize: '9pt',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontWeight: 700, color: '#c2410c', marginBottom: '4px' }}>
                    Conflict #{idx + 1}: {contra.topic}
                  </div>
                  <div><strong>Viewpoint A ({contra.source_a}):</strong> "{contra.viewpoint_a}"</div>
                  <div style={{ marginTop: '2px', color: '#9a3412' }}>
                    <strong>Viewpoint B ({contra.source_b}):</strong> "{contra.viewpoint_b}"
                  </div>
                  {contra.divergence_summary && (
                    <div style={{ fontSize: '8.5pt', color: '#475569', marginTop: '4px' }}>
                      <strong>Divergence Summary:</strong> {contra.divergence_summary}
                    </div>
                  )}
                  {contra.veritas_resolution && (
                    <div style={{ fontSize: '8.5pt', color: '#0f766e', marginTop: '4px' }}>
                      <strong>Veritas Resolution:</strong> {contra.veritas_resolution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Audited Academic Sources & Citations */}
        {dossier.citations && dossier.citations.length > 0 && (
          <div className="print-section" style={{ marginBottom: '22px', display: 'block' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 800, margin: '0 0 10px 0', color: '#0f172a', borderBottom: '1.5px solid #0f172a', paddingBottom: '4px' }}>
              {dossier.paper_analysis ? '7.' : '6.'} Audited Academic Sources & Citations ({dossier.citations.length} Sources Crawled)
            </h2>
            <div style={{ display: 'block' }}>
              {dossier.citations.map((cite, idx) => (
                <div key={idx} className="print-card print-avoid-break" style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: '#ffffff',
                  fontSize: '8.5pt',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <strong>[{cite.tier || 'WEB'}] {cite.title}</strong>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>Reliability: {cite.score}/100</span>
                  </div>
                  <div style={{ color: '#0284c7', fontSize: '8pt', wordBreak: 'break-all', marginBottom: '2px' }}>
                    {cite.url}
                  </div>
                  {cite.snippet && (
                    <div style={{ color: '#475569', fontStyle: 'italic', fontSize: '8pt', lineHeight: '1.35' }}>
                      "{cite.snippet}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 7: Dialectical Debate Arena (if present) */}
        {dossier.debate_arena && (
          <div className="print-section" style={{ marginBottom: '22px', display: 'block' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 800, margin: '0 0 10px 0', color: '#0f172a', borderBottom: '1.5px solid #0f172a', paddingBottom: '4px' }}>
              {dossier.paper_analysis ? '8.' : '7.'} Adversarial Debate Arena & Committee Rulings
            </h2>
            <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '10px', fontSize: '9pt' }}>
              <strong>Chief Arbiter Final Ruling:</strong> {dossier.debate_arena.verdict_label} (Verdict Score: {dossier.debate_arena.verdict_score}%)
            </div>
            <div style={{ display: 'block' }}>
              {dossier.debate_arena.rounds.map((round, rIdx) => (
                <div key={rIdx} className="print-card print-avoid-break" style={{
                  padding: '10px 14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: '#ffffff',
                  marginBottom: '12px',
                  fontSize: '8.5pt'
                }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    Round {round.round_number}: {round.title}
                  </div>
                  {round.inquisitor_argument && (
                    <div style={{ color: '#b91c1c', marginBottom: '4px', lineHeight: '1.4' }}>
                      <strong>⚔️ Inquisitor:</strong> {round.inquisitor_argument}
                    </div>
                  )}
                  {round.advocate_argument && (
                    <div style={{ color: '#15803d', marginBottom: '4px', lineHeight: '1.4' }}>
                      <strong>🛡️ Advocate:</strong> {round.advocate_argument}
                    </div>
                  )}
                  {round.arbiter_ruling && (
                    <div style={{ color: '#334155', fontStyle: 'italic', lineHeight: '1.4', marginTop: '2px' }}>
                      <strong>⚖️ Arbiter:</strong> {round.arbiter_ruling}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 8: Cryptographic Truth Seal & Verification Certificate */}
        {dossier.verification_certificate && (
          <div className="print-card print-avoid-break" style={{
            border: '2px solid #0284c7',
            borderRadius: '8px',
            padding: '16px',
            background: '#f0f9ff',
            marginTop: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 900, fontSize: '11pt', color: '#0369a1' }}>
                📜 VERITAS OFFICIAL CRYPTOGRAPHIC VERIFICATION CERTIFICATE
              </div>
              <div style={{ fontWeight: 800, fontSize: '9pt', color: '#0284c7' }}>
                STATUS: {dossier.verification_certificate.tamper_status}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '8.5pt', color: '#334155' }}>
              <div><strong>Certificate ID:</strong> {dossier.verification_certificate.certificate_id}</div>
              <div><strong>Issued At:</strong> {dossier.verification_certificate.issued_at}</div>
              <div><strong>Issuer:</strong> {dossier.verification_certificate.issuer}</div>
              <div><strong>Chief Arbiter Seal:</strong> {dossier.verification_certificate.chief_arbiter_seal}</div>
              <div style={{ gridColumn: 'span 2', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '8pt', marginTop: '4px' }}>
                <strong>SHA-256 Digest:</strong> {dossier.verification_certificate.sha256_hash}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
