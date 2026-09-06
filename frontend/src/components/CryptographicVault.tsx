import React, { useState } from 'react';
import { Database, Search, Award, Copy, Check, Send } from 'lucide-react';
import type { VerificationCertificate } from '../types';

export interface VaultRecord {
  id: string;
  certificateId: string;
  subject: string;
  verdict: string;
  truthScore: number;
  issuedAt: string;
  sha256Hash: string;
  documentAudited: string;
}

const INITIAL_VAULT_RECORDS: VaultRecord[] = [
  {
    id: 'rec-1',
    certificateId: 'VRT-2026-96F8E210',
    subject: 'Attention Is All You Need: Transformer Architecture & Self-Attention Empirical Verification',
    verdict: 'CONFIRMED FACTUAL',
    truthScore: 96,
    issuedAt: '2026-09-05 19:17:48 UTC',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    documentAudited: 'Attention_Is_All_You_Need.pdf (140k+ citations)'
  },
  {
    id: 'rec-2',
    certificateId: 'VRT-2026-18B73901',
    subject: 'Ambient Pressure Room-Temperature LK-99 Superconductivity Hypothesis',
    verdict: 'DEBUNKED / FALSE',
    truthScore: 18,
    issuedAt: '2026-09-05 18:24:12 UTC',
    sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    documentAudited: 'LK-99 Falsification Consortium & Nature 2023'
  },
  {
    id: 'rec-3',
    certificateId: 'VRT-2026-88A19044',
    subject: 'Inertial Confinement Fusion Q-Total Net Electrical Energy Demonstration',
    verdict: 'CONFIRMED FACTUAL',
    truthScore: 88,
    issuedAt: '2026-09-05 16:40:05 UTC',
    sha256Hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    documentAudited: 'Lawrence Livermore NIF Verification Report'
  },
  {
    id: 'rec-4',
    certificateId: 'VRT-2026-12E09832',
    subject: 'Synthetic mRNA Vaccine Micro-Clotting Pathology via Dark-Field Microscopy',
    verdict: 'DEBUNKED / FALSE',
    truthScore: 12,
    issuedAt: '2026-09-05 15:12:33 UTC',
    sha256Hash: 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9',
    documentAudited: 'Consensus Medical Fact-Checking Archives'
  },
  {
    id: 'rec-5',
    certificateId: 'VRT-2026-52D48911',
    subject: 'Selective State Space Models (Mamba) Completely Obsoleting Transformer Multi-Step Reasoning',
    verdict: 'MIXED / CONFLICTING EVIDENCE',
    truthScore: 52,
    issuedAt: '2026-09-05 14:02:18 UTC',
    sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    documentAudited: 'Mamba ICML Benchmark vs Transformer Baseline'
  }
];

interface CryptographicVaultProps {
  onInspectCertificate: (cert: VerificationCertificate) => void;
  onDispatchInvestigation: (query: string, depth: 'quick' | 'deep' | 'exhaustive') => void;
  isLoading: boolean;
}

