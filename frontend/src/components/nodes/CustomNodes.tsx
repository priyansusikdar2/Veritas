import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe, Compass, Sparkles, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export const RootNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
      border: '2.5px solid var(--cyan-neon)',
      borderRadius: '16px',
      padding: '16px 22px',
      color: '#fff',
      boxShadow: '0 0 35px rgba(0, 242, 254, 0.45)',
      width: '420px',
      maxWidth: '440px',
      textAlign: 'center',
      fontFamily: 'var(--font-display)',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--cyan-neon)',
        marginBottom: '8px'
      }}>
        <Compass size={15} /> TARGET INVESTIGATIVE TOPIC
      </div>
      <div style={{
        fontSize: '14.5px',
        fontWeight: 700,
        lineHeight: '1.45',
        color: '#f8fafc',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere'
      }}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--cyan-neon)', width: '10px', height: '10px' }} />
      <Handle type="target" position={Position.Top} style={{ background: 'var(--cyan-neon)', width: '10px', height: '10px' }} />
    </div>
  );
};

export const SubQueryNode: React.FC<{ data: any }> = ({ data }) => {
  const angle = data.metadata?.angle || 'primary';
  const colorMap: Record<string, { border: string; bg: string; text: string }> = {
    primary: { border: '#38bdf8', bg: 'rgba(56, 189, 248, 0.14)', text: '#38bdf8' },
    adversarial: { border: '#f43f5e', bg: 'rgba(244, 63, 94, 0.14)', text: '#fb7185' },
    authoritative: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.14)', text: '#34d399' },
    evidence: { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.14)', text: '#c084fc' }
  };
  const theme = colorMap[angle] || colorMap.primary;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      border: `2px solid ${theme.border}`,
      borderRadius: '14px',
      padding: '14px 18px',
      color: '#fff',
      width: '320px',
      maxWidth: '340px',
      boxSizing: 'border-box',
      boxShadow: `0 6px 20px -2px ${theme.bg}`
    }}>
      <Handle type="target" position={Position.Top} style={{ background: theme.border, width: '9px', height: '9px' }} />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        fontWeight: 800,
        textTransform: 'uppercase',
        color: theme.text,
        marginBottom: '6px'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: theme.text,
          boxShadow: `0 0 8px ${theme.text}`
        }} />
        Vector: {angle}
      </div>
      <div style={{
        fontSize: '12.5px',
        color: 'var(--text-secondary)',
        fontWeight: 600,
        lineHeight: '1.45',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere'
      }}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: theme.border, width: '9px', height: '9px' }} />
    </div>
  );
};

