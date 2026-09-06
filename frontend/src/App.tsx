import { useState, useEffect, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { Cpu, Compass, FileText } from 'lucide-react';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import type { NavSection } from './components/Sidebar';
import { SearchHero } from './components/SearchHero';
import { ResearchPaperLab, BENCHMARK_PAPERS } from './components/ResearchPaperLab';
import { GraphView } from './components/GraphView';
import { AgentActivityStream } from './components/AgentActivityStream';
import { DossierView } from './components/DossierView';
import { NodeInspectorModal } from './components/NodeInspectorModal';
import { SettingsModal } from './components/SettingsModal';
import { GlobalRadarFeed } from './components/GlobalRadarFeed';
import { PaperClashArena } from './components/PaperClashArena';
import { AgentSwarmTelemetry } from './components/AgentSwarmTelemetry';
import { CryptographicVault } from './components/CryptographicVault';
import { CertificateModal } from './components/CertificateModal';
import { MLTelemetryDrawer } from './components/MLTelemetryDrawer';

import type {
  SourceDoc,
  SubQuery,
  AnalyzedClaim,
  DossierReport,
  AgentLog,
  ResearchPreset,
  ApiKeys,
  ResearchUploadedFile,
  VerificationCertificate
} from './types';

const API_BASE = 'http://127.0.0.1:8000';

export function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('search');
  const [activePaper, setActivePaper] = useState<ResearchUploadedFile | null>(null);
  const [uploadedPapers, setUploadedPapers] = useState<ResearchUploadedFile[]>(() => {
    try {
      const saved = localStorage.getItem('veritas_uploaded_papers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddUploadedPaper = useCallback((paper: ResearchUploadedFile) => {
    setUploadedPapers(prev => {
      const exists = prev.some(p => p.filename === paper.filename || (p.id && p.id === paper.id));
      const next = exists ? prev.map(p => (p.filename === paper.filename ? paper : p)) : [paper, ...prev];
      try {
        localStorage.setItem('veritas_uploaded_papers', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
    setActivePaper(paper);
  }, []);

  const [presets, setPresets] = useState<ResearchPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [vaultSelectedCert, setVaultSelectedCert] = useState<VerificationCertificate | null>(null);

  // Graph state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Investigation & Dossier state
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [sources, setSources] = useState<SourceDoc[]>([]);
  const [dossier, setDossier] = useState<DossierReport | null>(null);
  const [truthScore, setTruthScore] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'expanded-graph' | 'split' | 'expanded-terminal'>('expanded-graph');

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const saved = localStorage.getItem('veritas_api_keys');
    return saved ? JSON.parse(saved) : {};
  });

  // Fetch presets on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/presets`)
      .then((res) => res.json())
      .then((data) => {
        if (data.presets) setPresets(data.presets);
      })
      .catch((err) => console.log('Could not fetch presets:', err));
  }, []);

  const handleSaveKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem('veritas_api_keys', JSON.stringify(keys));
  };

  const handleStartInvestigation = useCallback(async (
    query: string,
    depth: 'quick' | 'deep' | 'exhaustive',
    uploadedFile?: ResearchUploadedFile | null
  ) => {
    let finalUploadedFile = uploadedFile || activePaper;
    if (!finalUploadedFile) {
      const qLower = query.toLowerCase();
      const matched = BENCHMARK_PAPERS.find(p => 
        (p.id && qLower.includes(p.id.replace(/_/g, ' '))) ||
        (p.title && qLower.includes(p.title.toLowerCase().slice(0, 20))) ||
        (p.suggested_query && qLower.includes(p.suggested_query.toLowerCase().slice(0, 20))) ||
        (qLower.includes('lk-99') && p.id === 'lk99_superconductor') ||
        (qLower.includes('lk99') && p.id === 'lk99_superconductor') ||
        (qLower.includes('deepseek') && p.id === 'deepseek_r1') ||
        (qLower.includes('alphafold') && p.id === 'alphafold3_nature') ||
        (qLower.includes('transformer') && p.id === 'attention_transformers') ||
        (qLower.includes('sycamore') && p.id === 'quantum_supremacy') ||
        (qLower.includes('usrils') && p.id === 'usrils_paper')
      );
      if (matched) {
        finalUploadedFile = matched;
        setActivePaper(matched);
      }
    }

    setIsLoading(true);
    setActiveSection('investigation');
    setDossier(null);
    setTruthScore(null);
    setLogs([]);
    setSources([]);
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);

    try {
      const response = await fetch(`${API_BASE}/api/research/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          depth,
          api_keys: apiKeys,
          research_file_text: finalUploadedFile?.full_text || null,
          research_filename: finalUploadedFile?.filename || null,
          research_paper: finalUploadedFile || null
        })
      });

      if (!response.body) {
        throw new Error('No readable stream received from Veritas API');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let subqueryPositions: Record<string, { x: number; y: number; centerX: number }> = {};
      let subquerySourceCount: Record<string, number> = {};
      let claimIndex = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const subLines = block.split('\n');
          for (const subLine of subLines) {
            const line = subLine.trim();
            if (!line.startsWith('data:')) continue;

            try {
              const jsonStr = line.replace(/^data:\s*/, '');
              const parsed = JSON.parse(jsonStr);
              const evt = parsed.event;
              const data = parsed.data;

            if (evt === 'agent_log') {
              setLogs((prev) => [
                ...prev,
                {
                  id: `log_${Date.now()}_${Math.random()}`,
                  agent: data.agent,
                  level: data.level,
                  message: data.message,
                  timestamp: new Date().toLocaleTimeString()
                }
              ]);
            } else if (evt === 'subqueries_spawned') {
              const sqList: SubQuery[] = data.subqueries || [];
              const newNodes: Node[] = [];
              const newEdges: Edge[] = [];

              // Overall graph canvas center
              const canvasCenterX = 880;

              // Tier 1: Root Node (centered, width 420px)
              newNodes.push({
                id: 'root',
                type: 'root',
                position: { x: canvasCenterX - 210, y: 40 },
                data: { label: query, metadata: { title: query } }
              });

              // Tier 2: Subquery Nodes (4 distinct columns, width 320px)
              const totalSq = sqList.length;
              const colSpacing = 440; // 440px between column centers
              const totalColWidth = (totalSq - 1) * colSpacing;
              const startColCenterX = canvasCenterX - totalColWidth / 2;

              sqList.forEach((sq, idx) => {
                const colCenterX = startColCenterX + idx * colSpacing;
                const posX = colCenterX - 160; // center the 320px node
                const posY = 260;

                subqueryPositions[sq.id] = { x: posX, y: posY, centerX: colCenterX };
                subquerySourceCount[sq.id] = 0;

                newNodes.push({
                  id: sq.id,
                  type: 'subquery',
                  position: { x: posX, y: posY },
                  data: {
                    label: sq.display_label,
                    metadata: {
                      angle: sq.angle,
                      rationale: sq.rationale,
                      query: sq.query
                    }
                  }
                });

                newEdges.push({
                  id: `edge_root_${sq.id}`,
                  source: 'root',
                  target: sq.id,
                  label: sq.angle,
                  animated: true
                });
              });

              setNodes(newNodes);
              setEdges(newEdges);
            } else if (evt === 'source_discovered') {
              const src: SourceDoc = data.source;
              setSources((prev) => [...prev, src]);

              const sqId = src.subquery_id || '';
              const sqInfo = subqueryPositions[sqId] || { x: 720, y: 260, centerX: 880 };
              const count = subquerySourceCount[sqId] || 0;
              subquerySourceCount[sqId] = count + 1;

              // Tier 3: Sources stacked directly under their parent subquery vector
              // Source card width is 300px, centered on colCenterX
              const srcX = sqInfo.centerX - 150;
              const srcY = 460 + count * 115;

              setNodes((prev) => [
                ...prev,
                {
                  id: src.id,
                  type: 'source',
                  position: { x: srcX, y: srcY },
                  data: {
                    label: src.domain,
                    metadata: {
                      title: src.title,
                      url: src.url,
                      domain: src.domain,
                      score: src.credibility_score,
                      tier: src.credibility_tier,
                      bias: src.bias_indicator,
                      snippet: src.snippet
                    }
                  }
                }
              ]);

              setEdges((prev) => [
                ...prev,
                {
                  id: `edge_${sqId}_${src.id}`,
                  source: sqId,
                  target: src.id,
                  animated: false,
                  style: { stroke: 'rgba(56, 189, 248, 0.4)' }
                }
              ]);
            } else if (evt === 'claim_analyzed') {
              const cl: AnalyzedClaim = data.claim;

              // Tier 4: Claims arranged in a clean 3-column grid below all sources
              // Canvas spans ~1760px. 3 columns centered at 310, 880, 1450.
              // Claim node width: 420px. Top-left cX = center - 210.
              const colCenters = [310, 880, 1450];
              const cCol = claimIndex % 3;
              const cRow = Math.floor(claimIndex / 3);
              claimIndex++;

              const cX = colCenters[cCol] - 210;
              const cY = 1040 + cRow * 190;

              setNodes((prev) => [
                ...prev,
                {
                  id: cl.id,
                  type: 'claim',
                  category: cl.category,
                  position: { x: cX, y: cY },
                  data: {
                    label: cl.claim_text,
                    category: cl.category,
                    metadata: {
                      claim_text: cl.claim_text,
                      category: cl.category,
                      confidence: cl.confidence,
                      reasoning: cl.reasoning,
                      fallacies: cl.fallacies_detected
                    }
                  }
                }
              ]);

              setEdges((prev) => [
                ...prev,
                {
                  id: `edge_claim_${cl.id}`,
                  source: 'root',
                  target: cl.id,
                  animated: true,
                  style: {
                    stroke: cl.category === 'VERIFIED_FACT' ? '#10b981' : (cl.category === 'DEBUNKED_FALSEHOOD' ? '#f43f5e' : '#f59e0b'),
                    strokeDasharray: 4
                  }
                }
              ]);
            } else if (evt === 'dossier_ready') {
              const rep: DossierReport = data.dossier;
              setDossier(rep);
              setTruthScore(rep.truth_score);

              // Tier 5: Final Verdict node placed centered below ALL claims
              const totalClaimRows = Math.ceil(claimIndex / 3) || 1;
              const verdictY = 1040 + totalClaimRows * 190 + 70;
              const verdictX = 880 - 230; // center the 460px verdict node

              setNodes((prev) => [
                ...prev,
                {
                  id: 'verdict',
                  type: 'verdict',
                  position: { x: verdictX, y: verdictY },
                  data: {
                    label: `VERDICT: ${rep.verdict}`,
                    metadata: {
                      verdict: rep.verdict,
                      truth_score: rep.truth_score,
                      summary: rep.executive_summary
                    }
                  }
                }
              ]);

              setEdges((prev) => [
                ...prev,
                {
                  id: 'edge_root_verdict',
                  source: 'root',
                  target: 'verdict',
                  animated: true,
                  style: { stroke: rep.truth_score >= 60 ? '#10b981' : '#f43f5e', strokeWidth: 3 }
                }
              ]);
            } else if (evt === 'complete') {
              setIsLoading(false);
            }
          } catch (pe) {
            console.error('Error parsing SSE line:', pe, line);
          }
        }
      }
    }
  } catch (err: any) {
      console.error('Investigation error:', err);
      setLogs((prev) => [
        ...prev,
        {
          id: `log_err_${Date.now()}`,
          agent: 'Orchestrator',
          level: 'DANGER',
          message: `Investigation halted: ${err.message || 'API connection failed. Make sure the backend is running.'}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKeys]);

  const handleExportDossier = () => {
    if (!dossier) return;
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      <div className="cyber-bg-overlay" />

      {/* Veritas Left Navigation Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isLoading={isLoading}
        truthScore={truthScore}
        sourcesCount={sources.length}
        hasPaper={!!activePaper}
        hasDossier={!!dossier}
        apiKeys={apiKeys}
      />

      {/* Main Right Content Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top Header */}
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExportDossier={handleExportDossier}
          hasDossier={!!dossier}
          truthScore={truthScore}
          sourcesCount={sources.length}
          activeSection={activeSection}
          apiKeys={apiKeys}
          isLoading={isLoading}
          activePaper={activePaper}
        />

        {/* Module 1: Live Fact-Check & 60-Sec Demo Presets */}
        {activeSection === 'search' && (
          <SearchHero
            onSearch={(q, d) => handleStartInvestigation(q, d, null)}
            isLoading={isLoading}
            presets={presets}
            onNavigateToPaperLab={() => setActiveSection('paper-lab')}
          />
        )}

        {/* Module 2: Global Misinformation Radar */}
        {activeSection === 'radar-feed' && (
          <GlobalRadarFeed
            onDispatchInvestigation={(q, d, paper) => handleStartInvestigation(q, d, paper)}
            isLoading={isLoading}
            uploadedPapers={uploadedPapers}
            onUploadPaper={handleAddUploadedPaper}
          />
        )}

        {/* Module 3: Dedicated Research Paper Lab */}
        {activeSection === 'paper-lab' && (
          <ResearchPaperLab
            onStartInvestigation={(q, d, paper) => handleStartInvestigation(q, d, paper)}
            isLoading={isLoading}
            activePaper={activePaper}
            onPaperChange={(p) => {
              setActivePaper(p);
              if (p) handleAddUploadedPaper(p);
            }}
          />
        )}

        {/* Module 4: Paper Clash Arena */}
        {activeSection === 'paper-clash' && (
          <PaperClashArena
            onDispatchInvestigation={(q, d, paper) => handleStartInvestigation(q, d, paper)}
            isLoading={isLoading}
            uploadedPapers={uploadedPapers}
            onUploadPaper={handleAddUploadedPaper}
          />
        )}

        {/* Module 5: Autonomous Agent Swarm Telemetry */}
        {activeSection === 'agent-swarm' && (
          <AgentSwarmTelemetry />
        )}

        {/* Module 6: Cryptographic Truth Vault */}
        {activeSection === 'vault' && (
          <CryptographicVault
            onInspectCertificate={(cert) => setVaultSelectedCert(cert)}
            onDispatchInvestigation={(q, d) => handleStartInvestigation(q, d, null)}
            isLoading={isLoading}
          />
        )}

        {/* Module 7: Thought Canvas & Live Terminal & Dossier */}
        {activeSection === 'investigation' && (
          <main style={{
            maxWidth: '1720px',
            width: '100%',
            margin: '0 auto',
            padding: '20px 28px 40px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1
          }}>
            {/* If no investigation has been started yet */}
            {nodes.length === 0 && !isLoading && !dossier ? (
              <div style={{
                margin: '60px auto',
                maxWidth: '680px',
                padding: '48px 32px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                background: 'rgba(15, 23, 42, 0.65)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(0, 242, 254, 0.1)',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan-neon)',
                  boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)'
                }}>
                  <Cpu size={28} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>
                  No Active Investigation Running
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  Start a fact-check by submitting a query in <strong>Live Fact-Check</strong> or upload a PDF document in the dedicated <strong>Research Paper Lab</strong>.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={() => setActiveSection('search')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid var(--cyan-primary)',
                      color: 'var(--cyan-neon)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Compass size={15} />
                    <span>Open Live Fact-Check & Presets</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('paper-lab')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid var(--emerald-border)',
                      color: 'var(--emerald-success)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={15} />
                    <span>Open Research Paper Lab</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Real-time ML Inference & Telemetry Drawer */}
                <MLTelemetryDrawer
                  isLoading={isLoading}
                  truthScore={truthScore}
                  sourcesCount={sources.length}
                  apiKeys={apiKeys}
                  dossier={dossier}
                />

                {/* Layout Mode Selector Toolbar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff' }}>
                      🧠 Autonomous Thought Canvas & Live Terminal
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      (Click any node to open the Inspector Drawer)
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.8)',
                    padding: '3px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    gap: '4px'
                  }}>
                    <button
                      onClick={() => setViewMode('expanded-graph')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: viewMode === 'expanded-graph' ? 'var(--cyan-primary)' : 'transparent',
                        color: viewMode === 'expanded-graph' ? '#07090e' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      Wide Graph (75%)
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: viewMode === 'split' ? 'var(--cyan-primary)' : 'transparent',
                        color: viewMode === 'split' ? '#07090e' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      Balanced Split (60/40)
                    </button>
                    <button
                      onClick={() => setViewMode('expanded-terminal')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: viewMode === 'expanded-terminal' ? 'var(--cyan-primary)' : 'transparent',
                        color: viewMode === 'expanded-terminal' ? '#07090e' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      Wide Terminal
                    </button>
                  </div>
                </div>

                {/* Graph + Terminal Split View with Large Sizing */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'expanded-graph' 
                    ? 'minmax(0, 3.2fr) minmax(320px, 1.1fr)' 
                    : (viewMode === 'expanded-terminal' 
                      ? 'minmax(0, 1fr) minmax(420px, 1.5fr)' 
                      : 'minmax(0, 1.8fr) minmax(360px, 1fr)'),
                  gap: '20px',
                  height: '800px',
                  minHeight: '800px',
                  maxHeight: '800px',
                  overflow: 'hidden'
                }}>
                  {/* React Flow Thought Canvas */}
                  <div style={{ height: '100%', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
                      <GraphView
                        nodes={nodes}
                        edges={edges}
                        onNodeClick={(node) => setSelectedNode(node)}
                      />
                    </div>
                  </div>

                  {/* Real-Time Agent Activity Terminal */}
                  <div style={{ height: '100%', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <AgentActivityStream
                        logs={logs}
                        isInvestigating={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Investigative Dossier Section */}
                {dossier && (
                  <div style={{ marginTop: '32px', width: '100%', position: 'relative', clear: 'both' }}>
                    <DossierView dossier={dossier} />
                  </div>
                )}
              </>
            )}
          </main>
        )}
      </div>

      {/* Node Inspector Drawer */}
      <NodeInspectorModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        keys={apiKeys}
        onSaveKeys={handleSaveKeys}
      />

      {/* Vault Certificate Inspection Modal */}
      <CertificateModal
        isOpen={!!vaultSelectedCert}
        certificate={vaultSelectedCert}
        onClose={() => setVaultSelectedCert(null)}
      />
    </div>
  );
}

export default App;
