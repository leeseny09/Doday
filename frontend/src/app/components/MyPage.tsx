import { useState } from 'react';
import { Bell, RefreshCw, Tag, Info, LogOut, ChevronRight, Flame, Target, CheckCircle2, Moon, Globe, UserPen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CategoryModal } from './CategoryModal';
import { LanguageModal } from './LanguageModal';
import { ProfileEditModal } from './ProfileEditModal';

export function MyPage({ onLogout }: { onLogout?: () => void }) {
  const { darkMode, setDarkMode, language } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoRollover, setAutoRollover] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const bg    = darkMode ? '#111827' : '#F9FAFB';
  const card  = darkMode ? '#1F2937' : '#FFFFFF';
  const text  = darkMode ? '#F9FAFB' : '#111827';
  const sub   = darkMode ? '#9CA3AF' : '#6B7280';
  const bdr   = darkMode ? '#374151' : '#F8FAFC';
  const blue  = '#005AE0';

  const ToggleSwitch = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div
      onClick={onToggle}
      style={{
        width: 44, height: 26, borderRadius: 13,
        background: on ? blue : (darkMode ? '#374151' : '#E5E7EB'),
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.25s ease', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: 10, background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.25s ease',
      }} />
    </div>
  );

  type SettingRow =
    | { id: string; icon: React.ReactNode; label: string; desc?: string; type: 'toggle'; value: boolean; onToggle: () => void }
    | { id: string; icon: React.ReactNode; label: string; desc?: string; type: 'nav'; value?: string; onPress: () => void }
    | { id: string; icon: React.ReactNode; label: string; desc?: string; type: 'danger'; onPress: () => void };

  const groups: { title: string; rows: SettingRow[] }[] = [
    {
      title: '알림',
      rows: [
        { id: 'noti', icon: <Bell size={16} color={blue} />, label: '마감 알림', desc: '마감 30분 전 알림', type: 'toggle', value: notifications, onToggle: () => setNotifications(v => !v) },
        { id: 'repeat', icon: <RefreshCw size={16} color="#0EA5E9" />, label: '반복 일정', desc: '매일 자정 이월 처리', type: 'toggle', value: autoRollover, onToggle: () => setAutoRollover(v => !v) },
      ],
    },
    {
      title: '설정',
      rows: [
        { id: 'profile', icon: <UserPen size={16} color={blue} />, label: '개인정보 수정', type: 'nav', onPress: () => setShowProfileEdit(true) },
        { id: 'category', icon: <Tag size={16} color="#8B5CF6" />, label: '카테고리 관리', desc: '유형 추가·삭제', type: 'nav', onPress: () => setShowCategoryModal(true) },
        { id: 'dark', icon: <Moon size={16} color={darkMode ? '#818CF8' : '#374151'} />, label: '다크 모드', type: 'toggle', value: darkMode, onToggle: () => setDarkMode(!darkMode) },
        { id: 'lang', icon: <Globe size={16} color="#6B7280" />, label: '언어', value: language, type: 'nav', onPress: () => setShowLanguageModal(true) },
      ],
    },
    {
      title: '정보',
      rows: [
        { id: 'info', icon: <Info size={16} color={sub} />, label: '앱 정보', value: 'v1.0.0', type: 'nav', onPress: () => {} },
        { id: 'logout', icon: <LogOut size={16} color="#EF4444" />, label: '로그아웃', type: 'danger', onPress: () => onLogout?.() },
      ],
    },
  ];

  return (
    <div style={{ background: bg, minHeight: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', position: 'relative', transition: 'background 0.3s ease' }}>

      {/* ── Profile ── */}
      <div style={{ background: card, padding: '24px 20px 20px', transition: 'background 0.3s ease' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: text, letterSpacing: '-0.5px', marginBottom: 16 }}>마이페이지</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: 'linear-gradient(135deg, #005AE0 0%, #0EA5E9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>김</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: text, letterSpacing: '-0.3px' }}>김데이</div>
            <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>doday@example.com</div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ background: card, margin: '10px 0', padding: '14px 16px', transition: 'background 0.3s ease' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { icon: <Flame size={16} color="#F97316" />, value: '12', label: '연속 달성', sub: '일' },
            { icon: <CheckCircle2 size={16} color="#22C55E" />, value: '142', label: '총 완료', sub: '개' },
            { icon: <Target size={16} color={blue} />, value: '73', label: '평균 완료율', sub: '%' },
          ].map(stat => (
            <div key={stat.label} style={{ border: `1px solid ${darkMode ? '#374151' : '#F1F5F9'}`, borderRadius: 14, padding: '12px 8px', textAlign: 'center', transition: 'border-color 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: text, letterSpacing: '-0.5px', lineHeight: 1 }}>
                {stat.value}<span style={{ fontSize: 11, fontWeight: 500, color: sub }}>{stat.sub}</span>
              </div>
              <div style={{ fontSize: 10, color: sub, marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Setting groups ── */}
      {groups.map(group => (
        <div key={group.title} style={{ background: card, marginBottom: 10, transition: 'background 0.3s ease' }}>
          <div style={{ padding: '10px 20px 4px', fontSize: 10, color: sub, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            {group.title}
          </div>
          {group.rows.map((row, i) => (
            <div
              key={row.id}
              onClick={row.type !== 'toggle' ? (row as any).onPress : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 20px',
                borderBottom: i < group.rows.length - 1 ? `1px solid ${bdr}` : 'none',
                cursor: row.type !== 'toggle' ? 'pointer' : 'default',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: darkMode ? '#374151' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {row.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: row.type === 'danger' ? '#EF4444' : text, fontWeight: 500 }}>{row.label}</div>
                {row.desc && <div style={{ fontSize: 11, color: sub, marginTop: 1 }}>{row.desc}</div>}
              </div>
              {row.type === 'toggle' && (
                <ToggleSwitch on={row.value} onToggle={row.onToggle} />
              )}
              {row.type === 'nav' && (
                <>
                  {row.value && <span style={{ fontSize: 12, color: sub }}>{row.value}</span>}
                  <ChevronRight size={15} color={sub} strokeWidth={2} />
                </>
              )}
            </div>
          ))}
        </div>
      ))}

      <div style={{ height: 16 }} />

      {/* ── Modals ── */}
      <ProfileEditModal open={showProfileEdit} onClose={() => setShowProfileEdit(false)} />
      <CategoryModal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} />
      <LanguageModal open={showLanguageModal} onClose={() => setShowLanguageModal(false)} />
    </div>
  );
}
