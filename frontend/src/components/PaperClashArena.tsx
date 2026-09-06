import React, { useState, useRef } from 'react';
import {
  Swords,
  Award,
  Send,
  UploadCloud,
  FileText,
  ArrowRightLeft,
  Sparkles,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { ResearchUploadedFile, PaperClashItem, ClashPaperProfile } from '../types';
import { BENCHMARK_PAPERS } from './ResearchPaperLab';

// Extended catalog of benchmark papers formatted as Clash Profiles
const BENCHMARK_CLASH_PROFILES: Record<string, ClashPaperProfile> = {
  transformer: {
    title: 'Attention Is All You Need (Transformer)',
    authors: 'Vaswani et al. (Google Brain / Google Research)',
    venue: 'NeurIPS 2017 (140,000+ Citations)',
    empiricalScore: 97,
    sampleSize: 'Global standard across all modern LLMs (GPT-4, Gemini, Claude)',
    coreHypothesis: 'Multi-head dot-product self-attention eliminates recurrence and convolutions entirely, enabling massive parallelization.',
    reproducibility: '100% Empirically Replicated Industry-Wide',
    keyPros: [
      'Massive associative memory recall across dense contexts',
      'Proven scaling laws across trillion-parameter frontiers',
      'Highly optimized GPU tensor core kernels (FlashAttention)'
    ],
    rawPaperId: 'attention_transformers'
  },
  mamba: {
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: 'Gu & Dao (Carnegie Mellon & Princeton)',
    venue: 'ArXiv 2023 / ICML 2024 (2,200+ Citations)',
    empiricalScore: 84,
    sampleSize: 'Evaluated up to 3B parameters & 1M token contexts',
    coreHypothesis: 'Selective state spaces process sequences in linear time O(N) by filtering irrelevant context dynamically.',
    reproducibility: 'Independently Replicated in Open Source (Mamba-2)',
    keyPros: [
      '5x higher throughput during inference decoding',
      'Memory footprint scales linearly O(1) in state memory',
      'Solves quadratic bottleneck for ultra-long context horizons'
    ]
  },
  deepseek_r1: {
    title: 'DeepSeek-R1: Incentivizing Reasoning Capability via RL',
    authors: 'DeepSeek-AI Team (Guo, Yang, Zhang et al.)',
    venue: 'arXiv:2501.12948 (Jan 2025)',
    empiricalScore: 95,
    sampleSize: '79.8% pass@1 on AIME 2024; 97.3% on MATH-500',
    coreHypothesis: 'Pure reinforcement learning without initial supervised fine-tuning induces advanced self-correction and reflection.',
    reproducibility: 'Open Weights & Globally Verified Across AI Community',
    keyPros: [
      'Rivals OpenAI-o1 reasoning performance at open-weights accessibility',
      'Emergence of natural chain-of-thought verification without SFT',
      'High sample efficiency in distillation to smaller 1.5B–70B models'
    ],
    rawPaperId: 'deepseek_r1'
  },
  openai_o1_baseline: {
    title: 'OpenAI o1 System Card: Reasoning via Deliberative Chain of Thought',
    authors: 'OpenAI Frontier Alignment & Reasoning Team',
    venue: 'OpenAI Technical Release (Dec 2024)',
    empiricalScore: 96,
    sampleSize: 'Top percentile in competitive Olympiad-level code & math',
    coreHypothesis: 'Hidden internal chains of thought trained via reinforcement learning dramatically reduce reasoning hallucination.',
    reproducibility: 'Commercial API verified; proprietary weights & training recipe',
    keyPros: [
      'Pioneer of test-time compute scaling laws',
      'Dominant performance in PhD-level science benchmarks (GPQA Diamond)',
      'Extensive reinforcement learning safety filtering'
    ]
  },
  lk99_superconductor: {
    title: 'The First Room-Temperature Ambient-Pressure Superconductor (LK-99)',
    authors: 'Lee, Kim, Kwon et al. (Quantum Energy Research Centre)',
    venue: 'ArXiv Preprint 2023',
    empiricalScore: 18,
    sampleSize: 'Small modified lead-apatite crystal pellets (Cu-doped)',
    coreHypothesis: 'Pb10-xCux(PO4)6O exhibits Meissner effect levitation and zero resistance at room temperature T > 400K.',
    reproducibility: 'Failed Global Replication (MPI, Nature, Princeton, CAS)',
    keyPros: [
      'Historic theoretical promise of ambient electrical transmission',
      'Initial partial flux pinning visual demonstrations'
    ],
    rawPaperId: 'lk99_superconductor'
  },
  lk99_nature_rebuttal: {
    title: 'LK-99 Is Not a Superconductor: Phase Transition of Cu2S Impurities',
    authors: 'Max Planck Institute & International Physics Consortium',
    venue: 'Nature 2023 / Condensed Matter Consortium',
    empiricalScore: 98,
    sampleSize: 'Single-crystal pure Pb10-xCux(PO4)6O without Cu2S contamination',
    coreHypothesis: 'Apparent resistivity drops were caused by copper sulfide (Cu2S) structural phase transition at 104°C, not superconductivity.',
    reproducibility: 'Universally Corroborated by 12+ Premier Labs Worldwide',
    keyPros: [
      'Exact thermodynamic explanation for false resistance artifacts',
      'Ferromagnetic half-levitation explained by diamagnetism',
      'Definitive peer-reviewed closure of the controversy'
    ]
  },
  alphafold3: {
    title: 'Accurate Structure Prediction of Biomolecular Interactions with AlphaFold 3',
    authors: 'Abramson et al. (Google DeepMind & Isomorphic Labs)',
    venue: 'Nature 630, 493–500 (May 2024)',
    empiricalScore: 96,
    sampleSize: 'Evaluated across proteins, nucleic acids, small molecules, ions',
    coreHypothesis: 'A unified diffusion module operating directly on 3D atomic coordinates predicts joint multi-molecular complexes with >50% accuracy gains.',
    reproducibility: 'Independently Replicated in Open Source (OpenFold3, Chai-1)',
    keyPros: [
      'Eliminates requirement for physics molecular docking potentials',
      'Accurate joint prediction across DNA, RNA, ligands, and ions',
      'Revolutionizes computational pharmacology and drug discovery'
    ],
    rawPaperId: 'alphafold3_nature'
  },
  classical_physics_docking: {
    title: 'Classical Molecular Dynamics & Cryo-EM Force Field Docking',
    authors: 'Biophysical Consortium Standard Protocols',
    venue: 'Biophysical Journal / PDB Standards',
    empiricalScore: 88,
    sampleSize: 'Decades of empirical experimental crystallography & NMR assays',
    coreHypothesis: 'Thermodynamic empirical energy potentials and Cryo-EM experimental density maps provide ground-truth physical conformations.',
    reproducibility: 'Exhaustively Validated Across Decades of Structural Biology',
    keyPros: [
      'Ground truth based on physical laws and thermodynamic free energy',
      'Direct experimental observation of atomic electron density',
      'No deep learning hallucination risk in novel binding pockets'
    ]
  },
  quantum_sycamore: {
    title: 'Quantum Supremacy Using a Programmable Superconducting Processor',
    authors: 'Frank Arute et al. (Google Quantum AI)',
    venue: 'Nature 574, 505–510 (Oct 2019)',
    empiricalScore: 91,
    sampleSize: '53-qubit Sycamore superconducting processor',
    coreHypothesis: 'Sycamore samples a random quantum circuit in 200 seconds that would require 10,000 years on classical supercomputers.',
    reproducibility: 'Contested by IBM tensor network classical algorithms',
    keyPros: [
      'Landmark experimental milestone for programmable superconducting qubits',
      'Demonstrates high two-qubit gate fidelities (99.3%) at scale',
      'Pioneered cross-entropy benchmarking (XEB)'
    ],
    rawPaperId: 'quantum_supremacy'
  },
  usrils_paper: {
    title: 'Unified Self-Regulating Intelligent Learning System (USRILS)',
    authors: 'P. Sikdar et al.',
    venue: 'Adaptive Intelligent Systems & Machine Learning Research (2025)',
    empiricalScore: 92,
    sampleSize: 'Distributed heterogeneous neural processing nodes',
    coreHypothesis: 'Closed-loop self-regulating feedback mechanisms stabilize distributed convergence with a 24% reduction in parameter oscillation.',
    reproducibility: 'Empirically Validated in Simulated Non-Stationary Environments',
    keyPros: [
      'Dynamic resource balancing across heterogeneous nodes',
      'Significantly higher sample efficiency under non-stationary distributions',
      'Closed-loop self-regulation suppresses catastrophic forgetting'
    ],
    rawPaperId: 'usrils_paper'
  }
};

const CURATED_CLASH_PRESETS: PaperClashItem[] = [
  {
    id: 'clash-1',
    title: 'Transformers vs. Mamba',
    subtitle: 'Quadratic Self-Attention Mechanism vs. Linear Selective State Space Models',
    category: 'Computer Science & AI',
    paperA: BENCHMARK_CLASH_PROFILES.transformer,
    paperB: BENCHMARK_CLASH_PROFILES.mamba,
    arbiterVerdict: {
      winner: 'Paper A',
      verdictLabel: 'Transformers Retain Empirical Dominance (Hybrid Mamba Emerging)',
      consensusSummary: 'While Mamba demonstrates undeniable theoretical efficiency at long contexts, Transformers remain the empirically superior architecture for complex multi-step associative reasoning.',
      recommendedTargetQuery: 'Attention Is All You Need Transformer vs Mamba selective state space models empirical benchmark reasoning comparison'
    }
  },
  {
    id: 'clash-2',
    title: 'LK-99 Ambient Superconductivity vs. Condensed Matter Consensus',
    subtitle: 'Room-Temperature Zero-Resistance Claim vs. Global Experimental Falsification',
    category: 'Condensed Matter Physics',
    paperA: BENCHMARK_CLASH_PROFILES.lk99_superconductor,
    paperB: BENCHMARK_CLASH_PROFILES.lk99_nature_rebuttal,
    arbiterVerdict: {
      winner: 'Paper B',
      verdictLabel: 'LK-99 Fully Debunked (Falsification Verified)',
      consensusSummary: 'The international condensed matter physics consensus definitively concluded that LK-99 is an insulator with copper sulfide impurities, completely disproving ambient superconductivity.',
      recommendedTargetQuery: 'LK-99 room temperature superconductor debunked Max Planck Institute Nature consensus falsification'
    }
  },
  {
    id: 'clash-3',
    title: 'DeepSeek-R1 vs. Proprietary Chain-of-Thought (o1)',
    subtitle: 'Pure RL Reasoning Emergence vs. Supervised SFT Distillation',
    category: 'Reasoning & Foundation Models',
    paperA: BENCHMARK_CLASH_PROFILES.deepseek_r1,
    paperB: BENCHMARK_CLASH_PROFILES.openai_o1_baseline,
    arbiterVerdict: {
      winner: 'Paper A',
      verdictLabel: 'Pure RL Self-Correction Validated Industry-Wide',
      consensusSummary: 'DeepSeek-R1 demonstrated that large-scale pure RL without initial SFT successfully induces competitive multi-step self-verification, democratizing reasoning research with open weights.',
      recommendedTargetQuery: 'DeepSeek-R1 pure reinforcement learning reasoning vs OpenAI o1 chain of thought benchmarks verification'
    }
  },
  {
    id: 'clash-4',
    title: 'AlphaFold 3 vs. Classical Molecular Docking',
    subtitle: 'Direct 3D Coordinate Diffusion vs. Thermodynamic Energy Potentials',
    category: 'Structural Biology & Biophysics',
    paperA: BENCHMARK_CLASH_PROFILES.alphafold3,
    paperB: BENCHMARK_CLASH_PROFILES.classical_physics_docking,
    arbiterVerdict: {
      winner: 'Paper A',
      verdictLabel: 'Diffusion-Based Biomolecular Prediction Supersedes Classical Potentials',
      consensusSummary: 'AlphaFold 3 achieves unprecedented cross-molecular dockings (>50% improvements) surpassing traditional physics-based energy algorithms, though experimental Cryo-EM remains the ultimate ground truth.',
      recommendedTargetQuery: 'AlphaFold 3 diffusion architecture vs classical molecular docking Cryo-EM validation Nature 2024'
    }
  },
  {
    id: 'clash-5',
    title: 'Google Sycamore vs. IBM Summit Classical Frontier',
    subtitle: '53-Qubit Quantum Advantage vs. Tensor Network Supercomputing',
    category: 'Quantum Computing',
    paperA: BENCHMARK_CLASH_PROFILES.quantum_sycamore,
    paperB: {
      title: 'Simulating the Sycamore Quantum Circuit in Classical Supercomputers',
      authors: 'Pednault et al. (IBM Quantum / Research)',
      venue: 'arXiv:1910.09534 (Oct 2019)',
      empiricalScore: 89,
      sampleSize: 'Oak Ridge Summit Supercomputer with secondary RAM staging',
      coreHypothesis: 'Classical tensor network algorithms with secondary disk storage can simulate the Sycamore circuit in 2.5 days, not 10,000 years.',
      reproducibility: 'Independently Corroborated by Chinese Academy of Sciences',
      keyPros: [
        'Exposes classical algorithm optimization frontiers',
        'Refined criteria for quantum computational advantage claims'
      ]
    },
    arbiterVerdict: {
      winner: 'EQUALLY_CONTESTED',
      verdictLabel: 'Contested Supremacy Frontier (Classical Simulation Accelerated)',
      consensusSummary: 'While Google demonstrated remarkable physical quantum coherence, classical tensor-network optimizations severely reduced the gap, framing quantum advantage as a moving frontier.',
      recommendedTargetQuery: 'Google Sycamore quantum computational supremacy vs IBM Summit classical tensor network debate'
    }
  },
  {
    id: 'clash-6',
    title: 'USRILS Cognitive System vs. Standard Distributed RL',
    subtitle: 'Closed-Loop Multi-Agent Self-Regulation vs. Static Parameter Updates',
    category: 'Cognitive AI & Optimization',
    paperA: BENCHMARK_CLASH_PROFILES.usrils_paper,
    paperB: {
      title: 'Asynchronous Methods for Deep Reinforcement Learning (A3C / PPO)',
      authors: 'Mnih et al. (DeepMind)',
      venue: 'ICML Standard Baseline',
      empiricalScore: 88,
      sampleSize: 'Multi-threaded CPU/GPU actor-critic policy gradients',
      coreHypothesis: 'Asynchronous parallel policy gradients stabilize training over complex reward landscapes.',
      reproducibility: 'Universally Replicated in Torch/TensorFlow Ecosystems',
      keyPros: [
        'Robust baseline for continuous action spaces',
        'Simplicity of parallel worker rollout architectures'
      ]
    },
    arbiterVerdict: {
      winner: 'Paper A',
      verdictLabel: 'USRILS Demonstrates Superior Variance Reduction in Non-Stationary Environments',
      consensusSummary: 'Dynamic cognitive feedback regulation achieves a 24% reduction in parameter oscillation over standard distributed RL baselines.',
      recommendedTargetQuery: 'Unified Self-Regulating Intelligent Learning System USRILS multi-agent optimization empirical results'
    }
  }
];

// Helper to convert an uploaded file into a ClashPaperProfile
function convertUploadedToProfile(file: ResearchUploadedFile): ClashPaperProfile {
  return {
    title: file.title || file.filename,
    authors: file.authors || 'Uploaded Manuscript Author(s)',
    venue: file.venue || (file.page_count ? `Manuscript (${file.page_count} pages • ${file.word_count.toLocaleString()} words)` : 'Custom Research Upload'),
    empiricalScore: 85,
    sampleSize: file.word_count ? `${file.word_count.toLocaleString()} words audited` : 'Parsed document content',
    coreHypothesis: file.abstract_summary
      ? file.abstract_summary.slice(0, 240) + (file.abstract_summary.length > 240 ? '...' : '')
      : (file.preview ? file.preview.slice(0, 220) : 'Author claims submitted for cross-examination.'),
    reproducibility: 'Uploaded Manuscript (Undergoing Swarm Cross-Examination)',
    keyPros: file.key_assertions && file.key_assertions.length > 0
      ? file.key_assertions.slice(0, 3)
      : ['Primary user-submitted research manuscript', 'Author methodology extracted for empirical verification'],
    rawPaperId: file.id,
    fullText: file.full_text
  };
}

interface PaperClashArenaProps {
  onDispatchInvestigation: (
    query: string,
    depth: 'quick' | 'deep' | 'exhaustive',
    uploadedFile?: ResearchUploadedFile | null
  ) => void;
  isLoading: boolean;
  uploadedPapers?: ResearchUploadedFile[];
  onUploadPaper?: (paper: ResearchUploadedFile) => void;
}

export const PaperClashArena: React.FC<PaperClashArenaProps> = ({
  onDispatchInvestigation,
  isLoading,
  uploadedPapers = [],
  onUploadPaper
}) => {
  // Arena Mode: 'presets' | 'custom' | 'upload_clash'
  const [arenaMode, setArenaMode] = useState<'presets' | 'custom' | 'upload_clash'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<PaperClashItem>(CURATED_CLASH_PRESETS[0]);

  // Custom Duel state
  const [paperA, setPaperA] = useState<ClashPaperProfile>(BENCHMARK_CLASH_PROFILES.transformer);
  const [paperB, setPaperB] = useState<ClashPaperProfile>(BENCHMARK_CLASH_PROFILES.mamba);
  const [activeSideSelector, setActiveSideSelector] = useState<'A' | 'B' | null>(null);
  const [selectorTab, setSelectorTab] = useState<'benchmarks' | 'uploaded' | 'upload_new'>('benchmarks');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  // Active papers to display based on mode
  const activePaperA = arenaMode === 'presets' ? selectedPreset.paperA : paperA;
  const activePaperB = arenaMode === 'presets' ? selectedPreset.paperB : paperB;

  // Swap rivals
  const handleSwapRivals = () => {
    if (arenaMode === 'presets') {
      setPaperA(selectedPreset.paperB);
      setPaperB(selectedPreset.paperA);
      setArenaMode('custom');
    } else {
      const temp = { ...paperA };
      setPaperA({ ...paperB });
      setPaperB(temp);
    }
  };

  // Upload handler for Paper Alpha or Beta
  const handleFileUpload = async (file: File, targetSide: 'A' | 'B') => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessNotice(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('http://127.0.0.1:8000/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await resp.json();
      if (data.status === 'success' && data.file) {
        const uploadedFile: ResearchUploadedFile = data.file;
        const profile = convertUploadedToProfile(uploadedFile);
        if (targetSide === 'A') {
          setPaperA(profile);
        } else {
          setPaperB(profile);
        }
        if (onUploadPaper) {
          onUploadPaper(uploadedFile);
        }
        // Switch to custom view so the user immediately sees the uploaded paper's results side-by-side
        setArenaMode('custom');
        setActiveSideSelector(null);
        setUploadSuccessNotice(`✓ Successfully parsed ${file.name} for Paper ${targetSide}! Empirical thesis and assertions extracted.`);
        setTimeout(() => setUploadSuccessNotice(null), 5000);
      } else {
        setUploadError(data.message || 'Could not parse uploaded research paper');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Network error while uploading file');
    } finally {
      setIsUploading(false);
      if (fileInputRefA.current) fileInputRefA.current.value = '';
      if (fileInputRefB.current) fileInputRefB.current.value = '';
    }
  };

  // Synthesize dynamic clash query
  const getDynamicClashQuery = () => {
    if (arenaMode === 'presets') {
      return selectedPreset.arbiterVerdict.recommendedTargetQuery;
    }
    return `"${activePaperA.title}" vs "${activePaperB.title}": empirical benchmark comparison, author thesis cross-examination, and reproducibility consensus`;
  };

  // Dispatch the clash
  const handleRunClash = () => {
    const query = getDynamicClashQuery();
    let fileContext: ResearchUploadedFile | null = null;
    if (activePaperA.fullText || activePaperA.rawPaperId) {
      const foundBenchmark = BENCHMARK_PAPERS.find(p => p.id === activePaperA.rawPaperId);
      if (foundBenchmark) {
        fileContext = foundBenchmark;
      } else if (activePaperA.fullText) {
        fileContext = {
          filename: activePaperA.title + '.pdf',
          title: activePaperA.title,
          authors: activePaperA.authors,
          venue: activePaperA.venue,
          page_count: 10,
          word_count: 5000,
          abstract_summary: activePaperA.coreHypothesis,
          key_assertions: activePaperA.keyPros,
          preview: activePaperA.coreHypothesis,
          full_text: activePaperA.fullText,
          suggested_query: query
        };
      }
    }
    onDispatchInvestigation(query, 'exhaustive', fileContext);
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
      {/* Hidden File Inputs for Instant Native Uploading */}
      <input
        ref={fileInputRefA}
        type="file"
        accept=".pdf,.txt,.md"
        style={{ display: 'none' }}
        disabled={isUploading}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0], 'A');
          }
        }}
      />
      <input
        ref={fileInputRefB}
        type="file"
        accept=".pdf,.txt,.md"
        style={{ display: 'none' }}
        disabled={isUploading}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0], 'B');
          }
        }}
      />

      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '24px 28px',
        borderRadius: 'var(--radius-xl)',
        background: 'radial-gradient(ellipse at top left, rgba(168, 85, 247, 0.15) 0%, rgba(15, 23, 42, 0.85) 75%)',
        border: '1.5px solid rgba(168, 85, 247, 0.35)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(0, 242, 254, 0.3) 100%)',
            border: '1.5px solid rgba(168, 85, 247, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--violet-neon)',
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.35)'
          }}>
            <Swords size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--violet-neon)'
              }}>
                Dual Research Paper Cross-Examiner
              </span>
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(0, 242, 254, 0.15)',
                color: 'var(--cyan-neon)',
                fontWeight: 700
              }}>
                Methodology Duel & Arbitration
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
              Paper Clash: Scientific Consensus Arena
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Side-by-side comparative cross-examination evaluating rival author hypotheses against empirical web replication.
            </p>
          </div>
        </div>

        {/* Action Button to run the clash */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleRunClash}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
            color: '#07090e',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 22px rgba(168, 85, 247, 0.5)',
            transition: 'all 0.15s'
          }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span>{isLoading ? 'Swarm Cross-Examining...' : '🚀 Run Full Veritas Swarm on Clash'}</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {uploadSuccessNotice && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          color: 'var(--emerald-success)',
          fontSize: '13px',
          fontWeight: 700
        }}>
          <CheckCircle2 size={18} />
          <span>{uploadSuccessNotice}</span>
        </div>
      )}

      {/* Error Banner */}
      {uploadError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1.5px solid rgba(244, 63, 94, 0.4)',
          color: '#fb7185',
          fontSize: '13px'
        }}>
          <AlertTriangle size={18} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* FRONT & CENTER DUAL PAPER UPLOAD CONSOLE */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 'var(--radius-xl)',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1.5px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} color="var(--cyan-neon)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0 }}>
              Direct Paper Upload & Matchup Station
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Upload your own PDF/TXT research papers to immediately see them clashing with live empirical extraction
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Side A Upload Pod */}
          <div
            onClick={() => fileInputRefA.current?.click()}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1.5px dashed rgba(56, 189, 248, 0.4)',
              background: 'rgba(7, 10, 18, 0.65)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan-primary)'
              }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--cyan-primary)', textTransform: 'uppercase' }}>
                  Candidate Paper Alpha
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activePaperA.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Click to upload new PDF / TXT
                </div>
              </div>
            </div>

            <button
              type="button"
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: 'var(--cyan-neon)',
                cursor: 'pointer'
              }}
            >
              Upload Alpha
            </button>
          </div>

          {/* Middle Swap Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleSwapRivals(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                color: 'var(--violet-neon)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <ArrowRightLeft size={14} />
              <span>Swap Rivals</span>
            </button>
          </div>

          {/* Side B Upload Pod */}
          <div
            onClick={() => fileInputRefB.current?.click()}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1.5px dashed rgba(168, 85, 247, 0.4)',
              background: 'rgba(7, 10, 18, 0.65)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--violet-neon)'
              }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--violet-neon)', textTransform: 'uppercase' }}>
                  Candidate Paper Beta (Challenger)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activePaperB.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Click to upload new PDF / TXT
                </div>
              </div>
            </div>

            <button
              type="button"
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: 'var(--violet-neon)',
                cursor: 'pointer'
              }}
            >
              Upload Beta
            </button>
          </div>
        </div>
      </div>

      {/* Arena Mode Switcher Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '12px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setArenaMode('presets')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: arenaMode === 'presets' ? '1.5px solid var(--violet-neon)' : '1px solid transparent',
              background: arenaMode === 'presets' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: arenaMode === 'presets' ? '#fff' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Sparkles size={15} color={arenaMode === 'presets' ? 'var(--violet-neon)' : 'currentColor'} />
            Curated Benchmark Clashes ({CURATED_CLASH_PRESETS.length})
          </button>

          <button
            type="button"
            onClick={() => setArenaMode('custom')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: arenaMode === 'custom' ? '1.5px solid var(--cyan-neon)' : '1px solid transparent',
              background: arenaMode === 'custom' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
              color: arenaMode === 'custom' ? '#fff' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <BookOpen size={15} color={arenaMode === 'custom' ? 'var(--cyan-neon)' : 'currentColor'} />
            Custom Duel (Select Dummy or Uploaded)
          </button>
        </div>

        <button
          type="button"
          onClick={handleSwapRivals}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '6px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: 'var(--cyan-primary)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ArrowRightLeft size={14} />
          <span>⇄ Swap Rivals (Alpha ⟷ Beta)</span>
        </button>
      </div>

      {/* Preset Clashes Selector (when in presets mode) */}
      {arenaMode === 'presets' && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {CURATED_CLASH_PRESETS.map((clash) => (
            <button
              key={clash.id}
              onClick={() => setSelectedPreset(clash)}
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                border: selectedPreset.id === clash.id ? '1.5px solid var(--violet-neon)' : '1px solid var(--border-subtle)',
                background: selectedPreset.id === clash.id ? 'rgba(168, 85, 247, 0.18)' : 'rgba(15, 23, 42, 0.65)',
                color: selectedPreset.id === clash.id ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                flex: '1 1 280px'
              }}
            >
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: selectedPreset.id === clash.id ? 'var(--violet-neon)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                {clash.category}
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, marginTop: '2px', color: '#fff' }}>
                {clash.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {clash.subtitle}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Custom Duel Controls & Paper Chooser Dropdown */}
      {arenaMode === 'custom' && activeSideSelector && (
        <div style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1.5px solid var(--cyan-primary)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                Choose Rival for: {activeSideSelector === 'A' ? 'Candidate Paper Alpha' : 'Candidate Paper Beta (Challenger)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSideSelector(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ✕ Close Selector
            </button>
          </div>

          {/* Selector Tabs: Dummy Benchmarks vs Uploaded vs Upload New */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setSelectorTab('benchmarks')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                background: selectorTab === 'benchmarks' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: selectorTab === 'benchmarks' ? 'var(--cyan-neon)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              📚 Dummy / Benchmark Papers ({Object.keys(BENCHMARK_CLASH_PROFILES).length})
            </button>
            <button
              type="button"
              onClick={() => setSelectorTab('uploaded')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                background: selectorTab === 'uploaded' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                color: selectorTab === 'uploaded' ? 'var(--violet-neon)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              📁 User-Uploaded Papers ({uploadedPapers.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectorTab('upload_new')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                background: selectorTab === 'upload_new' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: selectorTab === 'upload_new' ? 'var(--emerald-success)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              📤 Upload New PDF/TXT File
            </button>
          </div>

          {/* Subview 1: Dummy / Benchmark Papers */}
          {selectorTab === 'benchmarks' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '12px',
              maxHeight: '320px',
              overflowY: 'auto'
            }}>
              {Object.entries(BENCHMARK_CLASH_PROFILES).map(([key, prof]) => (
                <div
                  key={key}
                  onClick={() => {
                    if (activeSideSelector === 'A') setPaperA(prof);
                    else setPaperB(prof);
                    setActiveSideSelector(null);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(11, 17, 30, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--cyan-primary)' }}>
                      {prof.venue.split('(')[0]}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--emerald-success)' }}>
                      Score: {prof.empiricalScore}/100
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                    {prof.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {prof.authors}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subview 2: Previously Uploaded Papers */}
          {selectorTab === 'uploaded' && (
            <div>
              {uploadedPapers.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No uploaded papers found in current session. Upload a PDF/TXT or switch to Benchmark Papers!
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '12px',
                  maxHeight: '320px',
                  overflowY: 'auto'
                }}>
                  {uploadedPapers.map((up, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const prof = convertUploadedToProfile(up);
                        if (activeSideSelector === 'A') setPaperA(prof);
                        else setPaperB(prof);
                        setActiveSideSelector(null);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: 'rgba(11, 17, 30, 0.8)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ fontSize: '11px', color: 'var(--violet-neon)', fontWeight: 700 }}>
                        {up.badge || 'Uploaded Manuscript'}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                        {up.title || up.filename}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {up.authors || up.filename}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subview 3: Direct File Upload */}
          {selectorTab === 'upload_new' && (
            <div style={{
              padding: '24px',
              borderRadius: '10px',
              border: '2px dashed rgba(56, 189, 248, 0.4)',
              background: 'rgba(7, 10, 18, 0.6)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <UploadCloud size={36} color="var(--cyan-primary)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                  Upload Manuscript for {activeSideSelector === 'A' ? 'Paper Alpha' : 'Paper Beta'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supports PDF, TXT, or Markdown files. The Veritas engine extracts hypotheses and metrics automatically.
                </div>
              </div>

              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)',
                color: '#07090e',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }}>
                {isUploading ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                <span>{isUploading ? 'Parsing Research Paper...' : 'Choose File to Upload'}</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  style={{ display: 'none' }}
                  disabled={isUploading}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0], activeSideSelector || 'A');
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Dual Paper Duel View */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '20px'
      }}>
        {/* Paper A Card */}
        <div style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(11, 17, 30, 0.95)',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 10px',
                borderRadius: '9999px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--cyan-primary)',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                Candidate Paper Alpha
              </span>

              <button
                type="button"
                onClick={() => fileInputRefA.current?.click()}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: 'var(--cyan-neon)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <UploadCloud size={12} />
                <span>Upload PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setArenaMode('custom');
                  setActiveSideSelector('A');
                  setSelectorTab('benchmarks');
                }}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: 'var(--cyan-primary)',
                  cursor: 'pointer'
                }}
              >
                Pick Preset ▾
              </button>
            </div>

            <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--cyan-neon)' }}>
              {activePaperA.empiricalScore} / 100 Empirical
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0, lineHeight: '1.3' }}>
              {activePaperA.title}
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {activePaperA.authors} • <em>{activePaperA.venue}</em>
            </div>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: '8px',
            background: 'rgba(7, 10, 18, 0.7)',
            borderLeft: '3px solid var(--cyan-primary)'
          }}>
            <div style={{ fontSize: '10.5px', color: 'var(--cyan-primary)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '3px' }}>
              Author Core Thesis:
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              "{activePaperA.coreHypothesis}"
            </p>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Key Empirical Merits:
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {activePaperA.keyPros.map((pro, i) => (
                <li key={i}>{pro}</li>
              ))}
            </ul>
          </div>

          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '12px',
            color: 'var(--emerald-success)',
            fontWeight: 600
          }}>
            Replication Status: {activePaperA.reproducibility}
          </div>
        </div>

        {/* Paper B Card */}
        <div style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(11, 17, 30, 0.95)',
          border: '1.5px solid rgba(168, 85, 247, 0.35)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 10px',
                borderRadius: '9999px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: 'var(--violet-neon)',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                Candidate Paper Beta (Challenger)
              </span>

              <button
                type="button"
                onClick={() => fileInputRefB.current?.click()}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  color: 'var(--violet-neon)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <UploadCloud size={12} />
                <span>Upload PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setArenaMode('custom');
                  setActiveSideSelector('B');
                  setSelectorTab('benchmarks');
                }}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  color: 'var(--violet-neon)',
                  cursor: 'pointer'
                }}
              >
                Pick Preset ▾
              </button>
            </div>

            <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--violet-neon)' }}>
              {activePaperB.empiricalScore} / 100 Empirical
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0, lineHeight: '1.3' }}>
              {activePaperB.title}
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {activePaperB.authors} • <em>{activePaperB.venue}</em>
            </div>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: '8px',
            background: 'rgba(7, 10, 18, 0.7)',
            borderLeft: '3px solid var(--violet-neon)'
          }}>
            <div style={{ fontSize: '10.5px', color: 'var(--violet-neon)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '3px' }}>
              Author Core Thesis:
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              "{activePaperB.coreHypothesis}"
            </p>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Key Empirical Merits:
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {activePaperB.keyPros.map((pro, i) => (
                <li key={i}>{pro}</li>
              ))}
            </ul>
          </div>

          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            fontSize: '12px',
            color: 'var(--violet-neon)',
            fontWeight: 600
          }}>
            Replication Status: {activePaperB.reproducibility}
          </div>
        </div>
      </div>

      {/* Chief Arbiter Consensus Resolution Banner */}
      <div style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.85) 80%)',
        border: '1.5px solid rgba(16, 185, 129, 0.4)',
        boxShadow: '0 0 35px rgba(16, 185, 129, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={22} color="var(--emerald-success)" />
          <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--emerald-success)' }}>
            Veritas Chief Arbiter Consensus Ruling & Cross-Examination
          </span>
        </div>
        <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
          {arenaMode === 'presets'
            ? selectedPreset.arbiterVerdict.verdictLabel
            : `${activePaperA.title.slice(0, 40)}... vs ${activePaperB.title.slice(0, 40)}... Duel`}
        </h4>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
          {arenaMode === 'presets'
            ? selectedPreset.arbiterVerdict.consensusSummary
            : `Comparative duel pitting "${activePaperA.title}" against "${activePaperB.title}". Launching the Veritas Swarm executes live search vectors, extracting primary author citations and testing reproducibility against empirical consensus.`}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginTop: '6px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Targeted Query: <code style={{ color: 'var(--emerald-success)', fontSize: '12px' }}>{getDynamicClashQuery()}</code>
          </span>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleRunClash}
            style={{
              fontSize: '12px',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: 'var(--emerald-success)',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            Dispatch Swarm on This Matchup →
          </button>
        </div>
      </div>
    </div>
  );
};