export const CryptographicVault: React.FC<CryptographicVaultProps> = ({
  onInspectCertificate,
  onDispatchInvestigation,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<'ALL' | 'FACTUAL' | 'DEBUNKED' | 'MIXED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRecords = INITIAL_VAULT_RECORDS.filter(rec => {
    const matchesSearch = rec.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rec.certificateId.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterVerdict === 'FACTUAL') return rec.truthScore >= 70;
    if (filterVerdict === 'DEBUNKED') return rec.truthScore <= 35;
    if (filterVerdict === 'MIXED') return rec.truthScore > 35 && rec.truthScore < 70;
    return true;
  });

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{
      maxWidth: '1600px',
      width: '100%',
      margin: '0 auto',
      padding: '24px 28px 60px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '24px 28px',
        borderRadius: 'var(--radius-xl)',
        background: 'radial-gradient(ellipse at top left, rgba(0, 242, 254, 0.15) 0%, rgba(15, 23, 42, 0.85) 75%)',
        border: '1.5px solid rgba(0, 242, 254, 0.35)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)',
            border: '1.5px solid rgba(0, 242, 254, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan-neon)',
            boxShadow: '0 0 25px rgba(0, 242, 254, 0.35)'
          }}>
            <Database size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--cyan-neon)'
              }}>
                Immutable Audit Registry
              </span>
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald-success)',
                fontWeight: 700
              }}>
                SHA-256 Tamper-Evident Ledger
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.02em',
              margin: '3px 0 0 0'
            }}>
              Veritas Cryptographic Truth Vault
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Historical registry of audited research papers and fact-checking investigations with cryptographic proofs.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(7, 10, 18, 0.7)',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          flex: '1 1 320px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by topic or Certificate ID (e.g. VRT-2026)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '13px',
              width: '100%',
              outline: 'none'
            }}
          />
        </div>

        {/* Verdict Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {(['ALL', 'FACTUAL', 'DEBUNKED', 'MIXED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterVerdict(filter)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: filterVerdict === filter ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                background: filterVerdict === filter ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                color: filterVerdict === filter ? 'var(--cyan-neon)' : 'var(--text-secondary)',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {filteredRecords.map((rec) => {
          const isFactual = rec.truthScore >= 70;
          const isDebunked = rec.truthScore <= 35;
          const statusColor = isFactual ? 'var(--emerald-success)' : (isDebunked ? 'var(--rose-danger)' : 'var(--amber-warning)');

          return (
            <div
              key={rec.id}
              style={{
                padding: '18px 22px',
                borderRadius: '12px',
                background: 'rgba(11, 17, 30, 0.95)',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              {/* Left Column: ID & Topic */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 450px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--cyan-primary)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(56, 189, 248, 0.25)'
                  }}>
                    {rec.certificateId}
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {rec.issuedAt}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: `${statusColor}15`,
                    color: statusColor,
                    border: `1px solid ${statusColor}40`
                  }}>
                    {rec.verdict}
                  </span>
                </div>

                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#fff', margin: 0, lineHeight: '1.4' }}>
                  {rec.subject}
                </h3>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Document Target: <strong style={{ color: 'var(--text-secondary)' }}>{rec.documentAudited}</strong>
                </div>

                {/* Hash pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(7, 10, 18, 0.6)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  width: 'fit-content',
                  maxWidth: '100%',
                  marginTop: '4px'
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    SHA-256: {rec.sha256Hash.slice(0, 24)}...
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(rec.sha256Hash, rec.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copiedId === rec.id ? 'var(--emerald-success)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Copy full SHA-256 hash"
                  >
                    {copiedId === rec.id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {/* Middle: Truth Score Meter */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'rgba(7, 10, 18, 0.7)',
                border: '1px solid var(--border-subtle)',
                minWidth: '110px'
              }}>
                <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: statusColor }}>
                  {rec.truthScore}
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/100</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Truth Score
                </span>
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => onInspectCertificate({
                    certificate_id: rec.certificateId,
                    sha256_hash: rec.sha256Hash,
                    issuer: 'Veritas Autonomous Intelligence & Algorithmic Fact-Checking Authority',
                    issued_at: rec.issuedAt,
                    investigation_subject: rec.subject,
                    verdict: rec.verdict,
                    truth_score: rec.truthScore,
                    chief_arbiter_seal: 'OFFICIAL_CRYPTOGRAPHIC_CONSENSUS_SEAL',
                    document_audited: rec.documentAudited,
                    tamper_status: 'SECURE_UNMODIFIED'
                  })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--cyan-neon)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <Award size={14} />
                  <span>Inspect Certificate</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onDispatchInvestigation(rec.subject, 'exhaustive')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)',
                    color: '#07090e',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 14px rgba(0, 242, 254, 0.3)',
                    transition: 'all 0.15s'
                  }}
                >
                  <Send size={13} />
                  <span>Re-examine</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
