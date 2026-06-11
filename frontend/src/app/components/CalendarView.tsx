import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Circle, CheckCircle2, X } from 'lucide-react';
import api from '../../api/axios';

interface CalTask {
  id: number;
  date: string;
  text: string;
  completed: boolean;
  category: string;
}

interface TodoResponse {
  id: number;
  title: string;
  isCompleted: boolean;
  category: string;
  scheduledDate: string;
  deadlineTime?: string | null;
  moveCount: number;
}

const CAT_COLORS: Record<string, string> = {
  '공부': '#005AE0',
  '업무': '#0EA5E9',
  '개인': '#8B5CF6',
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getTodayStr() {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export function CalendarView({ isActive }: { isActive?: boolean }) {
  const navigate = useNavigate();
  const today = getTodayStr();
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<CalTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const isAdding = useRef(false);
  const [inputValue, setInputValue] = useState('');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const fetchTasks = async (y: number, m: number) => {
    setLoading(true);
    try {
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const requests = Array.from({ length: daysInMonth }, (_, i) => {
        const dateStr = toDateStr(y, m, i + 1);
        return api.get<TodoResponse[]>(`/api/todo?date=${dateStr}`)
          .then(res => res.data.map(t => ({
            id: t.id,
            date: t.scheduledDate,
            text: t.title,
            completed: t.isCompleted,
            category: t.category,
          })));
      });
      const results = await Promise.all(requests);
      setTasks(results.flat());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) fetchTasks(year, month);
  }, [isActive, year, month]);

  const getTasksForDate = (dateStr: string) => tasks.filter(t => t.date === dateStr);

  const handleAddTask = async () => {
    if (!inputValue.trim() || isAdding.current) return;
    isAdding.current = true;
    setAddLoading(true);
    try {
      const res = await api.post('/api/todo', {
        title: inputValue.trim(),
        scheduledDate: selectedDate,
      });
      setTasks(prev => [...prev, {
        id: res.data.id,
        date: selectedDate,
        text: res.data.title ?? inputValue.trim(),
        completed: false,
        category: res.data.category ?? '',
      }]);
      setInputValue('');
    } catch (e) {
      console.error(e);
    } finally {
      isAdding.current = false;
      setAddLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/api/todo/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const getDayStatus = (dateStr: string) => {
    const t = getTasksForDate(dateStr);
    if (!t.length) return 'empty';
    if (t.every(x => x.completed)) return 'done';
    if (t.some(x => x.completed)) return 'partial';
    return 'active';
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectedTasks = getTasksForDate(selectedDate);

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const formatSelectedDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayName = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][date.getDay()];
    const isPast = dateStr < today;
    if (dateStr === today) return `${parseInt(m)}월 ${parseInt(d)}일 · 오늘`;
    if (isPast) return `${parseInt(m)}월 ${parseInt(d)}일 · ${dayName} (지난 일정)`;
    return `${parseInt(m)}월 ${parseInt(d)}일 · ${dayName}`;
  };

  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const dateStr = toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
    const label = DAY_LABELS[d.getDay()];
    const dayTasks = tasks.filter(t => t.date === dateStr);
    return {
      label,
      date: dateStr,
      done: dayTasks.filter(t => t.completed).length,
      total: dayTasks.length,
    };
  });

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.5px' }}>일정 캘린더</div>
      </div>

      {/* ── Month nav ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 8px' }}>
        <button onClick={prevMonth} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
          <ChevronLeft size={18} color="#6B7280" strokeWidth={2} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>
          {year}년 {MONTH_NAMES[month]}
        </span>
        <button onClick={nextMonth} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
          <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
        </button>
      </div>

      {/* ── Day labels ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 14px', marginBottom: 4 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 600,
            color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#9CA3AF',
            paddingBottom: 4,
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 14px', gap: '2px 0', opacity: loading ? 0.4 : 1, transition: 'opacity 0.2s' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = toDateStr(year, month, day);
          const status = getDayStatus(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isPast = dateStr < today;

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              onDoubleClick={() => navigate(`/calendar/${dateStr}`)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}
            >
              <div style={{
                width: 30, height: 30,
                borderRadius: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSelected ? '#005AE0' : isToday ? '#EFF6FF' : 'transparent',
                border: isToday && !isSelected ? '1.5px solid #005AE0' : 'none',
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: isToday || isSelected ? 700 : 400,
                  color: isSelected ? '#FFFFFF' : isToday ? '#005AE0' : isPast ? '#9CA3AF' : '#111827',
                }}>
                  {day}
                </span>
              </div>
              {/* Task dots */}
              <div style={{ display: 'flex', gap: 2, marginTop: 2, height: 6, alignItems: 'center' }}>
                {status === 'done' && (
                  <div style={{ width: 5, height: 5, borderRadius: 3, background: '#22C55E' }} />
                )}
                {status === 'active' && (
                  <div style={{ width: 5, height: 5, borderRadius: 3, background: '#005AE0' }} />
                )}
                {status === 'partial' && (
                  <>
                    <div style={{ width: 4, height: 4, borderRadius: 2, background: '#22C55E' }} />
                    <div style={{ width: 4, height: 4, borderRadius: 2, background: '#005AE0' }} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dot legend ── */}
      <div style={{ display: 'flex', gap: 14, padding: '8px 20px 0', borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
        {[
          { color: '#005AE0', label: '미완료 있음' },
          { color: '#22C55E', label: '전부 완료' },
          { color: '#9CA3AF', label: '없음' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: item.color }} />
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── Selected day: inline input + task list ── */}
      <div style={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>
            {formatSelectedDate(selectedDate)}
          </div>
          {selectedTasks.length > 0 && (
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>
              {selectedTasks.filter(t => t.completed).length}/{selectedTasks.length} 완료
            </span>
          )}
        </div>

        {/* Inline input — 항상 노출 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
          <Circle size={17} color="#D1D5DB" strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }}
            disabled={addLoading}
            placeholder={addLoading ? '추가 중...' : '할 일 추가...'}
            style={{ flex: 1, fontSize: 13, color: '#111827', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit' }}
          />
          {inputValue.trim() && (
            <button onClick={handleAddTask} disabled={addLoading} style={{ fontSize: 12, fontWeight: 600, color: '#005AE0', border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              {addLoading ? '...' : '추가'}
            </button>
          )}
        </div>

        {/* Task list */}
        {selectedTasks.map((task) => (
          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F8FAFC' }}>
            {task.completed
              ? <CheckCircle2 size={16} color="#22C55E" strokeWidth={2} style={{ flexShrink: 0 }} />
              : <Circle size={16} color="#D1D5DB" strokeWidth={1.5} style={{ flexShrink: 0 }} />
            }
            <span style={{ flex: 1, fontSize: 13, color: task.completed ? '#9CA3AF' : '#111827', textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.text}
            </span>
            {CAT_COLORS[task.category] && (
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, border: `1px solid ${CAT_COLORS[task.category]}30`, color: CAT_COLORS[task.category], flexShrink: 0 }}>
                {task.category}
              </span>
            )}
            <button
              onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0 0 0 4px', lineHeight: 0, flexShrink: 0 }}
            >
              <X size={13} color="#D1D5DB" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Recent 7 days summary ── */}
      <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F1F5F9', marginTop: 4 }}>
        <div style={{ padding: '12px 0 8px', fontSize: 10, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          최근 7일 요약
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {recentDays.map(day => {
            const pct = day.total > 0 ? Math.round((day.done / day.total) * 100) : 0;
            const isSelected = day.date === selectedDate;
            return (
              <div
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0, minWidth: 38 }}
              >
                <span style={{ fontSize: 10, color: isSelected ? '#005AE0' : '#9CA3AF', fontWeight: isSelected ? 700 : 400 }}>{day.label}</span>
                <div style={{ width: 34, height: 34, borderRadius: 17, background: '#F8FAFC', border: `2px solid ${isSelected ? '#005AE0' : '#F1F5F9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? '#22C55E' : '#005AE0' }}>{pct}%</span>
                </div>
                <span style={{ fontSize: 9, color: '#9CA3AF' }}>{day.done}/{day.total}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
