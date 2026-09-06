import React, { useState } from 'react';
import { Search, Compass, Flame, FileText, Sparkles, Layers, ShieldCheck, Brain } from 'lucide-react';
import type { ResearchPreset } from '../types';

interface SearchHeroProps {
  onSearch: (query: string, depth: 'quick' | 'deep' | 'exhaustive') => void;
  isLoading: boolean;
  presets: ResearchPreset[];
  onNavigateToPaperLab?: () => void;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  onSearch,
  isLoading,
  presets,
  onNavigateToPaperLab
}) => {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<'quick' | 'deep' | 'exhaustive'>('deep');
  const [activeMode, setActiveMode] = useState<'fact-check' | 'academic' | 'thesis'>('fact-check');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim(), depth);
  };

  const handleSelectPreset = (preset: ResearchPreset) => {
    setQuery(preset.query);
    onSearch(preset.query, depth);
  };

  return (
    <div style={{
      maxWidth: '1360px',
      margin: '0 auto',
      padding: '24px 24px 20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Hero Header & Mode Switcher */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {/* ML Engine Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 14px',
          borderRadius: '9999px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          color: 'var(--cyan-primary)',
          fontSize: '11.5px',
          fontWeight: 700,
          letterSpacing: '0.04em'
        }}>
          <Sparkles size={13} />
          <span>AUTONOMOUS SCIENTIFIC INTEGRITY & DEEP AUDIT OS</span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>v2.4 ENSEMBLE</span>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '34px',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-0.025em',
          lineHeight: '1.2',
          maxWidth: '860px',
          margin: '0 auto'
        }}>
          Cross-Examine Empirical Claims, Viral Rumors & Research Manuscripts
        </h2>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          maxWidth: '740px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Powered by cyclic LangGraph agent swarms that crawl 15+ live academic and web indexes,
          compute 5-pillar Bayesian truth probabilities, and audit statistical replication hazards.
        </p>

        {/* Interactive Mode Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          marginTop: '6px'
        }}>
          <button
            type="button"
            onClick={() => setActiveMode('fact-check')}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeMode === 'fact-check' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeMode === 'fact-check' ? 'var(--cyan-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            ⚡ Autonomous Fact-Check
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('academic');
              if (onNavigateToPaperLab) onNavigateToPaperLab();
            }}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeMode === 'academic' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeMode === 'academic' ? 'var(--indigo-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={13} />
            <span>ArXiv Preprint Lab</span>
            <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.3)', color: '#fff' }}>
              FAST
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('thesis')}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeMode === 'thesis' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeMode === 'thesis' ? 'var(--emerald-success)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            🔬 Market & Tech Hypothesis
          </button>
        </div>
      </div>

      {/* Main Search Command Bar */}
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(11, 16, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '14px',
          padding: '8px 14px',
          boxShadow: '0 0 35px -5px rgba(0, 242, 254, 0.22), 0 10px 30px rgba(0, 0, 0, 0.5)',
          gap: '12px',
          transition: 'all 0.25s'
        }}>
          <div style={{ paddingLeft: '4px', color: 'var(--cyan-primary)' }}>
            <Search size={22} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter any controversial claim, empirical preprint assertion, or market thesis to audit..."
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '14.5px',
              fontFamily: 'var(--font-body)',
              padding: '10px 0'
            }}
          />

          {/* Depth Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid var(--border-subtle)',
            gap: '2px'
          }}>
            <button
              type="button"
              onClick={() => setDepth('quick')}
              style={{
                padding: '6px 11px',
                borderRadius: '6px',
                border: 'none',
                background: depth === 'quick' ? 'var(--cyan-primary)' : 'transparent',
                color: depth === 'quick' ? '#060813' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Quick (5)
            </button>
            <button
              type="button"
              onClick={() => setDepth('deep')}
              style={{
                padding: '6px 13px',
                borderRadius: '6px',
                border: 'none',
                background: depth === 'deep' ? 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)' : 'transparent',
                color: depth === 'deep' ? '#060813' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: depth === 'deep' ? '0 0 10px rgba(0, 242, 254, 0.3)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              Deep (15+)
            </button>
            <button
              type="button"
              onClick={() => setDepth('exhaustive')}
              style={{
                padding: '6px 11px',
                borderRadius: '6px',
                border: 'none',
                background: depth === 'exhaustive' ? 'var(--cyan-primary)' : 'transparent',
                color: depth === 'exhaustive' ? '#060813' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Exhaustive
            </button>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 22px',
              borderRadius: '10px',
              background: isLoading ? 'rgba(56, 189, 248, 0.3)' : 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)',
              border: 'none',
              color: '#060813',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
              boxShadow: isLoading ? 'none' : '0 0 20px rgba(0, 242, 254, 0.45)',
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #060813',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Compass size={16} />
                <span>Launch Audit</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Floating ML Capability Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px'
      }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan-primary)'
          }}>
            <Layers size={17} />
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff' }}>Cyclic LangGraph DAG</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>4 autonomous agents streaming in parallel</div>
          </div>
        </div>

        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--emerald-success)'
          }}>
            <ShieldCheck size={17} />
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff' }}>5-Pillar Bayesian Calibration</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mathematically computed truth confidence</div>
          </div>
        </div>

        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--indigo-primary)'
          }}>
            <Brain size={17} />
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff' }}>ArXiv & DOI Instant Resolver</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Zero-upload parsing with P-Hacking scanner</div>
          </div>
        </div>
      </div>

      {/* 60-Second Demo Hook Presets Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={16} color="var(--amber-warning)" />
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)'
            }}>
              High-Impact Demonstration Hooks (Click to Trigger Live Agent Audit):
            </span>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
            6 Verified Benchmark Vectors
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px'
        }}>
          {presets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => !isLoading && handleSelectPreset(preset)}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 242, 254, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {preset.category}
                  </span>
                  <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px', fontFamily: 'var(--font-mono)' }}>
                    {preset.badge}
                  </span>
                </div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: '1.3'
                }}>
                  {preset.title}
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.45',
                  marginTop: '6px'
                }}>
                  {preset.description}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                color: 'var(--cyan-primary)',
                fontSize: '11.5px',
                fontWeight: 700
              }}>
                <span>Dispatch Swarm</span>
                <span style={{ fontSize: '14px', transition: 'transform 0.2s' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
