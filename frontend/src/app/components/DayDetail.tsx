import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Circle, CheckCircle2, Sparkles, Clock, ArrowRight } from 'lucide-react';

// ── Shared mock data ──────────────────────────────────────────────────────────
type Task = {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  time?: string;
  isRolledOver?: boolean;
  isAiSuggested?: boolean;
};

const TASKS_BY_DATE: Record<string, Task[]> = {
  '2026-05-07': [
    { id: 'd07-1', text: '팀 미팅 준비', completed: true, category: '업무', time: '오전 10:00' },
    { id: 'd07-2', text: 'React 복습', completed: true, category: '공부', time: '오후 8:00' },
  ],
  '2026-05-08': [
    { id: 'd08-1', text: '독서 1시간', completed: false, category: '개인', time: '오후 9:00' },
    { id: 'd08-2', text: 'JPA 강의 듣기', completed: true, category: '공부', time: '오후 7:00' },
  ],
  '2026-05-09': [
    { id: 'd09-1', text: '주간 계획 세우기', completed: true, category: '개인', time: '오전 9:00' },
  ],
  '2026-05-10': [
    { id: 'd10-1', text: '알고리즘 문제 3개', completed: true, category: '공부', time: '오후 3:00' },
    { id: 'd10-2', text: '독서 1시간', completed: true, category: '개인', time: '오후 10:00' },
  ],
  '2026-05-11': [
    { id: 'd11-1', text: '운동 30분', completed: false, category: '개인', time: '오전 7:00' },
  ],
  '2026-05-12': [
    { id: 'd12-1', text: 'JPA 강의 듣기', completed: true, category: '공부', time: '오후 2:00' },
    { id: 'd12-2', text: 'API 문서 작성', completed: true, category: '업무', time: '오전 10:00' },
  ],
  '2026-05-13': [
    { id: 'd13-1', text: '포폴 README 작성', completed: false, category: '업무', time: '오늘 마감' },
    { id: 'd13-2', text: 'Spring Security 공부', completed: false, category: '공부', time: '오후 11:00' },
    { id: 'd13-3', text: '알고리즘 문제 2개', completed: false, category: '공부' },
  ],
  '2026-05-14': [
    { id: 'd14-1', text: 'React 최적화 공부', completed: false, category: '공부', time: '오후 3:00' },
    { id: 'd14-2', text: '포폴 README 작성', completed: false, category: '업무', time: '오후 8:00', isRolledOver: true },
  ],
  '2026-05-15': [
    { id: 'd15-1', text: '헬스장 등록', completed: false, category: '개인', time: '오전 11:00' },
  ],
  '2026-05-16': [
    { id: 'd16-1', text: '코드 리뷰', completed: false, category: '업무', time: '오전 10:00' },
  ],
  '2026-05-19': [
    { id: 'd19-1', text: '포트폴리오 배포', completed: false, category: '업무', time: '오후 4:00' },
  ],
};

const AI_PLANS: Record<string, { message: string; tasks: Omit<Task, 'id' | 'completed' | 'isAiSuggested'>[] }> = {
  '2026-05-15': {
    message: '헬스장 등록 외에 일정이 비어 있어요. 이번 주 남은 학습 항목을 채워드릴게요.',
    tasks: [
      { text: '알고리즘 문제 2개', category: '공부', time: '오후 2:00' },
      { text: 'Spring Security 복습', category: '공부', time: '오후 7:00' },
    ],
  },
  '2026-05-16': {
    message: '코드 리뷰 이후 오후 일정이 비어 있어요. 밀린 공부 항목을 배치해드렸어요.',
    tasks: [
      { text: '알고리즘 추가 문제 1개', category: '공부', time: '오후 3:00' },
    ],
  },
  '2026-05-19': {
    message: '배포 마감일이에요. 최종 점검 단계를 미리 나눠드릴게요.',
    tasks: [
      { text: '최종 코드 리뷰', category: '업무', time: '오전 9:00' },
      { text: '배포 후 테스트', category: '업무', time: '오후 6:00' },
    ],
  },
};

// ── Color helpers ─────────────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  '공부': '#005AE0',
  '업무': '#0EA5E9',
  '개인': '#8B5CF6',
};
const catColor = (cat: string) => CAT_COLOR[cat] ?? '#9CA3AF';

// ── Date formatting ───────────────────────────────────────────────────────────
function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const DAY = ['일', '월', '화', '수', '목', '금', '토'];
  return { month: m, day: d, dayName: DAY[date.getDay()] + '요일' };
}

