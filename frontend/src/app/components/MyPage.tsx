import { useState, useEffect } from 'react';
import { Bell, RefreshCw, Tag, Info, LogOut, ChevronRight, Flame, Target, CheckCircle2, Moon, Globe, UserPen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CategoryModal } from './CategoryModal';
import { LanguageModal } from './LanguageModal';
import { ProfileEditModal } from './ProfileEditModal';
import api from '../../api/axios';

interface UserProfile {
  nickname: string;
  email: string;
  streakDays: number;
  totalCompleted: number;
  avgCompletionRate: number;
  alarmEnabled: boolean;
  autoRollover: boolean;
}

export function MyPage({ onLogout, isActive }: { onLogout?: () => void; isActive?: boolean }) {
  const { darkMode, setDarkMode, language } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const fetchProfile = () => {
    api.get('/api/auth/me')
      .then(res => {
        setProfile({
          nickname:          res.data.name              ?? res.data.nickname        ?? '사용자',
          email:             res.data.email             ?? '',
          streakDays:        res.data.streakDays        ?? 0,
          totalCompleted:    res.data.totalCompleted    ?? 0,
          avgCompletionRate: res.data.avgCompletionRate ?? 0,
          alarmEnabled:      res.data.alarmEnabled      ?? true,
          autoRollover:      res.data.autoRollover      ?? true,
        });
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!isActive) return;
    fetchProfile();
  }, [isActive]);

  const handleToggleSetting = async (key: 'alarmEnabled' | 'autoRollover', value: boolean) => {
    // 낙관적 업데이트
    setProfile(prev => prev ? { ...prev, [key]: value } : prev);
    try {
      await api.patch('/api/auth/settings', { [key]: value });
    } catch (e) {
      // 실패 시 롤백
      setProfile(prev => prev ? { ...prev, [key]: !value } : prev);
      console.error(e);
    }
  };

  // ── 로그아웃 처리 ──
  // 1) 백엔드 POST /api/auth/logout 호출 (Redis에서 Refresh Token 삭제)
  // 2) localStorage 토큰 제거
  // 3) 부모 컴포넌트(App.tsx)의 onLogout() 실행 → 로그인 화면으로 전환
  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      // 서버 오류여도 클라이언트 토큰은 무조건 삭제
      console.warn('로그아웃 API 오류 (무시하고 진행):', e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      onLogout?.();
    }
  };

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
        { id: 'logout', icon: <LogOut size={16} color="#EF4444" />, label: '로그아웃', type: 'danger', onPress: handleLogout },
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
              <span style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>{profile?.nickname?.[0] ?? '?'}</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: text, letterSpacing: '-0.3px' }}>{profile?.nickname ?? '불러오는 중...'}</div>
              <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>{profile?.email ?? ''}</div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ background: card, margin: '10px 0', padding: '14px 16px', transition: 'background 0.3s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { icon: <Flame size={16} color="#F97316" />, value: String(profile?.streakDays ?? '-'), label: '연속 달성', sub: '일' },
              { icon: <CheckCircle2 size={16} color="#22C55E" />, value: String(profile?.totalCompleted ?? '-'), label: '총 완료', sub: '개' },
              { icon: <Target size={16} color={blue} />, value: String(profile?.avgCompletionRate ?? '-'), label: '평균 완료율', sub: '%' },
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
