import React, { useState } from 'react';
import { Swords, ShieldAlert, Scale, Volume2, Square, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import type { DebateArenaData } from '../types';

interface DebateArenaViewProps {
  debate: DebateArenaData;
  truthScore: number;
}

export const DebateArenaView: React.FC<DebateArenaViewProps> = ({ debate, truthScore }) => {
  const [activeRound, setActiveRound] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const currentRoundData = debate.rounds.find(r => r.round_number === activeRound) || debate.rounds[0];

  const handleSpeakRound = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));

    // Sequence utterances for dual or triple voices
    const queue: SpeechSynthesisUtterance[] = [];

    if (activeRound === 1 || activeRound === 2) {
      // Advocate speech
      if (currentRoundData.advocate_argument) {
        const advUtterance = new SpeechSynthesisUtterance(`Advocate Agent argues: ${currentRoundData.advocate_argument}`);
        advUtterance.rate = 1.05;
        advUtterance.pitch = 1.1; // Slightly higher/confident
        if (englishVoices.length > 0) advUtterance.voice = englishVoices[0];
        queue.push(advUtterance);
      }

      // Inquisitor speech
      if (currentRoundData.inquisitor_argument) {
        const inqUtterance = new SpeechSynthesisUtterance(`Inquisitor Agent objects: ${currentRoundData.inquisitor_argument}`);
        inqUtterance.rate = 1.0;
        inqUtterance.pitch = 0.85; // Lower, sharper tone
        if (englishVoices.length > 1) inqUtterance.voice = englishVoices[1];
        queue.push(inqUtterance);
      }
    } else {
      // Arbiter speech
      if (currentRoundData.arbiter_ruling) {
        const arbUtterance = new SpeechSynthesisUtterance(`Chief Arbiter Agent delivers the final decree: ${currentRoundData.arbiter_ruling}`);
        arbUtterance.rate = 0.98;
        arbUtterance.pitch = 0.95;
        if (englishVoices.length > 2) arbUtterance.voice = englishVoices[2];
        queue.push(arbUtterance);
      }
    }

    // Play through queue
    let idx = 0;
    const playNext = () => {
      if (idx < queue.length) {
        const u = queue[idx];
        idx++;
        u.onend = playNext;
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      } else {
        setIsSpeaking(false);
      }
    };

    playNext();
  };

  const momentum = currentRoundData.momentum_score;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '24px',
      background: 'rgba(11, 17, 30, 0.95)',
      borderRadius: 'var(--radius-lg)',
      border: '1.5px solid rgba(168, 85, 247, 0.35)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(244, 63, 94, 0.3) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--violet-neon)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.35)'
          }}>
            <Swords size={22} />
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
                Agent vs. Agent Arena
              </span>
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(0, 242, 254, 0.15)',
                color: 'var(--cyan-neon)',
                fontWeight: 700
              }}>
                Live Mock Courtroom
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '2px 0 0 0' }}>
              Adversarial Evidentiary Deliberation
            </h3>
          </div>
        </div>

        {/* Audio Debate Player Button */}
        <button
          type="button"
          onClick={handleSpeakRound}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: isSpeaking ? 'var(--rose-danger)' : 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
            color: isSpeaking ? '#fff' : '#07090e',
            border: 'none',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: isSpeaking ? '0 0 14px var(--rose-danger)' : '0 0 14px rgba(168, 85, 247, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          {isSpeaking ? (
            <>
              <Square size={14} fill="#fff" />
              <span>Stop Debate Voices</span>
            </>
          ) : (
            <>
              <Volume2 size={15} />
              <span>🔊 Listen to Round {activeRound} Debate (Dual Voices)</span>
            </>
          )}
        </button>
      </div>

      {/* Evidentiary Momentum Meter (Tug of War) */}
      <div style={{
        padding: '14px 18px',
        borderRadius: '10px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
          <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={13} /> Advocate Affirmation: {momentum}%
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Focus: {currentRoundData.evidence_focus}
          </span>
          <span style={{ color: '#fb7185', display: 'flex', alignItems: 'center', gap: '5px' }}>
            Inquisitor Skepticism: {100 - momentum}% <ShieldAlert size={13} />
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: '#1e293b',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <div style={{
            width: `${momentum}%`,
            background: 'linear-gradient(90deg, #38bdf8, #00f2fe)',
            transition: 'width 0.4s ease'
          }} />
          <div style={{
            width: `${100 - momentum}%`,
            background: 'linear-gradient(90deg, #fb7185, #f43f5e)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Round Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {debate.rounds.map(r => (
          <button
            key={r.round_number}
            onClick={() => setActiveRound(r.round_number)}
            style={{
              flex: '1 1 200px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: activeRound === r.round_number ? '1.5px solid var(--violet-neon)' : '1px solid var(--border-subtle)',
              background: activeRound === r.round_number ? 'rgba(168, 85, 247, 0.15)' : 'rgba(15, 23, 42, 0.5)',
              color: activeRound === r.round_number ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: activeRound === r.round_number ? 'var(--violet-neon)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
              Round {r.round_number}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, marginTop: '2px' }}>
              {r.title}
            </div>
          </button>
        ))}
      </div>

      {/* Debate Arguments Presentation Arena */}
      {activeRound !== 3 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {/* Advocate Podium */}
          <div style={{
            padding: '18px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1.5px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                  {debate.advocate_name}
                </span>
              </div>
              <span style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald-success)',
                fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                Affirmative
              </span>
            </div>

            <p style={{
              fontSize: '13.5px',
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              margin: 0,
              background: 'rgba(7, 10, 18, 0.6)',
              padding: '14px',
              borderRadius: '8px',
              borderLeft: '3px solid #38bdf8'
            }}>
              "{currentRoundData.advocate_argument}"
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={13} color="var(--cyan-primary)" />
              <span>Supported by primary literature & empirical index</span>
            </div>
          </div>

          {/* Inquisitor Podium */}
          <div style={{
            padding: '18px',
            borderRadius: '12px',
            background: 'rgba(244, 63, 94, 0.05)',
            border: '1.5px solid rgba(244, 63, 94, 0.35)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#fb7185', boxShadow: '0 0 8px #fb7185' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fb7185', textTransform: 'uppercase' }}>
                  {debate.inquisitor_name}
                </span>
              </div>
              <span style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '9999px',
                background: 'rgba(244, 63, 94, 0.15)',
                color: 'var(--rose-danger)',
                fontWeight: 700,
                border: '1px solid rgba(244, 63, 94, 0.3)'
              }}>
                Adversarial
              </span>
            </div>

            <p style={{
              fontSize: '13.5px',
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              margin: 0,
              background: 'rgba(7, 10, 18, 0.6)',
              padding: '14px',
              borderRadius: '8px',
              borderLeft: '3px solid #fb7185'
            }}>
              "{currentRoundData.inquisitor_argument}"
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <AlertCircle size={13} color="var(--rose-danger)" />
              <span>Stress-testing methodological flaws, outliers & bias</span>
            </div>
          </div>
        </div>
      ) : (
        /* Chief Arbiter Supreme Decree */
        <div style={{
          padding: '24px',
          borderRadius: '12px',
          background: 'radial-gradient(ellipse at top, rgba(168, 85, 247, 0.15) 0%, rgba(15, 23, 42, 0.85) 80%)',
          border: '2px solid rgba(168, 85, 247, 0.5)',
          boxShadow: '0 0 35px rgba(168, 85, 247, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scale size={20} color="var(--violet-neon)" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--violet-neon)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {debate.arbiter_name}
              </span>
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '9999px',
              background: truthScore >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: truthScore >= 70 ? 'var(--emerald-success)' : 'var(--amber-warning)',
              border: `1px solid ${truthScore >= 70 ? 'var(--emerald-border)' : 'var(--amber-border)'}`
            }}>
              Official Decree: {debate.verdict_label} ({truthScore}/100)
            </span>
          </div>

          <p style={{
            fontSize: '15px',
            color: '#fff',
            lineHeight: '1.65',
            margin: 0,
            background: 'rgba(7, 10, 18, 0.75)',
            padding: '18px',
            borderRadius: '10px',
            borderLeft: '4px solid var(--violet-neon)'
          }}>
            "{currentRoundData.arbiter_ruling}"
          </p>
        </div>
      )}
    </div>
  );
};
