import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCategories } from '../context/CategoryContext';

interface Props { open: boolean; onClose: () => void }

export function CategoryModal({ open, onClose }: Props) {
  const { darkMode } = useTheme();
  const { categories, addCategory, deleteCategory, palette } = useCategories();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#10B981');
  const [showAdd, setShowAdd] = useState(false);

  if (!open) return null;

  const bg   = darkMode ? '#1F2937' : '#FFFFFF';
  const bg2  = darkMode ? '#111827' : '#F9FAFB';
  const text = darkMode ? '#F9FAFB' : '#111827';
  const sub  = darkMode ? '#9CA3AF' : '#6B7280';
  const bdr  = darkMode ? '#374151' : '#F1F5F9';

  const isDefault = (id: string) => ['study', 'work', 'personal'].includes(id);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addCategory(newName.trim(), newColor);
    setNewName('');
    setShowAdd(false);
  };

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 14px' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: text, letterSpacing: '-0.3px' }}>카테고리 관리</span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
            <X size={18} color={sub} strokeWidth={2} />
          </button>
        </div>

        {/* Category list */}
        <div style={{ padding: '0 16px', maxHeight: 260, overflowY: 'auto' }}>
          {categories.map((cat, i) => (
            <div key={cat.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 12,
              background: i % 2 === 0 ? bg2 : 'transparent',
              marginBottom: 4,
            }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: cat.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, color: text, fontWeight: 500 }}>{cat.name}</span>
              {isDefault(cat.id) ? (
                <span style={{ fontSize: 10, color: sub, border: `1px solid ${bdr}`, borderRadius: 20, padding: '2px 7px' }}>기본</span>
              ) : (
                <button
                  onClick={() => deleteCategory(cat.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}
                >
                  <X size={14} color={sub} strokeWidth={2} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add section */}
        <div style={{ padding: '10px 16px 0' }}>
          {showAdd ? (
            <div style={{ background: bg2, borderRadius: 14, padding: '14px', marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>새 카테고리</div>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAdd(false); }}
                placeholder="카테고리 이름"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontSize: 13, color: text, padding: '9px 12px',
                  border: `1.5px solid ${newName ? '#005AE0' : bdr}`,
                  borderRadius: 10, outline: 'none',
                  background: bg, fontFamily: 'inherit', marginBottom: 12,
                }}
              />
              {/* Color palette */}
              <div style={{ fontSize: 11, color: sub, marginBottom: 8, fontWeight: 500 }}>색상 선택</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {palette.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: 14,
                      background: c, border: 'none', cursor: 'pointer', padding: 0,
                      boxShadow: newColor === c ? `0 0 0 3px ${bg}, 0 0 0 5px ${c}` : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'box-shadow 0.15s ease',
                    }}
                  >
                    {newColor === c && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setShowAdd(false); setNewName(''); }}
                  style={{ flex: 1, padding: '10px', background: 'transparent', color: sub, border: `1px solid ${bdr}`, borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  취소
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  style={{
                    flex: 2, padding: '10px',
                    background: newName.trim() ? '#005AE0' : bdr,
                    color: newName.trim() ? '#FFFFFF' : sub,
                    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: newName.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
                  }}
                >
                  추가하기
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '11px', background: 'transparent',
                border: `1.5px dashed ${bdr}`, borderRadius: 12,
                color: '#005AE0', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 6,
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              카테고리 추가
            </button>
          )}
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
