import { useState, useEffect } from 'react';
import { Clock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

interface DeadlineModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
  todo: { text: string; deadline: string };
}

type Phase = 'prompt' | 'loading' | 'result';

// Fallback AI rescheduling result (API 미구현 시 사용)
const AI_RESULT_FALLBACK = {
  movedTo: '내일 오후 8:00',
  reason: '오후 시간대 두 시간이 비어 있어요. 집중력이 높은 저녁 시간대에 배치했어요.',
  tomorrowSchedule: [
    { time: '오전 9:00', text: 'Spring Security 복습', category: '공부', isNew: false },
    { time: '오후 2:00', text: '팀 미팅 준비', category: '업무', isNew: false },
    { time: '오후 8:00', text: '', category: '업무', isNew: true }, // text filled from todo
  ],
};

const CAT_COLOR: Record<string, string> = {
  '공부': '#005AE0', '업무': '#0EA5E9', '개인': '#8B5CF6',
};

export function DeadlineModal({ open, onClose, onComplete, todo }: DeadlineModalProps) {
  const [phase, setPhase] = useState<Phase>('prompt');
  const [dotCount, setDotCount] = useState(1);
  const [demoTodo, setDemoTodo] = useState<{ id: number; text: string; deadline: string } | null>(null);
  const [aiResult, setAiResult] = useState(AI_RESULT_FALLBACK);

  // Animated loading dots
  useEffect(() => {
    if (phase !== 'loading') return;
    const id = setInterval(() => setDotCount(n => (n % 3) + 1), 400);
    return () => clearInterval(id);
  }, [phase]);

  // Reset + fetch real todo when opened
  useEffect(() => {
    if (!open) return;
    setPhase('prompt');
    setAiResult(AI_RESULT_FALLBACK);
    const today = new Date().toISOString().split('T')[0];
    api.get(`/api/todo?date=${today}`)
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        const incomplete = list.filter((t: any) => !t.isCompleted);
        const target = incomplete.find((t: any) => t.deadlineTime) ?? incomplete[0];
        if (target) {
          setDemoTodo({
            id: target.id,
            text: target.title,
            deadline: target.deadlineTime
              ? target.deadlineTime.substring(11, 16)
              : '오늘 마감',
          });
        }
      })
      .catch(console.error);
  }, [open]);

  const handleComplete = async () => {
    if (demoTodo?.id) {
      try {
        await api.patch(`/api/todo/${demoTodo.id}/complete`);
        onComplete?.();
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  const handleDefer = async () => {
    setPhase('loading');
    try {
      const res = await api.post(`/api/todo/${demoTodo?.id ?? 0}/defer`);
      setAiResult({
        movedTo: res.data.movedTo ?? '내일',
        reason: res.data.reason ?? 'AI가 최적 시간대에 배치했어요.',
        tomorrowSchedule: Array.isArray(res.data.tomorrowSchedule) ? res.data.tomorrowSchedule : [],
      });
    } catch {
      setAiResult(AI_RESULT_FALLBACK);
    } finally {
      setPhase('result');
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={phase === 'result' ? onClose : undefined}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF', borderRadius: 22, width: '100%',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          overflow: 'hidden',
        }}
      >

        {/* ── PHASE: prompt ── */}
        {phase === 'prompt' && (
          <div style={{ padding: '28px 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} color="#005AE0" strokeWidth={1.8} />
              </div>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 5, letterSpacing: '-0.3px' }}>마감 시간이에요</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>이 할 일, 오늘 끝냈나요?</div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '14px 0', marginBottom: 22 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4, letterSpacing: '-0.2px' }}>{demoTodo?.text ?? todo.text}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>마감 {demoTodo?.deadline ?? todo.deadline}</div>
            </div>
            <button onClick={handleComplete} style={{ width: '100%', padding: '14px', background: '#005AE0', color: '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit', letterSpacing: '-0.1px' }}>
              완료했어요
            </button>
            <button onClick={handleDefer} style={{ width: '100%', padding: '14px', background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              내일로 넘길게요
            </button>
          </div>
        )}

        {/* ── PHASE: loading ── */}
        {phase === 'loading' && (
          <div style={{ padding: '40px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* Pulsing AI icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 1.2s ease-in-out infinite',
            }}>
              <Sparkles size={24} color="#005AE0" strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6, letterSpacing: '-0.2px' }}>
                AI가 내일 일정을 분석하고 있어요{'.'.repeat(dotCount)}
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                밀린 일정을 최적 시간대에 배치할게요
              </div>
            </div>
            {/* Progress steps */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              {[
                { label: '이월 항목 확인', done: true },
                { label: '내일 일정 분석', done: dotCount >= 2 },
                { label: '최적 시간대 계산', done: dotCount >= 3 },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 8,
                    background: step.done ? '#005AE0' : '#F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.3s ease', flexShrink: 0,
                  }}>
                    {step.done && <CheckCircle2 size={10} color="#FFFFFF" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 12, color: step.done ? '#374151' : '#9CA3AF', transition: 'color 0.3s ease' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASE: result ── */}
        {phase === 'result' && (
          <div style={{ padding: '24px 24px 22px' }}>
            {/* Success header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={18} color="#005AE0" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>AI가 일정을 재배치했어요</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>내일 스케줄에 추가됐어요</div>
              </div>
            </div>

            {/* What moved */}
            <div style={{ background: '#F8FBFF', border: '1px solid #DBEAFE', borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 3 }}>이월된 할 일</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{demoTodo?.text ?? todo.text}</div>
                </div>
                <ArrowRight size={16} color="#BFDBFE" strokeWidth={2} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 3 }}>배치된 시간</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#005AE0' }}>{aiResult.movedTo}</div>
                </div>
              </div>
            </div>

            {/* AI reason */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: '0 2px' }}>
              <div style={{ width: 2, background: '#0EA5E9', borderRadius: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.6 }}>
                {aiResult.reason}
              </p>
            </div>

            {/* Tomorrow's schedule */}
            {aiResult.tomorrowSchedule.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
                내일 업데이트된 일정
              </div>
              {aiResult.tomorrowSchedule.map((item, i) => {
                const text = item.isNew ? (demoTodo?.text ?? todo.text) : item.text;
                const cc = CAT_COLOR[item.category] ?? '#9CA3AF';
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 10,
                    background: item.isNew ? '#EFF6FF' : 'transparent',
                    marginBottom: 4,
                    border: item.isNew ? '1px solid #DBEAFE' : 'none',
                  }}>
                    <span style={{ fontSize: 11, color: item.isNew ? '#005AE0' : '#9CA3AF', width: 52, flexShrink: 0, fontWeight: item.isNew ? 600 : 400 }}>
                      {item.time}
                    </span>
                    <span style={{ flex: 1, fontSize: 12, color: item.isNew ? '#111827' : '#6B7280', fontWeight: item.isNew ? 600 : 400 }}>
                      {text}
                    </span>
                    {item.isNew && (
                      <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, background: '#005AE0', color: '#FFFFFF', flexShrink: 0 }}>AI 배치</span>
                    )}
                    {!item.isNew && (
                      <span style={{ fontSize: 9, color: cc, border: `1px solid ${cc}30`, borderRadius: 20, padding: '1px 6px', flexShrink: 0 }}>{item.category}</span>
                    )}
                  </div>
                );
              })}
            </div>
            )}

            <button
              onClick={onClose}
              style={{ width: '100%', padding: '14px', background: '#005AE0', color: '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.1px' }}
            >
              확인
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
