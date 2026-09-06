import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, FileSearch } from 'lucide-react';
import type { CitationIntegrity, SourceDoc } from '../types';

interface CitationIntegrityViewProps {
  integrity: CitationIntegrity;
  sources: SourceDoc[];
}

export const CitationIntegrityView: React.FC<CitationIntegrityViewProps> = ({ integrity, sources }) => {
  const isSafe = integrity.hallucination_safety_score >= 80;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px',
      background: 'rgba(11, 17, 30, 0.95)',
      borderRadius: 'var(--radius-lg)',
      border: `1.5px solid ${isSafe ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${isSafe ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'} 0%, rgba(56, 189, 248, 0.25) 100%)`,
            border: `1px solid ${isSafe ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSafe ? 'var(--emerald-success)' : 'var(--amber-warning)',
            boxShadow: `0 0 20px ${isSafe ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: isSafe ? 'var(--emerald-success)' : 'var(--amber-warning)' }}>
                Anti-Hallucination Integrity Audit
              </span>
              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(0, 242, 254, 0.15)', color: 'var(--cyan-neon)', fontWeight: 700 }}>
                Live Source Verification
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '2px 0 0 0' }}>
              Citation Authenticity & DOI / Web Reference Audit
            </h3>
          </div>
        </div>

        {/* Hallucination Safety Score Gauge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 18px',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: `1px solid ${isSafe ? 'var(--emerald-border)' : 'var(--amber-border)'}`
        }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Hallucination Safety Index
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: isSafe ? 'var(--emerald-success)' : 'var(--amber-warning)', fontFamily: 'var(--font-mono)' }}>
              {integrity.hallucination_safety_score}%
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}> Verifiable</span>
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '9999px',
            background: isSafe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isSafe ? 'var(--emerald-success)' : 'var(--amber-warning)',
            border: `1px solid ${isSafe ? 'var(--emerald-border)' : 'var(--amber-border)'}`
          }}>
            {integrity.audit_verdict.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
      }}>
        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Citations Audited
          </span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {integrity.total_citations_audited} Links
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Verified against live indices
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <span style={{ fontSize: '11px', color: 'var(--emerald-success)', textTransform: 'uppercase', fontWeight: 700 }}>
            Peer-Reviewed / Institutional
          </span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--emerald-success)', marginTop: '4px' }}>
            {integrity.peer_reviewed_or_institutional} Sources
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            .gov, .edu, Nature, IEEE, arXiv
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Secondary Corroborated
          </span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cyan-primary)', marginTop: '4px' }}>
            {integrity.secondary_corroborated} Sources
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Mainstream reporting & wires
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <span style={{ fontSize: '11px', color: '#fb7185', textTransform: 'uppercase', fontWeight: 700 }}>
            Unverified / Anecdotal Risk
          </span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fb7185', marginTop: '4px' }}>
            {integrity.unverified_or_anecdotal} Sources
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Forums & unvetted blogs
          </div>
        </div>
      </div>

      {/* Audit Pipeline Details Note */}
      <div style={{
        padding: '14px 18px',
        borderRadius: '8px',
        background: 'rgba(7, 10, 18, 0.7)',
        borderLeft: '4px solid var(--cyan-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <FileSearch size={18} color="var(--cyan-primary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
          {integrity.integrity_notes} Veritas Scraper Agent executes cross-origin HTTP HEAD/GET queries to confirm citation validity and eliminate phantom/hallucinated URL references.
        </span>
      </div>

      {/* Audited Citations Live Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          Audited Citation Fingerprints ({sources.length})
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sources.map((src, i) => {
            const isHigh = src.credibility_tier === 'HIGH';
            return (
              <div
                key={src.id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid var(--border-subtle)',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  {isHigh ? (
                    <CheckCircle2 size={16} color="var(--emerald-success)" style={{ flexShrink: 0 }} />
                  ) : (
                    <AlertTriangle size={16} color="var(--amber-warning)" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {src.title || src.domain}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: isHigh ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: isHigh ? 'var(--emerald-success)' : 'var(--cyan-primary)',
                    flexShrink: 0
                  }}>
                    {src.domain}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Authority: <strong style={{ color: '#fff' }}>{src.credibility_score}%</strong>
                  </span>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--cyan-primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '11px' }}
                    >
                      <span>Verify</span> <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
