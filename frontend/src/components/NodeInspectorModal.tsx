import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { Node } from '@xyflow/react';

interface NodeInspectorModalProps {
  node: Node | null;
  onClose: () => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({ node, onClose }) => {
  if (!node) return null;

  const data = node.data as any;
  const meta = data.metadata || {};
  const nodeType = node.type;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '420px',
      maxWidth: '90vw',
      height: '100vh',
      background: 'rgba(11, 17, 30, 0.96)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid var(--border-subtle)',
      boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
      zIndex: 100,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'rgba(56, 189, 248, 0.12)',
            color: 'var(--cyan-primary)'
          }}>
            Node Inspector
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Type: {nodeType}
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Title */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: 700,
          color: '#fff',
          lineHeight: '1.3'
        }}>
          {meta.title || meta.claim_text || data.label}
        </h3>
        {meta.url && (
          <a
            href={meta.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--cyan-primary)',
              marginTop: '6px',
              textDecoration: 'none'
            }}
          >
            <span>{new URL(meta.url).hostname}</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Specific Metrics for Source */}
      {nodeType === 'source' && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Credibility Score
              </span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: meta.score >= 80 ? 'var(--emerald-success)' : 'var(--amber-warning)' }}>
                {meta.score}%
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Tier: {meta.tier}
              </span>
            </div>

            <div style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Editorial Bias
              </span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cyan-primary)', marginTop: '4px' }}>
                {meta.bias || 'OBJECTIVE'}
              </div>
            </div>
          </div>

          {meta.subquery_angle && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              color: 'var(--text-muted)'
            }}>
              <span>Research Vector:</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.1)',
                color: 'var(--cyan-primary)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'uppercase'
              }}>
                {meta.subquery_angle}
              </span>
            </div>
          )}

          {meta.target_assertion && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--cyan-primary)' }}>
                Target Paper Assertion:
              </span>
              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontSize: '12.5px',
                color: '#e2e8f0',
                lineHeight: '1.4'
              }}>
                🎯 {meta.target_assertion}
              </div>
            </div>
          )}
        </>
      )}

      {/* Snippet or Evidence */}
      {meta.snippet && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Extracted Text Evidence:
          </span>
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(7, 10, 18, 0.8)',
            border: '1px solid var(--border-subtle)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.4',
            fontStyle: 'italic'
          }}>
            "{meta.snippet}"
          </div>
        </div>
      )}

      {/* Reasoning for Claims */}
      {nodeType === 'claim' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Cross-Examination Scrutiny:
            </span>
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              {meta.reasoning}
            </div>
          </div>

          {meta.fallacies && meta.fallacies.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--rose-danger)' }}>
                Logical Fallacies Flagged:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {meta.fallacies.map((fal: string, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: '#fb7185'
                    }}
                  >
                    ⚠️ {fal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Metadata JSON inspection */}
      <div style={{ marginTop: 'auto' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Node ID: {node.id}
        </span>
      </div>
    </div>
  );
};
