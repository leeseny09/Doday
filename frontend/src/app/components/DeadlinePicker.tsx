import { useState } from 'react';
import { X, Clock } from 'lucide-react';

interface DeadlinePickerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (deadline: string) => void;
  currentDeadline?: string;
}

const QUICK_OPTIONS = [
  { label: '오늘 마감',      value: '오늘 마감' },
  { label: '오전 9시',       value: '오전 9:00' },
  { label: '오후 12시',      value: '오후 12:00' },
  { label: '오후 6시',       value: '오후 6:00' },
  { label: '오후 9시',       value: '오후 9:00' },
  { label: '오후 11시',      value: '오후 11:00' },
  { label: '내일 마감',      value: '내일 마감' },
  { label: '이번 주말',      value: '이번 주말' },
];

export function DeadlinePicker({ open, onClose, onConfirm, currentDeadline }: DeadlinePickerProps) {
  const [selected, setSelected] = useState(currentDeadline ?? '');
  const [customHour, setCustomHour] = useState('');
  const [customMeridiem, setCustomMeridiem] = useState<'오전' | '오후'>('오후');
  const [showCustom, setShowCustom] = useState(false);

  if (!open) return null;

  const handleConfirm = () => {
    if (showCustom && customHour) {
      onConfirm(`${customMeridiem} ${customHour}:00`);
    } else if (selected) {
      onConfirm(selected);
    }
    onClose();
  };

  const handleClear = () => {
    onConfirm('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      {/* Bottom sheet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '22px 22px 0 0',
          width: '100%',
          padding: '0 0 20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 36, height: 4, background: '#E5E7EB', borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="#005AE0" strokeWidth={2} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>마감 설정</span>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
            <X size={18} color="#9CA3AF" strokeWidth={2} />
          </button>
        </div>

        {/* Quick options grid */}
        <div style={{ padding: '0 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8, paddingLeft: 4 }}>
            빠른 선택
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {QUICK_OPTIONS.map(opt => {
              const isActive = selected === opt.value && !showCustom;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setSelected(opt.value); setShowCustom(false); }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1.5px solid ${isActive ? '#005AE0' : '#F1F5F9'}`,
                    background: isActive ? '#EFF6FF' : '#FAFAFA',
                    color: isActive ? '#005AE0' : '#374151',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom time */}
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8, paddingLeft: 4 }}>
            직접 입력
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* AM/PM toggle */}
            <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              {(['오전', '오후'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setCustomMeridiem(m); setShowCustom(true); }}
                  style={{
                    padding: '9px 12px', fontSize: 12, fontWeight: 600,
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: customMeridiem === m && showCustom ? '#005AE0' : '#FAFAFA',
                    color: customMeridiem === m && showCustom ? '#FFFFFF' : '#6B7280',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            {/* Hour input */}
            <input
              type="number"
              min={1}
              max={12}
              value={customHour}
              onChange={e => { setCustomHour(e.target.value); setShowCustom(true); setSelected(''); }}
              placeholder="시간 (1–12)"
              style={{
                flex: 1, height: 38,
                border: `1.5px solid ${showCustom && customHour ? '#005AE0' : '#E5E7EB'}`,
                borderRadius: 10, padding: '0 12px',
                fontSize: 13, color: '#111827', outline: 'none',
                fontFamily: 'inherit', background: '#FAFAFA',
              }}
            />
            <span style={{ fontSize: 13, color: '#9CA3AF', flexShrink: 0 }}>:00</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
          <button
            onClick={handleClear}
            style={{
              flex: 1, padding: '13px',
              background: 'transparent', color: '#9CA3AF',
              border: '1px solid #E5E7EB', borderRadius: 12,
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            마감 없음
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected && !(showCustom && customHour)}
            style={{
              flex: 2, padding: '13px',
              background: (selected || (showCustom && customHour)) ? '#005AE0' : '#E5E7EB',
              color: (selected || (showCustom && customHour)) ? '#FFFFFF' : '#9CA3AF',
              border: 'none', borderRadius: 12,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            설정하기
          </button>
        </div>
      </div>
    </div>
  );
}
