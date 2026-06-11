import { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route, Link, useLocation } from 'react-router';
import { Home as HomeIcon, CalendarDays, BarChart2, User } from 'lucide-react';
import { Home } from './components/Home';
import { CalendarView } from './components/CalendarView';
import { DayDetail } from './components/DayDetail';
import { WeeklyReport } from './components/WeeklyReport';
import { MyPage } from './components/MyPage';
import { DeadlineModal } from './components/DeadlineModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CategoryProvider } from './context/CategoryContext';
import { SplashScreen } from './components/auth/SplashScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { SignupScreen } from './components/auth/SignupScreen';

type AuthStep = 'splash' | 'login' | 'signup' | 'main';

const AUTO_LOGIN_KEY = 'doday_autologin';

const NAV_ITEMS = [
    { to: '/',         icon: HomeIcon,      label: '오늘' },
    { to: '/calendar', icon: CalendarDays,  label: '일정' },
    { to: '/report',   icon: BarChart2,     label: '리포트' },
    { to: '/profile',  icon: User,          label: '마이페이지' },
] as const;

function BottomNav() {
    const location = useLocation();
    const { darkMode } = useTheme();

    const navBg = darkMode ? 'rgba(31,41,55,0.97)' : 'rgba(255,255,255,0.96)';
    const border = darkMode ? '#374151' : '#E5E7EB';
    const inactive = darkMode ? '#6B7280' : '#8E8E93';

    return (
        <div style={{
            background: navBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: `0.5px solid ${border}`,
            display: 'flex',
            justifyContent: 'space-around',
            padding: '9px 8px 3px',
            transition: 'background 0.3s ease, border-color 0.3s ease',
        }}>
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                const active = location.pathname === to;
                return (
                    <Link
                        key={to}
                        to={to}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', minWidth: 56 }}
                    >
                        <Icon size={22} color={active ? '#005AE0' : inactive} strokeWidth={active ? 2.5 : 1.8} />
                        <span style={{ fontSize: 10, color: active ? '#005AE0' : inactive, fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
                    </Link>
                );
            })}
        </div>
    );
}

function AppContent({ onLogout }: { onLogout: () => void }) {
    const [showDeadlineModal, setShowDeadlineModal] = useState(false);
    const [homeRefreshKey, setHomeRefreshKey] = useState(0);
    const { darkMode } = useTheme();
    const location = useLocation();

    const contentBg = darkMode ? '#111827' : '#FFFFFF';
    const p = location.pathname;
    const isHome     = p === '/';
    const isCalendar = p === '/calendar';
    const isReport   = p === '/report';
    const isProfile  = p === '/profile';

    return (
        <>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <div style={{ height: '100%', overflowY: 'auto', background: contentBg, transition: 'background 0.3s ease' }}>
                    {/* All main tabs always mounted — display:none keeps state alive */}
                    <div style={{ display: isHome ? 'block' : 'none' }}>
                        <Home onOpenDeadline={() => setShowDeadlineModal(true)} refreshKey={homeRefreshKey} />
                    </div>
                    <div style={{ display: isCalendar ? 'block' : 'none' }}>
                        <CalendarView isActive={isCalendar} />
                    </div>
                    <div style={{ display: isReport ? 'block' : 'none' }}>
                        <WeeklyReport isActive={isReport} />
                    </div>
                    <div style={{ display: isProfile ? 'block' : 'none' }}>
                        <MyPage isActive={isProfile} onLogout={onLogout} />
                    </div>
                    {/* DayDetail needs :date param — stays in Router */}
                    <Routes>
                        <Route path="/calendar/:date" element={<DayDetail />} />
                    </Routes>
                </div>
                <DeadlineModal
                    open={showDeadlineModal}
                    onClose={() => setShowDeadlineModal(false)}
                    onComplete={() => setHomeRefreshKey(k => k + 1)}
                    todo={{ text: '할 일', deadline: '오늘 마감' }}
                />
            </div>

            <div style={{ flexShrink: 0 }}>
                <BottomNav />
                <div style={{
                    display: 'flex', justifyContent: 'center',
                    paddingBottom: 8, paddingTop: 4,
                    background: darkMode ? 'rgba(31,41,55,0.97)' : 'rgba(255,255,255,0.96)',
                    transition: 'background 0.3s ease',
                }}>
                    <div style={{ width: 128, height: 4, background: darkMode ? '#9CA3AF' : '#1C1C1E', borderRadius: 2, transition: 'background 0.3s ease' }} />
                </div>
            </div>
        </>
    );
}

