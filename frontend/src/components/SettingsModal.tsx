import React, { useState } from 'react';
import { X, Key, Check, Sparkles, Cpu } from 'lucide-react';
import type { ApiKeys } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: ApiKeys;
  onSaveKeys: (keys: ApiKeys) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  keys,
  onSaveKeys
}) => {
  const [formData, setFormData] = useState<ApiKeys>(keys);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(formData);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  const getActiveProviderName = () => {
    if (formData.gemini?.trim()) return 'Google Gemini (Active)';
    if (formData.openai?.trim()) return 'OpenAI GPT-4o (Active)';
    if (formData.groq?.trim()) return 'Groq LLaMA 3.3 (Active)';
    return 'Autonomous Built-In Heuristic (Zero-Config Active)';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1.5px solid var(--border-highlight)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 20px 60px rgba(0, 242, 254, 0.25)',
        width: '540px',
        maxWidth: '100%',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cyan-primary)'
            }}>
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#fff' }}>
                External API & Engine Configuration
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Connect custom LLM & Search providers
              </p>
            </div>
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

        {/* Active Provider Status Badge */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--cyan-primary)" />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Target Engine: <strong style={{ color: '#fff' }}>{getActiveProviderName()}</strong>
            </span>
          </div>
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: '9999px',
            background: 'var(--emerald-bg)',
            color: 'var(--emerald-success)',
            border: '1px solid var(--emerald-border)'
          }}>
            Ready
          </span>
        </div>

        {/* Keys Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Google Gemini API Key (Recommended for high-speed adversarial check)
            </label>
            <input
              type="password"
              value={formData.gemini || ''}
              onChange={(e) => setFormData({ ...formData, gemini: e.target.value })}
              placeholder="AIzaSy..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(7, 10, 18, 0.85)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              OpenAI API Key
            </label>
            <input
              type="password"
              value={formData.openai || ''}
              onChange={(e) => setFormData({ ...formData, openai: e.target.value })}
              placeholder="sk-proj-..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(7, 10, 18, 0.85)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Groq API Key (High-Speed LLaMA 3.3)
            </label>
            <input
              type="password"
              value={formData.groq || ''}
              onChange={(e) => setFormData({ ...formData, groq: e.target.value })}
              placeholder="gsk_..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(7, 10, 18, 0.85)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Tavily Search API Key (Optional search fallback)
            </label>
            <input
              type="password"
              value={formData.tavily || ''}
              onChange={(e) => setFormData({ ...formData, tavily: e.target.value })}
              placeholder="tvly-..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(7, 10, 18, 0.85)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 22px',
                borderRadius: '8px',
                border: 'none',
                background: saved ? 'var(--emerald-success)' : 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)',
                color: '#07090e',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {saved ? <Check size={16} /> : <Sparkles size={16} />}
              <span>{saved ? 'Saved Successfully!' : 'Save & Apply'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
