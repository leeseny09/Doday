import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props { open: boolean; onClose: () => void }

export function ProfileEditModal({ open, onClose }: Props) {
  const { darkMode } = useTheme();
  const [name, setName] = useState('김데이');
  const [email, setEmail] = useState('doday@example.com');

  if (!open) return null;

  const bg   = darkMode ? '#1F2937' : '#FFFFFF';
  const bg2  = darkMode ? '#111827' : '#F9FAFB';
  const text = darkMode ? '#F9FAFB' : '#111827';
  const sub  = darkMode ? '#9CA3AF' : '#6B7280';
  const bdr  = darkMode ? '#374151' : '#E5E7EB';
  const blue = '#005AE0';

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    fontSize: 14, color: text, padding: '11px 14px',
    border: `1.5px solid ${bdr}`,
    borderRadius: 12, outline: 'none',
    background: bg2, fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
        zIndex: 200, display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: bg, borderRadius: '22px 22px 0 0', width: '100%',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          maxHeight: '85%', overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: bdr, borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 20px' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: text, letterSpacing: '-0.3px' }}>개인정보 수정</span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
            <X size={18} color={sub} strokeWidth={2} />
          </button>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 40,
              background: 'linear-gradient(135deg, #005AE0 0%, #0EA5E9 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>김</span>
            </div>
            <button style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: 14,
              background: blue, border: `2px solid ${bg}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Camera size={13} color="#FFFFFF" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '0 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              이름
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              placeholder="이름"
              onFocus={e => (e.target.style.borderColor = blue)}
              onBlur={e => (e.target.style.borderColor = bdr)}
            />
          </div>

          <div>
            <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              이메일
            </div>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="이메일"
              type="email"
              onFocus={e => (e.target.style.borderColor = blue)}
              onBlur={e => (e.target.style.borderColor = bdr)}
            />
          </div>

          <button
            onClick={handleSave}
            style={{
              marginTop: 8,
              width: '100%', padding: '13px',
              background: blue, color: '#FFFFFF',
              border: 'none', borderRadius: 14,
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '-0.2px',
            }}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
