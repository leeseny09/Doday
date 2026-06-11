import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Circle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

type Task = {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  time?: string;
  isRolledOver?: boolean;
};

interface TodoResponse {
  id: number;
  title: string;
  isCompleted: boolean;
  category: string;
  scheduledDate: string;
  deadlineTime?: string | null;
  moveCount: number;
}

const CAT_COLOR: Record<string, string> = {
  '공부': '#005AE0',
  '업무': '#0EA5E9',
  '개인': '#8B5CF6',
};
const catColor = (cat: string) => CAT_COLOR[cat] ?? '#9CA3AF';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const DAY = ['일', '월', '화', '수', '목', '금', '토'];
  return { month: m, day: d, dayName: DAY[date.getDay()] + '요일' };
}

export function DayDetail() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();

  const today = getTodayStr();
  const dateStr = date ?? today;
  const isPast = dateStr < today;
  const isToday = dateStr === today;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const { month, day, dayName } = parseDate(dateStr);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get<TodoResponse[]>(`/api/todo?date=${dateStr}`);
      setTasks(res.data.map(t => ({
        id: t.id,
        text: t.title,
        completed: t.isCompleted,
        category: t.category,
        time: t.deadlineTime ? t.deadlineTime.substring(11, 16) : undefined,
        isRolledOver: t.moveCount > 0,
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [dateStr]);

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    console.log('[toggle] PATCH', id, '→', !task.completed);
    try {
      let res;
      if (task.completed) {
        res = await api.patch(`/api/todo/${id}/uncomplete`);
      } else {
        res = await api.patch(`/api/todo/${id}/complete`);
      }
      console.log('[toggle] response', res.data);
      if (res.data?.isCompleted !== undefined) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: res.data.isCompleted } : t));
      }
    } catch (e) {
      console.error(e);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: task.completed } : t));
    }
  };

  const addTask = async () => {
    if (!inputValue.trim()) return;
    try {
      await api.post('/api/todo', {
        title: inputValue.trim(),
        scheduledDate: dateStr,
        category: '기타',
      });
      setInputValue('');
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const rolledOver = tasks.filter(t => t.isRolledOver);
  const regular = tasks.filter(t => !t.isRolledOver);
  const completedCount = tasks.filter(t => t.completed).length;

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
      </div>
    );
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>

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

      {/* ── Content (loading opacity) ── */}
      <div style={{ opacity: loading ? 0.4 : 1, transition: 'opacity 0.2s' }}>

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
          {/* Input row */}
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

        {/* ── Empty state (past only) ── */}
        {tasks.length === 0 && isPast && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0', gap: 6 }}>
            <div style={{ fontSize: 28 }}>📋</div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>이 날은 할 일이 없었어요</div>
          </div>
        )}

      </div>
    </div>
  );
}
