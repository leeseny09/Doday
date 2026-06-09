import { useState } from 'react';
import { Sparkles, TrendingUp, RotateCcw, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const BLUE = '#005AE0';

const WEEKS = [
  {
    label: '4월 22일 — 4월 28일',
    totalDone: 12, totalRolled: 8,
    categories: [
      { name: '공부', completion: 60, done: 9,  total: 15 },
      { name: '업무', completion: 75, done: 12, total: 16 },
      { name: '개인', completion: 33, done: 3,  total: 9  },
    ],
    tasks: [
      { text: 'React 기초 복습',    category: '공부', day: '월' },
      { text: '기획서 초안 작성',   category: '업무', day: '화' },
      { text: '운동 30분',          category: '개인', day: '수' },
    ],
    insight: '이번 주는 개인 할일 완료율이 낮았어요. 작은 목표부터 시작해보는 건 어떨까요?',
  },
  {
    label: '4월 29일 — 5월 5일',
    totalDone: 15, totalRolled: 6,
    categories: [
      { name: '공부', completion: 65, done: 10, total: 15 },
      { name: '업무', completion: 82, done: 14, total: 17 },
      { name: '개인', completion: 40, done: 4,  total: 10 },
    ],
    tasks: [
      { text: 'JPA 기초 강의',      category: '공부', day: '월' },
      { text: '코드 리뷰',          category: '업무', day: '수' },
      { text: '독서 30분',          category: '개인', day: '금' },
    ],
    insight: '업무 완료율이 꾸준히 오르고 있어요. 이 흐름을 유지해보세요!',
  },
  {
    label: '5월 7일 — 5월 13일',
    totalDone: 18, totalRolled: 5,
    categories: [
      { name: '공부', completion: 72, done: 11, total: 15 },
      { name: '업무', completion: 88, done: 15, total: 17 },
      { name: '개인', completion: 45, done: 5,  total: 11 },
    ],
    tasks: [
      { text: 'JPA 강의 듣기',        category: '공부', day: '월' },
      { text: 'API 문서 작성',         category: '업무', day: '화' },
      { text: 'Spring Security 공부', category: '공부', day: '수' },
      { text: '알고리즘 문제 5개',     category: '공부', day: '목' },
    ],
    insight: '공부 할일을 오후 10시 이후에 자주 미루고 있어요. 저녁 시간대 할일은 더 짧게 쪼개보는 건 어떨까요?',
  },
];

export function WeeklyReport() {
  const [weekIdx, setWeekIdx] = useState(WEEKS.length - 1);
  const week = WEEKS[weekIdx];
  const { totalDone, totalRolled, categories, tasks: weeklyTasks, insight } = week;
  const overallPct = Math.round((totalDone / (totalDone + totalRolled)) * 100);

  return (
    <div style={{
      background: '#FAFAFA',
      minHeight: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    }}>

      {/* ── Header + week nav ── */}
      <div style={{ background: '#FFFFFF', padding: '20px 20px 0', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.5px', marginBottom: 14 }}>
          주간 리포트
        </div>

        {/* Week selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <button
            onClick={() => setWeekIdx(i => Math.max(0, i - 1))}
            disabled={weekIdx === 0}
            style={{ border: 'none', background: 'none', cursor: weekIdx === 0 ? 'default' : 'pointer', padding: 4, lineHeight: 0 }}
          >
            <ChevronLeft size={18} color={weekIdx === 0 ? '#D1D5DB' : '#374151'} strokeWidth={2} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>{week.label}</div>
            <div style={{ fontSize: 11, color: '#374151', marginTop: 3, fontWeight: 500 }}>
              {weekIdx === WEEKS.length - 1 ? '이번 주' : `${WEEKS.length - 1 - weekIdx}주 전`}
            </div>
          </div>
          <button
            onClick={() => setWeekIdx(i => Math.min(WEEKS.length - 1, i + 1))}
            disabled={weekIdx === WEEKS.length - 1}
            style={{ border: 'none', background: 'none', cursor: weekIdx === WEEKS.length - 1 ? 'default' : 'pointer', padding: 4, lineHeight: 0 }}
          >
            <ChevronRight size={18} color={weekIdx === WEEKS.length - 1 ? '#D1D5DB' : '#374151'} strokeWidth={2} />
          </button>
        </div>

        {/* Hero: stats left (top-aligned with ring), ring right */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
            <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>이번 주 전체 완료율</div>
            <div style={{ display: 'flex', gap: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={17} color={BLUE} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.8px', lineHeight: 1 }}>{totalDone}</div>
                  <div style={{ fontSize: 11, color: '#374151', marginTop: 3, fontWeight: 500 }}>완료</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={16} color="#F97316" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.8px', lineHeight: 1 }}>{totalRolled}</div>
                  <div style={{ fontSize: 11, color: '#374151', marginTop: 3, fontWeight: 500 }}>이월</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ring — right side */}
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
            <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 5 }}>AI 인사이트</div>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{insight}</p>
          </div>
        </div>
      </div>

      {/* ── Category completion ── */}
      <div style={{ background: '#FFFFFF', margin: '10px 0', padding: '16px 20px' }}>
        <div style={{ fontSize: 11, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
          카테고리별 완료율
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {categories.map(cat => (
            <div key={cat.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{cat.name}</span>
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>{cat.done}/{cat.total}개</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: BLUE, letterSpacing: '-0.5px' }}>{cat.completion}%</span>
              </div>
              {/* Track */}
              <div style={{ height: 6, background: '#EFF6FF', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${cat.completion}%`,
                  background: BLUE,
                  borderRadius: 3,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Completed tasks ── */}
      <div style={{ background: '#FFFFFF', margin: '10px 0', padding: '16px 20px' }}>
        <div style={{ fontSize: 11, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
          이번 주 완료 할일
        </div>
        {weeklyTasks.map((task, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 0',
            borderBottom: i < weeklyTasks.length - 1 ? '1px solid #F8FAFC' : 'none',
          }}>
            <CheckCircle2 size={16} color={BLUE} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{task.text}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#9CA3AF' }}>{task.day}</span>
              <span style={{ fontSize: 10, color: BLUE, border: `1px solid ${BLUE}30`, borderRadius: 20, padding: '2px 7px' }}>
                {task.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Closing ── */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 3 }}>
          이번 주도 수고하셨어요!
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF' }}>
          다음 주 목표: 완료율 80%
        </div>
      </div>

    </div>
  );
}
