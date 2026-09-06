import React from 'react';
import { X, Award, Printer, CheckCircle, Hash, Calendar } from 'lucide-react';
import type { VerificationCertificate } from '../types';

interface CertificateModalProps {
  certificate: VerificationCertificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, isOpen, onClose }) => {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(9, 14, 26, 0.98) 100%)',
        border: '2px solid rgba(0, 242, 254, 0.45)',
        borderRadius: '20px',
        boxShadow: '0 0 60px rgba(0, 242, 254, 0.25), 0 20px 50px rgba(0, 0, 0, 0.8)',
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: '#fff'
      }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Certificate Outer Border Frame */}
        <div style={{
          border: '1.5px dashed rgba(0, 242, 254, 0.35)',
          borderRadius: '14px',
          padding: '28px',
          background: 'radial-gradient(ellipse at center, rgba(0, 242, 254, 0.05) 0%, transparent 70%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '18px'
        }}>
          {/* Header Seal */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00f2fe 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(0, 242, 254, 0.4)',
            color: '#07090e'
          }}>
            <Award size={36} />
          </div>

          <div>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--cyan-neon)'
            }}>
              OFFICIAL VERIFICATION PROTOCOL
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.02em',
              margin: '4px 0 0 0'
            }}>
              Veritas Certificate of Truth
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Autonomous Multi-Agent Fact-Checking & Empirical Consensus Engine
            </div>
          </div>

          {/* Certificate UUID & Date */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '6px 16px',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Hash size={13} color="var(--cyan-primary)" /> ID: <strong>{certificate.certificate_id}</strong>
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={13} color="var(--cyan-primary)" /> Issued: <strong>{certificate.issued_at}</strong>
            </span>
          </div>

          {/* Audited Subject Box */}
          <div style={{
            width: '100%',
            background: 'rgba(7, 10, 18, 0.7)',
            borderRadius: '10px',
            padding: '16px',
            border: '1px solid var(--border-subtle)',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
              Investigative Subject & Document Analyzed:
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '4px', lineHeight: '1.4' }}>
              {certificate.investigation_subject}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--cyan-primary)', marginTop: '4px' }}>
              Scope: {certificate.document_audited}
            </div>
          </div>

          {/* Verdict and Truth Score Result */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            width: '100%',
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Executive Ruling
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--cyan-neon)' }}>
                {certificate.verdict}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Veritas Truth Score
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: certificate.truth_score >= 70 ? 'var(--emerald-success)' : 'var(--amber-warning)' }}>
                {certificate.truth_score} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Tamper Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: 'var(--emerald-success)' }}>
                <CheckCircle size={15} /> Valid & Sealed
              </div>
            </div>
          </div>

          {/* Cryptographic Hash */}
          <div style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '6px',
            background: 'rgba(7, 10, 18, 0.85)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              SHA-256 Cryptographic Consensus Hash:
            </div>
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--cyan-primary)',
              marginTop: '3px',
              wordBreak: 'break-all'
            }}>
              {certificate.sha256_hash}
            </div>
          </div>

          {/* Signatures & Seal Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ color: '#fff', display: 'block' }}>Chief Arbiter Agent</strong>
              <span>Algorithmic Supreme Council</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ color: '#fff', display: 'block' }}>Veritas Engine v2.4</strong>
              <span>Zero-Knowledge Verification</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)',
              color: '#07090e',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)'
            }}
          >
            <Printer size={15} />
            <span>Print / Save Official Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