// ── Component ─────────────────────────────────────────────────────────────────
export function DayDetail() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();

  const dateStr = date ?? '2026-05-13';
  const today = '2026-05-13';
  const isPast = dateStr < today;
  const isToday = dateStr === today;

  const [tasks, setTasks] = useState<Task[]>(TASKS_BY_DATE[dateStr] ?? []);
  const [inputValue, setInputValue] = useState('');
  const [aiPlanDismissed, setAiPlanDismissed] = useState(false);

  const { month, day, dayName } = parseDate(dateStr);
  const aiPlan = AI_PLANS[dateStr];

  const rolledOver = tasks.filter(t => t.isRolledOver);
  const regular = tasks.filter(t => !t.isRolledOver && !t.isAiSuggested);
  const aiSuggested = tasks.filter(t => t.isAiSuggested);

  const completedCount = tasks.filter(t => t.completed).length;

  const toggleTask = (id: string) =>
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const addTask = () => {
    if (!inputValue.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: inputValue, completed: false, category: '' }]);
    setInputValue('');
  };

  const acceptAiPlan = () => {
    if (!aiPlan) return;
    const newTasks: Task[] = aiPlan.tasks.map((t, i) => ({
      ...t, id: `ai-${Date.now()}-${i}`, completed: false, isAiSuggested: true,
    }));
    setTasks(prev => [...prev, ...newTasks]);
    setAiPlanDismissed(true);
  };

  const TaskRow = ({ task }: { task: Task }) => {
    const cc = catColor(task.category);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderBottom: '1px solid #F8FAFC' }}>
        <button onClick={() => toggleTask(task.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, flexShrink: 0 }}>
          {task.completed
            ? <CheckCircle2 size={18} color="#22C55E" strokeWidth={2} />
            : <Circle size={18} color="#D1D5DB" strokeWidth={1.5} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: task.completed ? '#9CA3AF' : '#111827', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: 1.4 }}>
            {task.text}
          </div>
          {task.time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
              <Clock size={10} color={task.isRolledOver ? '#F97316' : '#9CA3AF'} strokeWidth={2} />
              <span style={{ fontSize: 10, color: task.isRolledOver ? '#F97316' : '#9CA3AF' }}>{task.time}</span>
            </div>
          )}
        </div>
        {task.category && (
          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, border: `1px solid ${cc}40`, color: cc, flexShrink: 0 }}>
            {task.category}
          </span>
        )}
        {task.isRolledOver && (
          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, background: '#FFF7ED', border: '1px solid #FED7AA', color: '#F97316', flexShrink: 0 }}>
            AI 이월
          </span>
        )}
        {task.isAiSuggested && (
          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#005AE0', flexShrink: 0 }}>
            AI 추천
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #F1F5F9' }}>
        <button
          onClick={() => navigate('/calendar')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBottom: 10 }}
        >
          <ChevronLeft size={18} color="#005AE0" strokeWidth={2.5} />
          <span style={{ fontSize: 13, color: '#005AE0', fontWeight: 500 }}>일정</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{dayName} {isToday ? '· 오늘' : isPast ? '· 지난 일정' : '· 예정'}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.5px' }}>
              {month}월 {day}일
            </div>
          </div>
          {tasks.length > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: completedCount === tasks.length ? '#22C55E' : '#005AE0', letterSpacing: '-0.5px' }}>
                {completedCount}/{tasks.length}
              </div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>완료</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Rolled-over section ── */}
      {rolledOver.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px 4px' }}>
            <ArrowRight size={11} color="#F97316" strokeWidth={2.5} />
            <span style={{ fontSize: 10, color: '#F97316', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              AI 이월 · {rolledOver.length}
            </span>
          </div>
          {rolledOver.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}

      {/* ── Regular tasks + inline input ── */}
      <div>
        {(regular.length > 0 || !isPast) && (
          <div style={{ padding: '10px 20px 4px', fontSize: 10, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            {isPast ? '할 일 목록' : '할 일'}{regular.length > 0 ? ` · ${regular.length}` : ''}
          </div>
        )}
        {/* Input row — same level as task rows */}
        {!isPast && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderBottom: '1px solid #F8FAFC' }}>
            <Circle size={18} color="#D1D5DB" strokeWidth={1.5} style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
              placeholder="할 일 추가..."
              style={{ flex: 1, fontSize: 13, color: '#111827', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit' }}
            />
            {inputValue.trim() && (
              <button onClick={addTask} style={{ fontSize: 12, fontWeight: 600, color: '#005AE0', border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                추가
              </button>
            )}
          </div>
        )}
        {regular.map(t => <TaskRow key={t.id} task={t} />)}
      </div>

      {/* ── AI suggested tasks ── */}
      {aiSuggested.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px 4px' }}>
            <Sparkles size={11} color="#005AE0" strokeWidth={2} />
            <span style={{ fontSize: 10, color: '#005AE0', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              AI 추천 · {aiSuggested.length}
            </span>
          </div>
          {aiSuggested.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}

      {/* ── Empty state (past only) ── */}
      {tasks.length === 0 && isPast && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0', gap: 6 }}>
          <div style={{ fontSize: 28 }}>📋</div>
          <div style={{ fontSize: 13, color: '#9CA3AF' }}>이 날은 할 일이 없었어요</div>
        </div>
      )}

      {/* ── AI Plan suggestion (future dates) ── */}
      {aiPlan && !aiPlanDismissed && !isPast && (
        <div style={{ margin: '14px 16px' }}>
          <div style={{
            border: '1px solid #BFDBFE', borderRadius: 16,
            background: '#F8FBFF', overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #DBEAFE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Sparkles size={13} color="#005AE0" strokeWidth={2} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#005AE0' }}>AI 추천 계획</span>
              </div>
              <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.6 }}>{aiPlan.message}</p>
            </div>
            <div style={{ padding: '10px 14px' }}>
              {aiPlan.tasks.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: i < aiPlan.tasks.length - 1 ? 8 : 0 }}>
                  <span style={{ fontSize: 10, color: '#9CA3AF', width: 52, flexShrink: 0 }}>{t.time}</span>
                  <span style={{ fontSize: 12, color: '#111827', flex: 1 }}>{t.text}</span>
                  <span style={{ fontSize: 10, color: catColor(t.category), border: `1px solid ${catColor(t.category)}40`, borderRadius: 20, padding: '1px 6px' }}>{t.category}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '0 14px 14px' }}>
              <button
                onClick={() => setAiPlanDismissed(true)}
                style={{ flex: 1, padding: '10px', background: 'transparent', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                무시
              </button>
              <button
                onClick={acceptAiPlan}
                style={{ flex: 2, padding: '10px', background: '#005AE0', color: '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                이 계획 수락하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
