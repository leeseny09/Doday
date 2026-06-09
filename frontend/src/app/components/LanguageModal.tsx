import { Check, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  { code: 'ko', label: '한국어',  sub: 'Korean' },
  { code: 'en', label: 'English', sub: 'English' },
  { code: 'ja', label: '日本語',  sub: 'Japanese' },
  { code: 'zh', label: '中文',    sub: 'Chinese' },
];

interface Props { open: boolean; onClose: () => void }

export function LanguageModal({ open, onClose }: Props) {
  const { darkMode, language, setLanguage } = useTheme();

  if (!open) return null;

  const bg   = darkMode ? '#1F2937' : '#FFFFFF';
  const bg2  = darkMode ? '#111827' : '#F9FAFB';
  const text = darkMode ? '#F9FAFB' : '#111827';
  const sub  = darkMode ? '#9CA3AF' : '#6B7280';
  const bdr  = darkMode ? '#374151' : '#F1F5F9';

  return (
    <div
      onClick={onClose}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: bg, borderRadius: '22px 22px 0 0', width: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: bdr, borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: text, letterSpacing: '-0.3px' }}>언어 선택</span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
            <X size={18} color={sub} strokeWidth={2} />
          </button>
        </div>

        {/* Language list */}
        <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LANGUAGES.map(lang => {
            const isActive = language === lang.label;
            return (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.label); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 14,
                  background: isActive ? (darkMode ? '#1E3A5F' : '#EFF6FF') : bg2,
                  border: `1.5px solid ${isActive ? '#005AE0' : 'transparent'}`,
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  fontFamily: 'inherit', transition: 'all 0.15s ease',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: isActive ? 700 : 500, color: isActive ? '#005AE0' : text, letterSpacing: '-0.2px' }}>
                    {lang.label}
                  </div>
                  <div style={{ fontSize: 11, color: sub, marginTop: 2 }}>{lang.sub}</div>
                </div>
                {isActive && (
                  <div style={{ width: 22, height: 22, borderRadius: 11, background: '#005AE0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={13} color="#FFFFFF" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
