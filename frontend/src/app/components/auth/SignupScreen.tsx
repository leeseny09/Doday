import { useState } from 'react';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import api from '../../../api/axios';

interface Props {
  onSignup: () => void;
  onGoLogin: () => void;
}

export function SignupScreen({ onSignup, onGoLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
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

  const pwStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: '너무 짧아요', color: '#EF4444', width: '25%' };
    if (password.length < 8) return { label: '보통', color: '#F97316', width: '55%' };
    return { label: '안전해요', color: '#22C55E', width: '100%' };
  })();

  const handleSignup = async () => {
    if (!name.trim()) { setError('이름을 입력해주세요.'); return; }
    if (!email.trim()) { setError('이메일을 입력해주세요.'); return; }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 해요.'); return; }
    if (!agreed) { setError('이용약관에 동의해주세요.'); return; }
    setError('');
    try {
      // 백엔드 회원가입 api 호출
      const response = await api.post('/api/auth/signup', { email, password, name });

      // 회원가입 성공 시 토큰 저장 후 메인으로 이동
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      onSignup();
    } catch (e : any) {
      if (e.response?.data?.message === '이미 사용중인 이메일입니다.') {
        setError('이미 사용 중인 이메일이에요.');
      } else {
        setError('회원가입에 실패했어요. 다시 시도해주세요.');
      }
      
    }
    
  };

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Back button — stays at top */}
      <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
        <button
          onClick={onGoLogin}
          style={{
            border: 'none', background: 'none', cursor: 'pointer', padding: '6px 4px',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 14, color: '#374151', fontFamily: 'inherit',
          }}
        >
          <ChevronLeft size={18} strokeWidth={2.5} color="#374151" />
          로그인으로
        </button>
      </div>

      {/* Header — aligned with login (120px - ~46px back button area) */}
      <div style={{ padding: '74px 28px 0' }}>
        <div style={{ fontSize: 13, color: blue, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 10 }}>
          DODAY
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 20 }}>
          시작해봐요! 🚀
        </div>
        <div style={{ fontSize: 13, color: sub }}>
          계정을 만들고 오늘부터 할 일을 관리해요
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '36px 28px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>이름</div>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="홍길동"
            style={inputBase}
            onFocus={e => (e.target.style.borderColor = blue)}
            onBlur={e => (e.target.style.borderColor = bdr)}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>이메일</div>
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
          <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>비밀번호</div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="6자 이상 입력"
              style={{ ...inputBase, paddingRight: 44 }}
              onFocus={e => (e.target.style.borderColor = blue)}
              onBlur={e => (e.target.style.borderColor = bdr)}
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
          {pwStrength && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 3, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pwStrength.width, background: pwStrength.color, borderRadius: 2, transition: 'width 0.3s ease, background 0.3s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: pwStrength.color, marginTop: 4, fontWeight: 500 }}>{pwStrength.label}</div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ fontSize: 12, color: '#EF4444', padding: '8px 12px', background: '#FEF2F2', borderRadius: 10 }}>
            {error}
          </div>
        )}

        {/* Terms */}
        <button
          onClick={() => setAgreed(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', textAlign: 'left',
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
            background: agreed ? blue : '#FFFFFF',
            border: `1.5px solid ${agreed ? blue : bdr}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}>
            {agreed && (
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: 12, color: sub }}>
            <span style={{ color: blue, fontWeight: 600 }}>이용약관</span> 및{' '}
            <span style={{ color: blue, fontWeight: 600 }}>개인정보처리방침</span>에 동의합니다
          </span>
        </button>

        <button
          onClick={handleSignup}
          style={{
            marginTop: 4,
            width: '100%', padding: '14px',
            background: blue, color: '#FFFFFF',
            border: 'none', borderRadius: 14,
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            letterSpacing: '-0.2px',
            boxShadow: '0 4px 14px rgba(0,90,224,0.3)',
            opacity: (!name || !email || password.length < 6 || !agreed) ? 0.5 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          가입하기
        </button>
      </div>

      {/* Login link */}
      <div style={{ padding: '20px 28px 32px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: sub }}>이미 계정이 있으신가요? </span>
        <button
          onClick={onGoLogin}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: blue, fontWeight: 700, fontFamily: 'inherit' }}
        >
          로그인
        </button>
      </div>
    </div>
  );
}