export const SourceNode: React.FC<{ data: any }> = ({ data }) => {
  const meta = data.metadata || {};
  const tier = meta.tier || 'MEDIUM';
  const score = meta.score || 50;

  const tierColors: Record<string, { border: string; bg: string; text: string }> = {
    HIGH: { border: 'rgba(16, 185, 129, 0.7)', bg: 'rgba(16, 185, 129, 0.18)', text: '#34d399' },
    MEDIUM: { border: 'rgba(56, 189, 248, 0.5)', bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8' },
    LOW: { border: 'rgba(244, 63, 94, 0.6)', bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185' },
    UNVERIFIED: { border: 'rgba(148, 163, 184, 0.5)', bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8' }
  };
  const theme = tierColors[tier] || tierColors.MEDIUM;

  const domainText = meta.domain || (meta.url ? new URL(meta.url).hostname : data.label);

  return (
    <div style={{
      background: 'rgba(11, 17, 30, 0.95)',
      border: `1.5px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '12px 14px',
      width: '300px',
      maxWidth: '320px',
      boxSizing: 'border-box',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: theme.text, width: '8px', height: '8px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={13} color={theme.text} />
          <span style={{
            fontSize: '9.5px',
            fontWeight: 800,
            color: theme.text,
            background: theme.bg,
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {tier} TRUST
          </span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 800, color: theme.text, fontFamily: 'var(--font-mono)' }}>
          {score}%
        </span>
      </div>
      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#fff',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere'
      }} title={meta.title || data.label}>
        {meta.title || data.label}
      </div>
      <div style={{
        fontSize: '10.5px',
        color: 'var(--cyan-primary)',
        marginTop: '4px',
        fontFamily: 'var(--font-mono)',
        wordBreak: 'break-all',
        overflowWrap: 'anywhere'
      }}>
        {domainText}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: theme.text, width: '8px', height: '8px' }} />
    </div>
  );
};

export const ClaimNode: React.FC<{ data: any }> = ({ data }) => {
  const cat = data.category || 'UNSUBSTANTIATED_CLAIM';
  const meta = data.metadata || {};

  let icon = <HelpCircle size={16} color="#94a3b8" />;
  let badgeClass = 'badge-cyan';
  let borderColor = 'rgba(56, 189, 248, 0.5)';

  if (cat === 'VERIFIED_FACT') {
    icon = <CheckCircle2 size={16} color="var(--emerald-success)" />;
    badgeClass = 'badge-verified';
    borderColor = 'var(--emerald-border)';
  } else if (cat === 'DEBUNKED_FALSEHOOD') {
    icon = <XCircle size={16} color="var(--rose-danger)" />;
    badgeClass = 'badge-debunked';
    borderColor = 'var(--rose-border)';
  } else if (cat === 'CONTRADICTORY_VIEWPOINT') {
    icon = <AlertTriangle size={16} color="var(--amber-warning)" />;
    badgeClass = 'badge-warning';
    borderColor = 'var(--amber-border)';
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.98)',
      border: `2px solid ${borderColor}`,
      borderRadius: '14px',
      padding: '14px 18px',
      width: '420px',
      maxWidth: '440px',
      boxSizing: 'border-box',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      cursor: 'pointer'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: borderColor, width: '9px', height: '9px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          <span className={`badge ${badgeClass}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
            {cat.replace('_', ' ')}
          </span>
        </div>
        {meta.confidence && (
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>
            {meta.confidence}% Conf.
          </span>
        )}
      </div>
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: '#fff',
        lineHeight: '1.45',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere'
      }}>
        {meta.claim_text || data.label}
      </div>
      {meta.reasoning && (
        <div style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '6px',
          lineHeight: '1.35',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-word',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '6px'
        }}>
          {meta.reasoning}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: borderColor, width: '9px', height: '9px' }} />
    </div>
  );
};

export const VerdictNode: React.FC<{ data: any }> = ({ data }) => {
  const meta = data.metadata || {};
  const score = meta.truth_score || 50;
  const isHigh = score >= 70;
  const isLow = score <= 35;

  const color = isHigh ? 'var(--emerald-success)' : (isLow ? 'var(--rose-danger)' : 'var(--amber-warning)');

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0b111e, #131d31)',
      border: `2.5px solid ${color}`,
      borderRadius: '20px',
      padding: '20px 28px',
      color: '#fff',
      width: '460px',
      maxWidth: '480px',
      textAlign: 'center',
      boxSizing: 'border-box',
      boxShadow: `0 0 45px ${isHigh ? 'rgba(16, 185, 129, 0.45)' : (isLow ? 'rgba(244, 63, 94, 0.45)' : 'rgba(245, 158, 11, 0.45)')}`
    }}>
      <Handle type="target" position={Position.Top} style={{ background: color, width: '10px', height: '10px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color, marginBottom: '8px' }}>
        <Sparkles size={18} />
        <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Final Veritas Verdict
        </span>
      </div>
      <div style={{
        fontSize: '19px',
        fontWeight: 800,
        fontFamily: 'var(--font-display)',
        color: '#fff',
        marginBottom: '6px',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere'
      }}>
        {meta.verdict}
      </div>
      <div style={{
        fontSize: '34px',
        fontWeight: 900,
        color,
        fontFamily: 'var(--font-mono)'
      }}>
        {score}<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/100</span>
      </div>
    </div>
  );
};
