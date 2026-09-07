import React, { useState, useRef } from 'react';
import { Radar, Flame, Filter, Send, UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import type { ResearchUploadedFile } from '../types';
import { API_BASE } from '../config';

export interface TrendingClaim {
  id: string;
  topic: string;
  category: 'AI & Computing' | 'Biotech & Health' | 'Climate & Energy' | 'Physics & Space' | 'Uploaded Document';
  velocityScore: number;
  propagationChannels: string[];
  initialRisk: 'HIGH_RISK' | 'MEDIUM_DISPUTE' | 'LIKELY_CREDIBLE';
  reportedDate: string;
  summary: string;
  targetQuery: string;
  uploadedFile?: ResearchUploadedFile;
}

const DEFAULT_TRENDING_CLAIMS: TrendingClaim[] = [
  {
    id: 'radar-1',
    topic: 'AGI Achieved via Self-Reasoning Test-Time Compute Loops',
    category: 'AI & Computing',
    velocityScore: 96,
    propagationChannels: ['X / Twitter', 'Reddit r/MachineLearning', 'ArXiv Pre-prints'],
    initialRisk: 'MEDIUM_DISPUTE',
    reportedDate: '18 mins ago',
    summary: 'Viral claims assert that new closed-source reasoning models have achieved autonomous self-correction parity with human PhD researchers.',
    targetQuery: 'AGI achieved autonomous self-reasoning test-time compute reinforcement learning benchmark validation'
  },
  {
    id: 'radar-2',
    topic: 'Ambient Pressure Room-Temperature Semiconductor Claims',
    category: 'Physics & Space',
    velocityScore: 91,
    propagationChannels: ['Tech Blogs', 'Weibo', 'Preprint Repositories'],
    initialRisk: 'HIGH_RISK',
    reportedDate: '42 mins ago',
    summary: 'Anonymous preprint alleges zero resistance at 298K in lead-apatite derivative crystals. High likelihood of replication divergence.',
    targetQuery: 'Room temperature ambient pressure superconductor replication experimental consensus LK-99 derivative'
  },
  {
    id: 'radar-3',
    topic: 'Synthetic mRNA Vaccine Micro-Clotting Pathology Assertions',
    category: 'Biotech & Health',
    velocityScore: 84,
    propagationChannels: ['Telegram Channels', 'Alt-News Aggregators', 'TikTok'],
    initialRisk: 'HIGH_RISK',
    reportedDate: '1 hour ago',
    summary: 'Viral video asserts unverified dark-field microscopy evidence showing foreign microstructures in blood plasma.',
    targetQuery: 'mRNA vaccine micro-clotting dark-field microscopy blood pathology peer-reviewed consensus debunked'
  },
  {
    id: 'radar-4',
    topic: 'Nuclear Fusion Q-Total Net Positive Energy Demonstration',
    category: 'Climate & Energy',
    velocityScore: 78,
    propagationChannels: ['Mainstream Press', 'Nature News', 'Institutional Press Releases'],
    initialRisk: 'LIKELY_CREDIBLE',
    reportedDate: '2 hours ago',
    summary: 'Inertial confinement fusion facility reports sustained net electrical yield exceeding wall-plug electricity input.',
    targetQuery: 'Inertial confinement fusion net electrical energy gain Q-total commercial viability experimental validation'
  },
  {
    id: 'radar-5',
    topic: 'State Space Models (Mamba) Completely Obsoleting Transformer Architecture',
    category: 'AI & Computing',
    velocityScore: 88,
    propagationChannels: ['Hacker News', 'GitHub Discussions', 'NeurIPS Submissions'],
    initialRisk: 'MEDIUM_DISPUTE',
    reportedDate: '3 hours ago',
    summary: 'Claims that selective state spaces eliminate attention mechanisms entirely at 1M+ context lengths with zero perplexity degradation.',
    targetQuery: 'Mamba selective state space models linear time sequence modeling attention replacement empirical benchmark'
  }
];

interface GlobalRadarFeedProps {
  onDispatchInvestigation: (
    query: string,
    depth: 'quick' | 'deep' | 'exhaustive',
    uploadedFile?: ResearchUploadedFile | null
  ) => void;
  isLoading: boolean;
  uploadedPapers?: ResearchUploadedFile[];
  onUploadPaper?: (paper: ResearchUploadedFile) => void;
}

export const GlobalRadarFeed: React.FC<GlobalRadarFeedProps> = ({
  onDispatchInvestigation,
  isLoading,
  uploadedPapers = [],
  onUploadPaper
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [uploadedClaims, setUploadedClaims] = useState<TrendingClaim[]>(() => {
    // Populate any existing uploaded papers into audited claims
    return uploadedPapers.map((paper, idx) => ({
      id: `uploaded-${idx}-${paper.filename}`,
      topic: paper.title || paper.filename,
      category: 'Uploaded Document',
      velocityScore: 88,
      propagationChannels: ['User Document Upload', 'Manuscript Ingestion', 'Deep Cross-Examination'],
      initialRisk: 'MEDIUM_DISPUTE',
      reportedDate: 'Session Upload',
      summary: paper.abstract_summary || paper.preview.slice(0, 200) || 'User manuscript awaiting empirical falsification audit.',
      targetQuery: paper.suggested_query || paper.title || paper.filename,
      uploadedFile: paper
    }));
  });

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [latestUploadedFile, setLatestUploadedFile] = useState<ResearchUploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['ALL', 'Uploaded Document', 'AI & Computing', 'Biotech & Health', 'Climate & Energy', 'Physics & Space'];

  const allClaims = [...uploadedClaims, ...DEFAULT_TRENDING_CLAIMS];

  const filteredClaims = selectedCategory === 'ALL'
    ? allClaims
    : allClaims.filter(c => c.category === selectedCategory);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await resp.json();
      if (data.status === 'success' && data.file) {
        const parsedFile: ResearchUploadedFile = data.file;
        const lowerTitle = (parsedFile.title || '').toLowerCase();
        const lowerAbstract = (parsedFile.abstract_summary || '').toLowerCase();
        if (lowerTitle.includes('error reading') || lowerAbstract.includes('error reading') || lowerTitle.includes('no module named')) {
          setUploadError(parsedFile.abstract_summary || 'Failed to extract readable text from the document.');
          return;
        }
        setLatestUploadedFile(parsedFile);
        if (onUploadPaper) {
          onUploadPaper(parsedFile);
        }

        const newClaim: TrendingClaim = {
          id: `upload-${Date.now()}`,
          topic: parsedFile.title || parsedFile.filename,
          category: 'Uploaded Document',
          velocityScore: 92,
          propagationChannels: ['User Document Upload', 'Manuscript Ingestion', 'Active Falsification Pipeline'],
          initialRisk: 'HIGH_RISK',
          reportedDate: 'Just now',
          summary: parsedFile.abstract_summary
            ? parsedFile.abstract_summary.slice(0, 240) + (parsedFile.abstract_summary.length > 240 ? '...' : '')
            : (parsedFile.preview ? parsedFile.preview.slice(0, 200) : 'Audited user document ready for empirical verification.'),
          targetQuery: parsedFile.suggested_query || parsedFile.title || parsedFile.filename,
          uploadedFile: parsedFile
        };

        setUploadedClaims(prev => [newClaim, ...prev]);
        setSelectedCategory('ALL');
      } else {
        setUploadError(data.message || 'Could not parse uploaded document');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Network error while uploading document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'HIGH_RISK':
        return { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.35)', label: 'High Viral Rumor Risk' };
      case 'MEDIUM_DISPUTE':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)', label: 'Contested Assertion' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)', label: 'Emerging Consensus' };
    }
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
      {/* Top Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '24px 28px',
        borderRadius: 'var(--radius-xl)',
        background: 'radial-gradient(ellipse at top left, rgba(244, 63, 94, 0.15) 0%, rgba(15, 23, 42, 0.85) 75%)',
        border: '1.5px solid rgba(244, 63, 94, 0.35)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%)',
            border: '1.5px solid rgba(244, 63, 94, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--rose-danger)',
            boxShadow: '0 0 25px rgba(244, 63, 94, 0.35)'
          }}>
            <Radar size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--rose-danger)'
              }}>
                Live Web Threat Stream & Document Audit
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(244, 63, 94, 0.2)',
                color: '#fb7185',
                fontWeight: 700,
                border: '1px solid rgba(244, 63, 94, 0.3)'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--rose-danger)', animation: 'pulse 1s infinite' }} />
                {allClaims.length} Live Threat Clusters Active
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
              Global Misinformation & Controversy Radar
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Autonomous telemetry monitoring viral claims across Reddit, X, and pre-print repositories. Upload files below to audit them instantly for misinformation.
            </p>
          </div>
        </div>

        {/* Global Metric Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 20px',
          borderRadius: '12px',
          background: 'rgba(7, 10, 18, 0.8)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Global Verification Index
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--cyan-neon)', fontFamily: 'var(--font-mono)' }}>
              1,420+
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Daily Claims Audited
            </div>
          </div>
        </div>
      </div>

      {/* Upload File to Scan for Misinformation Section */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        style={{
          padding: '24px 28px',
          borderRadius: 'var(--radius-lg)',
          background: isDragOver ? 'rgba(244, 63, 94, 0.12)' : 'rgba(15, 23, 42, 0.85)',
          border: isDragOver ? '2px dashed var(--rose-danger)' : '1.5px solid rgba(244, 63, 94, 0.35)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--rose-danger)',
              border: '1px solid rgba(244, 63, 94, 0.4)'
            }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                Upload Document to Audit for Misinformation & Viral Claims
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Upload any PDF, TXT, or MD manuscript/leak to extract author claims, calculate controversy velocity, and see audit results.
              </div>
            </div>
          </div>

          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 800,
            cursor: isUploading ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 18px rgba(244, 63, 94, 0.4)',
            transition: 'all 0.15s'
          }}>
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            <span>{isUploading ? 'Parsing & Auditing Document...' : '📤 Upload File to Scan'}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              style={{ display: 'none' }}
              disabled={isUploading}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        {uploadError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            fontSize: '12.5px'
          }}>
            <AlertTriangle size={16} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Real-time Parsed Results Showcase for the Most Recent Upload */}
        {latestUploadedFile && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '10px',
            background: 'rgba(7, 10, 18, 0.7)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--emerald-success)" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--emerald-success)' }}>
                  Document Successfully Audited & Extracted
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  ({latestUploadedFile.page_count} pages • {latestUploadedFile.word_count.toLocaleString()} words)
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDispatchInvestigation(latestUploadedFile.suggested_query || latestUploadedFile.title || latestUploadedFile.filename, 'exhaustive', latestUploadedFile)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)',
                  color: '#07090e',
                  fontSize: '12px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Send size={13} />
                <span>🚀 Run Full Veritas Swarm on This File</span>
              </button>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
              {latestUploadedFile.title || latestUploadedFile.filename}
            </div>

            {latestUploadedFile.abstract_summary && (
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                <strong>Executive Summary:</strong> {latestUploadedFile.abstract_summary.slice(0, 300)}...
              </p>
            )}

            {latestUploadedFile.key_assertions && latestUploadedFile.key_assertions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan-neon)', textTransform: 'uppercase' }}>
                  Extracted Assertions to Falsify:
                </span>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {latestUploadedFile.key_assertions.slice(0, 3).map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Filtering Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={15} color="var(--text-muted)" style={{ marginRight: '4px' }} />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: selectedCategory === cat ? '1px solid var(--border-highlight)' : '1px solid var(--border-subtle)',
                background: selectedCategory === cat ? 'rgba(0, 242, 254, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                color: selectedCategory === cat ? 'var(--cyan-neon)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {cat === 'Uploaded Document' ? `📁 Uploaded Documents (${uploadedClaims.length})` : cat}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredClaims.length}</strong> active threat streams
        </span>
      </div>

      {/* Viral Threat Stream Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '18px'
      }}>
        {filteredClaims.map((claim) => {
          const risk = getRiskStyle(claim.initialRisk);
          const isUploaded = claim.category === 'Uploaded Document';
          return (
            <div
              key={claim.id}
              style={{
                padding: '22px',
                borderRadius: 'var(--radius-lg)',
                background: isUploaded ? 'rgba(15, 23, 42, 0.98)' : 'rgba(11, 17, 30, 0.95)',
                border: isUploaded ? '1.5px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-subtle)',
                boxShadow: isUploaded ? '0 12px 35px rgba(244, 63, 94, 0.2)' : '0 10px 30px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Meta Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: risk.bg,
                      color: risk.text,
                      border: `1px solid ${risk.border}`
                    }}>
                      {risk.label}
                    </span>
                    {isUploaded && (
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--cyan-neon)',
                        fontWeight: 800
                      }}>
                        USER UPLOAD
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {claim.reportedDate}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: '1.4',
                  margin: 0
                }}>
                  {claim.topic}
                </h3>

                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {claim.summary}
                </p>

                {/* Propagation Channels */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vectors:</span>
                  {claim.propagationChannels.map((chan, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '10.5px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {chan}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Row: Velocity Gauge + Dispatch Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={18} color="var(--amber-warning)" />
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Viral Velocity
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--amber-warning)', fontFamily: 'var(--font-mono)' }}>
                      {claim.velocityScore}%
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onDispatchInvestigation(claim.targetQuery, 'exhaustive', claim.uploadedFile || null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: isUploaded
                      ? 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)',
                    color: isUploaded ? '#fff' : '#07090e',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    boxShadow: isUploaded ? '0 0 16px rgba(244, 63, 94, 0.4)' : '0 0 16px rgba(0, 242, 254, 0.35)',
                    transition: 'all 0.15s'
                  }}
                >
                  <Send size={13} />
                  <span>{isUploaded ? 'Audit Uploaded File' : 'Dispatch Veritas Swarm'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
