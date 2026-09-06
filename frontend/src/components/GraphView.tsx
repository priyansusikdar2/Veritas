import React, { useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Map, Maximize2 } from 'lucide-react';

import { RootNode, SubQueryNode, SourceNode, ClaimNode, VerdictNode } from './nodes/CustomNodes';

interface GraphViewProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (node: Node) => void;
}

const InnerGraphView: React.FC<GraphViewProps> = ({
  nodes,
  edges,
  onNodeClick
}) => {
  const [showMiniMap, setShowMiniMap] = useState(false);
  const { fitView } = useReactFlow();

  const nodeTypes = useMemo(() => ({
    root: RootNode,
    subquery: SubQueryNode,
    source: SourceNode,
    claim: ClaimNode,
    verdict: VerdictNode
  }), []);

  // Auto-fit graph smoothly as nodes stream in
  useEffect(() => {
    if (nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.16, duration: 400 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, fitView]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      background: '#070a12'
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onNodeClick(node)}
        fitView
        fitViewOptions={{ padding: 0.16, minZoom: 0.25, maxZoom: 1.05 }}
        minZoom={0.2}
        maxZoom={1.8}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: 'rgba(56, 189, 248, 0.65)', strokeWidth: 2 }
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={26}
          size={1.6}
          color="rgba(255, 255, 255, 0.08)"
        />
        <Controls position="top-left" />
      </ReactFlow>

      {/* Unobtrusive Top-Right Legend Bar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '14px',
        background: 'rgba(11, 17, 30, 0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        zIndex: 10,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 6px #00f2fe' }} />
          <span>Root</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 6px #818cf8' }} />
          <span>Sub-Query</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          <span>Source</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
          <span>Claim</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }} />
          <span>Verdict</span>
        </div>
      </div>

      {/* Bottom Right Floating Controls */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '14px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '6px'
      }}>
        {showMiniMap && (
          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'root') return '#00f2fe';
              if (n.type === 'subquery') return '#818cf8';
              if (n.type === 'source') return '#10b981';
              if (n.type === 'claim') return '#f59e0b';
              if (n.type === 'verdict') return '#f43f5e';
              return '#64748b';
            }}
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              width: 130,
              height: 85,
              position: 'relative',
              margin: 0,
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)'
            }}
          />
        )}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => fitView({ padding: 0.16, duration: 400 })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 11px',
              borderRadius: '6px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--cyan-neon)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
            title="Auto-fit and center all graph nodes"
          >
            <Maximize2 size={12} /> Fit View
          </button>
          <button
            type="button"
            onClick={() => setShowMiniMap(!showMiniMap)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 11px',
              borderRadius: '6px',
              background: showMiniMap ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.85)',
              border: showMiniMap ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
              color: showMiniMap ? 'var(--cyan-neon)' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
            title="Toggle Mini-Map"
          >
            <Map size={12} /> {showMiniMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const GraphView: React.FC<GraphViewProps> = (props) => {
  return (
    <ReactFlowProvider>
      <InnerGraphView {...props} />
    </ReactFlowProvider>
  );
};
