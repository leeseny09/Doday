import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  onLogin: (autoLogin: boolean) => void;
  onGoSignup: () => void;
}

export function LoginScreen({ onLogin, onGoSignup }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const [error, setError] = useState('');

  const blue = '#005AE0';
  const sub  = '#6B7280';
  const bdr  = '#E5E7EB';

  const inputBase = {
    width: '100%', boxSizing: 'border-box' as const,
    fontSize: 14, color: '#111827', padding: '13px 14px',
    border: `1.5px solid ${bdr}`,
    borderRadius: 14, outline: 'none',
    background: '#F9FAFB',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  };

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setError('');
    onLogin(autoLogin);
  };

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top brand — pushed down */}
      <div style={{ padding: '120px 28px 0' }}>
        <div style={{ fontSize: 13, color: blue, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 10 }}>
          DODAY
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 20 }}>
          다시 만나서<br />반가워요 👋
        </div>
        <div style={{ fontSize: 13, color: sub }}>
          로그인하고 오늘의 할 일을 시작해요
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '36px 28px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            이메일
          </div>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="example@doday.app"
            style={inputBase}
            onFocus={e => (e.target.style.borderColor = blue)}
            onBlur={e => (e.target.style.borderColor = bdr)}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            비밀번호
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="비밀번호 입력"
              style={{ ...inputBase, paddingRight: 44 }}
              onFocus={e => (e.target.style.borderColor = blue)}
              onBlur={e => (e.target.style.borderColor = bdr)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={() => setShowPw(v => !v)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 0,
              }}
            >
              {showPw ? <EyeOff size={17} color={sub} /> : <Eye size={17} color={sub} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: '#EF4444', padding: '8px 12px', background: '#FEF2F2', borderRadius: 10 }}>
            {error}
          </div>
        )}

        {/* Auto login + forgot pw row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setAutoLogin(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
              background: autoLogin ? blue : '#FFFFFF',
              border: `1.5px solid ${autoLogin ? blue : bdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}>
              {autoLogin && (
                <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                  <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 12, color: sub }}>자동 로그인</span>
          </button>
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: 12, color: sub, fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        <button
          onClick={handleLogin}
          style={{
            marginTop: 4,
            width: '100%', padding: '14px',
            background: blue, color: '#FFFFFF',
            border: 'none', borderRadius: 14,
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            letterSpacing: '-0.2px',
            boxShadow: '0 4px 14px rgba(0,90,224,0.3)',
          }}
        >
          로그인
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0' }}>
          <div style={{ flex: 1, height: 1, background: bdr }} />
          <span style={{ fontSize: 11, color: sub }}>또는</span>
          <div style={{ flex: 1, height: 1, background: bdr }} />
        </div>

        <button
          onClick={() => onLogin(autoLogin)}
          style={{
            width: '100%', padding: '13px',
            background: '#FFFFFF', color: '#111827',
            border: `1.5px solid ${bdr}`, borderRadius: 14,
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google로 계속하기
        </button>
      </div>

      {/* Sign up link */}
      <div style={{ padding: '20px 28px 32px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: sub }}>아직 계정이 없으신가요? </span>
        <button
          onClick={onGoSignup}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: blue, fontWeight: 700, fontFamily: 'inherit' }}
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
