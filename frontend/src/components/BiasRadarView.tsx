import React from 'react';
import { Radar, AlertTriangle, Activity } from 'lucide-react';
import type { BiasTelemetry } from '../types';

interface BiasRadarViewProps {
  telemetry: BiasTelemetry;
}

export const BiasRadarView: React.FC<BiasRadarViewProps> = ({ telemetry }) => {
  // SVG Radar Chart Math for 5 axes
  const size = 320;
  const center = size / 2;
  const radius = 105;
  const axes = telemetry.axes;
  const angleStep = (Math.PI * 2) / axes.length;

  // Calculate coordinates for a percentage at a given axis index
  const getCoordinates = (index: number, scorePercentage: number) => {
    // Start at top (-PI/2)
    const angle = index * angleStep - Math.PI / 2;
    const r = (scorePercentage / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Concentric polygon web rings (25%, 50%, 75%, 100%)
  const webLevels = [25, 50, 75, 100];

  // Radar polygon points string
  const polygonPoints = axes.map((a, i) => {
    const { x, y } = getCoordinates(i, a.score);
    return `${x},${y}`;
  }).join(' ');

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'HIGH':
        return { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.4)' };
      case 'MEDIUM':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)' };
      case 'LOW':
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px',
      background: 'rgba(11, 17, 30, 0.95)',
      borderRadius: 'var(--radius-lg)',
      border: '1.5px solid rgba(0, 242, 254, 0.3)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25) 0%, rgba(56, 189, 248, 0.25) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan-neon)',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)'
          }}>
            <Radar size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cyan-neon)' }}>
                Epistemic Intelligence Telemetry
              </span>
              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--violet-neon)', fontWeight: 700 }}>
                5-Axis Vector Analysis
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '2px 0 0 0' }}>
              Epistemic Bias & Cognitive Fallacy Radar
            </h3>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          borderRadius: '8px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Activity size={16} color="var(--cyan-neon)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Overall Epistemic Rigor:</span>
          <strong style={{ fontSize: '16px', color: 'var(--cyan-neon)', fontFamily: 'var(--font-mono)' }}>
            {telemetry.overall_integrity_index}/100
          </strong>
        </div>
      </div>

      {/* Main Grid: Radar Chart + 5-Axis Score Bars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Animated SVG Radar Chart */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(7, 10, 18, 0.65)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Concentric Guide Rings */}
            {webLevels.map((lvl) => {
              const points = axes.map((_, i) => {
                const { x, y } = getCoordinates(i, lvl);
                return `${x},${y}`;
              }).join(' ');
              return (
                <polygon
                  key={lvl}
                  points={points}
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.15)"
                  strokeWidth="1"
                  strokeDasharray={lvl === 100 ? 'none' : '3 3'}
                />
              );
            })}

            {/* Axis Spoke Lines */}
            {axes.map((_, i) => {
              const outer = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Radar Polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(0, 242, 254, 0.22)"
              stroke="var(--cyan-neon)"
              strokeWidth="2.5"
            />

            {/* Vertex Nodes & Label Annotations */}
            {axes.map((a, i) => {
              const coord = getCoordinates(i, a.score);
              const labelCoord = getCoordinates(i, 118);
              return (
                <g key={i}>
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="5"
                    fill="#00f2fe"
                    stroke="#07090e"
                    strokeWidth="2"
                    style={{ filter: 'drop-shadow(0 0 6px #00f2fe)' }}
                  />
                  <text
                    x={labelCoord.x}
                    y={labelCoord.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#cbd5e1"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="var(--font-display)"
                  >
                    {a.name.split(' ')[0]} ({a.score}%)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 5-Axis Score Breakdown List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {axes.map((axis, i) => (
            <div
              key={i}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                  {axis.name}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--cyan-neon)' }}>
                  {axis.score} / 100
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${axis.score}%`,
                  height: '100%',
                  background: axis.score >= 70 ? 'linear-gradient(90deg, #10b981, #00f2fe)' : (axis.score >= 45 ? 'linear-gradient(90deg, #f59e0b, #38bdf8)' : '#f43f5e'),
                  borderRadius: '3px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cognitive Fallacies Detection Matrix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="var(--amber-warning)" />
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Audited Rhetorical & Cognitive Fallacies
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {telemetry.detected_fallacies.map((fallacy, idx) => {
            const style = getSeverityStyle(fallacy.severity);
            return (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: `1px solid ${style.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff' }}>
                    {fallacy.name}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: style.bg,
                    color: style.text,
                    border: `1px solid ${style.border}`
                  }}>
                    {fallacy.severity} RISK
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
                  {fallacy.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
