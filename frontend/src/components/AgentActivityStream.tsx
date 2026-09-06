import React, { useEffect, useRef } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import type { AgentLog } from '../types';

interface AgentActivityStreamProps {
  logs: AgentLog[];
  isInvestigating: boolean;
}

export const AgentActivityStream: React.FC<AgentActivityStreamProps> = ({
  logs,
  isInvestigating
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return <CheckCircle2 size={13} color="var(--emerald-success)" />;
      case 'WARNING':
        return <AlertTriangle size={13} color="var(--amber-warning)" />;
      case 'DANGER':
        return <ShieldAlert size={13} color="var(--rose-danger)" />;
      default:
        return <Info size={13} color="var(--cyan-primary)" />;
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'Search Coordinator':
        return '#38bdf8';
      case 'Scraper & Reader Agent':
        return '#34d399';
      case 'Cross-Examiner Agent':
        return '#fb7185';
      case 'Dossier Agent':
        return '#a855f7';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      background: 'rgba(11, 17, 30, 0.95)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }}>
      {/* Terminal Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(15, 23, 42, 0.8)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={15} color="var(--cyan-primary)" />
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#fff'
          }}>
            Agentic Activity Stream
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isInvestigating ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--cyan-neon)',
                boxShadow: '0 0 10px var(--cyan-neon)',
                animation: 'pulse 1.2s infinite'
              }} />
              <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', fontWeight: 600 }}>
                Live Execution
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Standby
            </span>
          )}
        </div>
      </div>

      {/* Log Terminal List */}
      <div style={{
        flex: 1,
        minHeight: 0,
        padding: '12px 16px',
        overflowY: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {logs.length === 0 ? (
          <div style={{
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '30px',
            fontSize: '12px'
          }}>
            Awaiting investigative dispatch. Select a preset or type a claim to see the agents in action.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                lineHeight: '1.45',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '6px 8px',
                borderRadius: '6px',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>
                {getLevelIcon(log.level)}
              </div>
              <div style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                <span style={{
                  color: getAgentColor(log.agent),
                  fontWeight: 700,
                  marginRight: '6px'
                }}>
                  [{log.agent}]:
                </span>
                <span style={{ color: 'var(--text-primary)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                  {log.message}
                </span>
              </div>
              <span style={{
                color: 'var(--text-muted)',
                fontSize: '10px',
                flexShrink: 0,
                marginTop: '2px',
                whiteSpace: 'nowrap'
              }}>
                {log.timestamp}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