function PhoneShell() {
    const { darkMode } = useTheme();
    const [authStep, setAuthStep] = useState<AuthStep>(() =>
        localStorage.getItem(AUTO_LOGIN_KEY) ? 'main' : 'splash'
    );

    // ── OAuth2 콜백 처리 ──
    // Google 로그인 후 백엔드가 /?accessToken=...&refreshToken=... 로 리다이렉트
    // URL 파라미터에서 토큰을 꺼내 localStorage에 저장하고 메인 화면으로 전환
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        if (accessToken && refreshToken) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem(AUTO_LOGIN_KEY, '1');
            window.history.replaceState({}, '', '/'); // URL에서 토큰 파라미터 제거
            setAuthStep('main');
        }
    }, []);

    const handleLogin = (autoLogin: boolean) => {
        if (autoLogin) localStorage.setItem(AUTO_LOGIN_KEY, '1');
        else localStorage.removeItem(AUTO_LOGIN_KEY);
        setAuthStep('main');
    };

    const handleLogout = () => {
        localStorage.removeItem(AUTO_LOGIN_KEY);
        setAuthStep('login');
    };

    const statusBg = darkMode ? '#111827' : '#FFFFFF';
    const statusText = darkMode ? '#F9FAFB' : '#111827';
    const screenBg = darkMode ? '#111827' : '#FFFFFF';

    const isMain = authStep === 'main';

    return (
        <div style={{
            width: 375,
            height: 812,
            background: '#1C1C1E',
            borderRadius: 52,
            padding: 10,
            boxShadow: '0 0 0 1px #3A3A3C, 0 0 0 2px #2C2C2E, 0 50px 100px rgba(0,0,0,0.7)',
            position: 'relative',
            flexShrink: 0,
        }}>
            {/* Physical buttons */}
            <div style={{ position: 'absolute', left: -3, top: 92,  width: 3, height: 28, background: '#3A3A3C', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', left: -3, top: 136, width: 3, height: 56, background: '#3A3A3C', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', left: -3, top: 206, width: 3, height: 56, background: '#3A3A3C', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', right: -3, top: 156, width: 3, height: 72, background: '#3A3A3C', borderRadius: '0 2px 2px 0' }} />

            {/* Inner screen */}
            <div style={{
                width: '100%', height: '100%',
                background: screenBg, borderRadius: 44,
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
                transition: 'background 0.3s ease',
            }}>
                {/* Status bar — only shown on main app */}
                {isMain && (
                    <div style={{
                        height: 54, flexShrink: 0,
                        background: statusBg,
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                        padding: '0 28px 10px',
                        position: 'relative',
                        transition: 'background 0.3s ease',
                    }}>
                        <div style={{
                            position: 'absolute', top: 8,
                            left: '50%', transform: 'translateX(-50%)',
                            width: 118, height: 34,
                            background: '#1C1C1E', borderRadius: 20, zIndex: 10,
                        }} />
                        <span style={{
                            fontSize: 15, fontWeight: 600, color: statusText,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            letterSpacing: '-0.3px',
                            transition: 'color 0.3s ease',
                        }}>9:41</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                                <rect x="0"    y="8"   width="3"   height="4"  rx="0.5" fill={statusText} />
                                <rect x="4.7"  y="5.5" width="3"   height="6.5" rx="0.5" fill={statusText} />
                                <rect x="9.4"  y="3"   width="3"   height="9"  rx="0.5" fill={statusText} />
                                <rect x="14.1" y="0"   width="2.9" height="12" rx="0.5" fill={statusText} />
                            </svg>
                            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                                <path d="M8 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill={statusText}/>
                                <path d="M5 7.5C6 6.5 7 6 8 6s2 .5 3 1.5" stroke={statusText} strokeWidth="1.3" strokeLinecap="round"/>
                                <path d="M2.5 5C4.2 3.3 6 2.5 8 2.5S11.8 3.3 13.5 5" stroke={statusText} strokeWidth="1.3" strokeLinecap="round"/>
                                <path d="M0 2.5C2.4.8 5.1 0 8 0s5.6.8 8 2.5" stroke={statusText} strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                            <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
                                <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke={statusText} strokeWidth="1"/>
                                <rect x="2" y="2" width="17" height="8" rx="2" fill={statusText}/>
                                <path d="M23.5 4.5v3" stroke={statusText} strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                    </div>
                )}

                {/* Auth screens */}
                {authStep === 'splash' && (
                    <SplashScreen onDone={() => setAuthStep('login')} />
                )}
                {authStep === 'login' && (
                    <LoginScreen
                        onLogin={handleLogin}
                        onGoSignup={() => setAuthStep('signup')}
                    />
                )}
                {authStep === 'signup' && (
                    <SignupScreen
                        onSignup={() => { handleLogin(false); }}
                        onGoLogin={() => setAuthStep('login')}
                    />
                )}

                {/* Main app */}
                {isMain && (
                    <MemoryRouter initialEntries={['/']} initialIndex={0}>
                        <AppContent onLogout={handleLogout} />
                    </MemoryRouter>
                )}
            </div>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
        <CategoryProvider>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(160deg, #0F1B35 0%, #1A1A2E 50%, #16213E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 0',
            }}>
                <PhoneShell />
            </div>
        </CategoryProvider>
        </ThemeProvider>
    );
}

export default App;
