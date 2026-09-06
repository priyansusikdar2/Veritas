import React from 'react';
import {
  Compass,
  FileText,
  Cpu,
  Settings,
  ShieldAlert,
  Database,
  Radar,
  Swords,
  Layers,
  Server,
  TerminalSquare
} from 'lucide-react';
import type { ApiKeys } from '../types';

export type NavSection = 'search' | 'radar-feed' | 'paper-lab' | 'paper-clash' | 'investigation' | 'agent-swarm' | 'vault';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onOpenSettings: () => void;
  isLoading: boolean;
  truthScore: number | null;
  sourcesCount: number;
  hasPaper: boolean;
  hasDossier: boolean;
  apiKeys: ApiKeys;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  onOpenSettings,
  isLoading,
  apiKeys
}) => {
  // Determine active LLM label
  let activeLlmLabel = 'Autonomous Local';
  if (apiKeys.gemini) activeLlmLabel = 'Gemini 2.0 Flash';
  else if (apiKeys.openai) activeLlmLabel = 'GPT-4o Mini';
  else if (apiKeys.groq) activeLlmLabel = 'Groq LLaMA 3.3';

  return (
    <aside style={{
      width: '276px',
      minWidth: '276px',
      background: 'rgba(6, 10, 20, 0.96)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 14px 16px 14px',
      zIndex: 40,
      boxShadow: '4px 0 30px rgba(0, 0, 0, 0.5)',
      overflowY: 'auto'
    }}>
      {/* Top: Brand & Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Veritas Logo & Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 8px',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(56, 189, 248, 0.15)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 50%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.45)',
            color: '#060813',
            flexShrink: 0
          }}>
            <ShieldAlert size={22} strokeWidth={2.4} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '19px',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff, #38bdf8, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                VERITAS
              </span>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                background: 'rgba(0, 242, 254, 0.15)',
                color: 'var(--cyan-primary)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                padding: '1px 5px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}>
                PRO
              </span>
            </div>
            <p style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              Scientific ML Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Category 1: CORE ENGINE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              paddingLeft: '8px',
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Compass size={11} color="var(--cyan-primary)" />
              <span>Core Dispatch</span>
            </div>

            {/* Live Fact-Check */}
            <button
              onClick={() => onSelectSection('search')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8.5px 12px',
                borderRadius: '8px',
                border: activeSection === 'search' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                background: activeSection === 'search' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: activeSection === 'search' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Compass size={15} color={activeSection === 'search' ? 'var(--cyan-neon)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Fact-Check Console</span>
              </div>
              {activeSection === 'search' && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan-neon)', boxShadow: '0 0 8px var(--cyan-neon)' }} />
              )}
            </button>

            {/* Misinformation Radar Feed */}
            <button
              onClick={() => onSelectSection('radar-feed')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8.5px 12px',
                borderRadius: '8px',
                border: activeSection === 'radar-feed' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                background: activeSection === 'radar-feed' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: activeSection === 'radar-feed' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Radar size={15} color={activeSection === 'radar-feed' ? 'var(--cyan-neon)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Misinformation Radar</span>
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                LIVE
              </span>
            </button>

            {/* Investigation Thought Canvas */}
            <button
              onClick={() => onSelectSection('investigation')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8.5px 12px',
                borderRadius: '8px',
                border: activeSection === 'investigation' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                background: activeSection === 'investigation' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: activeSection === 'investigation' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TerminalSquare size={15} color={activeSection === 'investigation' ? 'var(--cyan-neon)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Investigation Canvas</span>
              </div>
              {isLoading && (
                <div className="live-beacon" style={{ width: '6px', height: '6px' }} />
              )}
            </button>
          </div>

          {/* Category 2: SCIENTIFIC & ACADEMIC AUDIT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              paddingLeft: '8px',
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FileText size={11} color="var(--indigo-primary)" />
              <span>Scientific Audits</span>
            </div>

            {/* Research Paper Lab */}
            <button
              onClick={() => onSelectSection('paper-lab')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8.5px 12px',
                borderRadius: '8px',
                border: activeSection === 'paper-lab' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                background: activeSection === 'paper-lab' ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
                color: activeSection === 'paper-lab' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={15} color={activeSection === 'paper-lab' ? 'var(--indigo-primary)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Research Paper Lab</span>
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                color: 'var(--cyan-primary)',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '1px 5px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}>
                ARXIV
              </span>
            </button>

            {/* Paper Clash Arena */}
            <button
              onClick={() => onSelectSection('paper-clash')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8.5px 12px',
                borderRadius: '8px',
                border: activeSection === 'paper-clash' ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid transparent',
                background: activeSection === 'paper-clash' ? 'rgba(244, 63, 94, 0.12)' : 'transparent',
                color: activeSection === 'paper-clash' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Swords size={15} color={activeSection === 'paper-clash' ? '#fb7185' : 'var(--text-muted)'} />
                <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Paper Clash Arena</span>
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#fb7185',
                background: 'rgba(244, 63, 94, 0.15)',
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                VS
              </span>
            </button>
          </div>

          {/* Category 3: INTELLIGENCE & TRUST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              paddingLeft: '8px',
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Layers size={11} color="var(--violet-primary)" />
              <span>Assurance & Swarm</span>
            </div>

            {/* Agent Swarm Telemetry */}
            <button
              onClick={() => onSelectSection('agent-swarm')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8.5px 12px',
                borderRadius: '8px',
                border: activeSection === 'agent-swarm' ? '1px solid rgba(168, 85, 247, 0.35)' : '1px solid transparent',
                background: activeSection === 'agent-swarm' ? 'rgba(168, 85, 247, 0.12)' : 'transparent',
                color: activeSection === 'agent-swarm' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={15} color={activeSection === 'agent-swarm' ? 'var(--violet-neon)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Agent Swarm</span>
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: 'var(--violet-primary)',
                background: 'rgba(168, 85, 247, 0.15)',
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                4 NODES
              </span>
            </button>

            {/* Truth Vault */}
            <button
              onClick={() => onSelectSection('vault')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8.5px 12px',
                borderRadius: '8px',
                border: activeSection === 'vault' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                background: activeSection === 'vault' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                color: activeSection === 'vault' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={15} color={activeSection === 'vault' ? 'var(--emerald-success)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Truth Vault</span>
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: 'var(--emerald-success)',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '1px 5px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}>
                SHA-256
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: ML Hardware & Compute Telemetry Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          padding: '12px 14px',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={12} color="var(--cyan-primary)" />
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-primary)', letterSpacing: '0.05em' }}>
                ML Compute Cluster
              </span>
            </div>
            <div className="live-beacon" style={{ width: '6px', height: '6px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Inference</span>
            <span style={{ fontWeight: 600, color: '#fff' }}>{activeLlmLabel}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Graph Swarm</span>
            <span style={{ fontWeight: 600, color: 'var(--emerald-success)' }}>4/4 Nodes Ready</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Context Window</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}>128k Tokens</span>
          </div>
        </div>

        {/* Configure Engine Button */}
        <button
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '9px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.18s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <Settings size={14} />
          <span>LLM Provider & Keys</span>
        </button>
      </div>
    </aside>
  );
};
