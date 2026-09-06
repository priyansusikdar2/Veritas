import React from 'react';
import { Settings, Printer, Sparkles, Activity, Layers, ChevronRight } from 'lucide-react';
import type { ApiKeys, ResearchUploadedFile } from '../types';
import type { NavSection } from './Sidebar';

interface HeaderProps {
  onOpenSettings: () => void;
  onExportDossier?: () => void;
  hasDossier: boolean;
  truthScore?: number | null;
  sourcesCount: number;
  activeSection?: NavSection;
  apiKeys?: ApiKeys;
  isLoading?: boolean;
  activePaper?: ResearchUploadedFile | null;
}

const SECTION_LABELS: Record<NavSection, string> = {
  'search': 'Fact-Check Console',
  'radar-feed': 'Global Misinformation Radar',
  'paper-lab': 'Research Paper Lab (ArXiv)',
  'paper-clash': 'Paper Clash Arena',
  'investigation': 'Thought Canvas & Live Terminal',
  'agent-swarm': 'Autonomous Agent Swarm',
  'vault': 'Cryptographic Truth Vault'
};

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onExportDossier,
  hasDossier,
  truthScore,
  sourcesCount,
  activeSection = 'search',
  apiKeys,
  isLoading = false,
  activePaper
}) => {
  // Determine active LLM label
  let activeLlmLabel = 'Autonomous Built-In Ensemble';
  let activeLlmBadge = 'LOCAL';
  if (apiKeys?.gemini) {
    activeLlmLabel = 'Google Gemini 2.0 Flash';
    activeLlmBadge = 'CLOUD';
  } else if (apiKeys?.openai) {
    activeLlmLabel = 'OpenAI GPT-4o Mini';
    activeLlmBadge = 'CLOUD';
  } else if (apiKeys?.groq) {
    activeLlmLabel = 'Groq LLaMA 3.3 (800 T/s)';
    activeLlmBadge = 'GROQ';
  }

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 14, 26, 0.88)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {/* Left: Breadcrumbs & Mission Control Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-muted)'
        }}>
          <span style={{
            color: 'var(--cyan-primary)',
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.05em'
          }}>
            VERITAS.AI
          </span>
          <ChevronRight size={13} color="var(--text-dim)" />
          <span style={{ color: '#fff' }}>
            {SECTION_LABELS[activeSection] || 'Platform'}
          </span>
          {activePaper && (
            <>
              <ChevronRight size={13} color="var(--text-dim)" />
              <span style={{
                color: 'var(--text-secondary)',
                maxWidth: '220px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }} title={activePaper.title}>
                {activePaper.title}
              </span>
            </>
          )}
        </div>

        {/* Live LangGraph DAG Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--indigo-primary)',
          fontFamily: 'var(--font-mono)'
        }}>
          <Layers size={12} />
          <span>LangGraph v0.2 DAG</span>
        </div>
      </div>

      {/* Right: ML Hardware / Inference Status & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* ML Inference Engine Telemetry Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 12px',
          borderRadius: '8px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11.5px',
          color: 'var(--text-secondary)'
        }}>
          <div className="live-beacon" style={{
            backgroundColor: isLoading ? 'var(--cyan-neon)' : 'var(--emerald-success)',
            boxShadow: isLoading ? '0 0 8px var(--cyan-neon)' : '0 0 8px var(--emerald-success)'
          }} />
          <span style={{ fontWeight: 600, color: '#fff' }}>{activeLlmLabel}</span>
          <span style={{
            fontSize: '9.5px',
            fontWeight: 800,
            padding: '1px 5px',
            borderRadius: '4px',
            background: activeLlmBadge === 'GROQ' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0, 242, 254, 0.15)',
            color: activeLlmBadge === 'GROQ' ? '#fb7185' : 'var(--cyan-primary)'
          }}>
            {activeLlmBadge}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>•</span>
          <span style={{ color: 'var(--emerald-success)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            {isLoading ? 'Inference Streaming...' : '118ms Latency'}
          </span>
        </div>

        {/* Live Web Pages Tracked */}
        {sourcesCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            fontSize: '11.5px',
            color: 'var(--cyan-primary)'
          }}>
            <Activity size={13} />
            <span><strong>{sourcesCount}</strong> Sources Indexed</span>
          </div>
        )}

        {/* Truth Score Badge */}
        {truthScore !== null && truthScore !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            background: truthScore >= 70 ? 'var(--emerald-bg)' : (truthScore <= 35 ? 'var(--rose-bg)' : 'var(--amber-bg)'),
            border: `1px solid ${truthScore >= 70 ? 'var(--emerald-border)' : (truthScore <= 35 ? 'var(--rose-border)' : 'var(--amber-border)')}`,
            fontSize: '11.5px',
            fontWeight: 700,
            color: truthScore >= 70 ? 'var(--emerald-success)' : (truthScore <= 35 ? 'var(--rose-danger)' : 'var(--amber-warning)')
          }}>
            <Sparkles size={13} />
            <span>Truth: {truthScore}%</span>
          </div>
        )}

        {/* Export Dossier PDF Button */}
        {hasDossier && onExportDossier && (
          <button
            onClick={onExportDossier}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.15)'
            }}
            title="Export official Executive Forensic Dossier to PDF"
          >
            <Printer size={14} />
            <span>Export PDF</span>
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Configure API Keys & LLM Inference Settings"
        >
          <Settings size={14} />
          <span>LLM Engine</span>
        </button>
      </div>
    </header>
  );
};
