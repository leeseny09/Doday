import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, RotateCcw } from 'lucide-react';
import api from '../../api/axios';

const BLUE = '#005AE0';

interface WeeklyReportData {
  weekStartDate: string;
  totalTodos: number;
  completedTodos: number;
  movedTodos: number;
  completionRate: number;
}

interface DayTodo {
  id: number;
  isCompleted: boolean;
  moveCount: number;
}

function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

export function WeeklyReport({ isActive }: { isActive?: boolean }) {
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    setError(false);
    const weekDates = getWeekDates();
    Promise.all(weekDates.map(date =>
      api.get<DayTodo[]>(`/api/todo?date=${date}`).then(r => r.data)
    ))
      .then(results => {
        const allTodos = results.flat();
        const totalTodos = allTodos.length;
        const completedTodos = allTodos.filter(t => t.isCompleted).length;
        const movedTodos = allTodos.filter(t => t.moveCount > 0).length;
        const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
        setReport({ weekStartDate: weekDates[0], totalTodos, completedTodos, movedTodos, completionRate });
      })
      .catch(e => { console.error(e); setError(true); });
  }, [isActive]);

  if (!report) {
    if (error) {
      return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', gap: 8 }}>
            <div style={{ fontSize: 28 }}>📊</div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>이번 주 리포트가 아직 없어요</div>
            <div style={{ fontSize: 11, color: '#D1D5DB' }}>할일을 추가하고 완료해보세요!</div>
          </div>
      );
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}>
          <div style={{ fontSize: 13, color: '#9CA3AF' }}>불러오는 중...</div>
        </div>
    );
  }

  const overallPct = Math.round(report.completionRate);

  // 주간 날짜 라벨 계산
  const weekStart = new Date(report.weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekLabel = `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 — ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`;

  return (
      <div style={{
        background: '#FAFAFA',
        minHeight: '100%',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      }}>

        {/* ── Header ── */}
        <div style={{ background: '#FFFFFF', padding: '20px 20px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.5px', marginBottom: 14 }}>
            주간 리포트
          </div>

          {/* Week label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>{weekLabel}</div>
              <div style={{ fontSize: 11, color: '#374151', marginTop: 3, fontWeight: 500 }}>이번 주</div>
            </div>
          </div>

          {/* Hero stats + ring */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
              <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>이번 주 전체 완료율</div>
              <div style={{ display: 'flex', gap: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={17} color={BLUE} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.8px', lineHeight: 1 }}>{report.completedTodos}</div>
                    <div style={{ fontSize: 11, color: '#374151', marginTop: 3, fontWeight: 500 }}>완료</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RotateCcw size={16} color="#F97316" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.8px', lineHeight: 1 }}>{report.movedTodos}</div>
                    <div style={{ fontSize: 11, color: '#374151', marginTop: 3, fontWeight: 500 }}>이월</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ring */}
            <div style={{ position: 'relative', width: 82, height: 82, flexShrink: 0 }}>
              <svg width="82" height="82" viewBox="0 0 82 82">
                <circle cx="41" cy="41" r="35" fill="none" stroke="#EFF6FF" strokeWidth="7" />
                <circle
                    cx="41" cy="41" r="35" fill="none"
                    stroke={BLUE} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - overallPct / 100)}`}
                    transform="rotate(-90 41 41)"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: BLUE, letterSpacing: '-0.5px' }}>{overallPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── AI insight ── */}
        <div style={{ background: '#FFFFFF', margin: '10px 0', padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <Sparkles size={15} color={BLUE} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 5 }}>이번 주 요약</div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>
                이번 주 총 {report.totalTodos}개의 할일 중 {report.completedTodos}개를 완료했어요.
                완료율은 {overallPct}%이고 {report.movedTodos}개가 이월됐어요.
                {overallPct >= 80 ? ' 훌륭해요! 이 흐름을 유지해보세요 🎉' : overallPct >= 50 ? ' 절반 이상 완료했어요. 조금만 더 화이팅! 💪' : ' 작은 목표부터 차근차근 시작해봐요 😊'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ background: '#FFFFFF', margin: '10px 0', padding: '16px 20px' }}>
          <div style={{ fontSize: 11, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
            이번 주 통계
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>전체 완료율</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: BLUE }}>{overallPct}%</span>
              </div>
              <div style={{ height: 6, background: '#EFF6FF', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${overallPct}%`, background: BLUE, borderRadius: 3, transition: 'width 0.6s ease' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
              <span>전체 할일</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{report.totalTodos}개</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
              <span>완료한 할일</span>
              <span style={{ fontWeight: 700, color: BLUE }}>{report.completedTodos}개</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
              <span>이월한 할일</span>
              <span style={{ fontWeight: 700, color: '#F97316' }}>{report.movedTodos}개</span>
            </div>
          </div>
        </div>

        {/* ── Closing ── */}
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 3 }}>
            이번 주도 수고하셨어요!
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>
            다음 주 목표: 완료율 {Math.min(100, overallPct + 10)}%
          </div>
        </div>

      </div>
  );
}