import { useState, KeyboardEvent } from 'react';
import { Circle, CheckCircle2, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { DeadlinePicker } from './DeadlinePicker';

// Palette for custom categories
const COLOR_PALETTE = ['#005AE0', '#0EA5E9', '#8B5CF6', '#10B981', '#F97316', '#EF4444', '#EC4899', '#14B8A6'];

interface Category {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'study',    name: '공부', color: '#005AE0' },
  { id: 'work',     name: '업무', color: '#0EA5E9' },
  { id: 'personal', name: '개인', color: '#8B5CF6' },
];

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  deadline: string;
  categoryId: string;
  rolloverCount: number;
  expanded: boolean;
}

interface HomeProps {
  onOpenDeadline: () => void;
}

export function Home({ onOpenDeadline }: HomeProps) {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: '포폴 README 작성',    completed: false, deadline: '오늘 마감', categoryId: 'work',     rolloverCount: 0, expanded: false },
    { id: '2', text: 'Spring Security 공부', completed: false, deadline: '오후 11:00', categoryId: 'study',    rolloverCount: 2, expanded: false },
    { id: '3', text: '알고리즘 문제 2개',     completed: false, deadline: '',          categoryId: 'study',    rolloverCount: 0, expanded: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [newCatInput, setNewCatInput] = useState('');
  const [showCatInput, setShowCatInput] = useState<string | null>(null); // todoId
  const [deadlinePickerTodoId, setDeadlinePickerTodoId] = useState<string | null>(null);

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now().toString(),
        text: inputValue,
        completed: false,
        deadline: '',
        categoryId: '',
        rolloverCount: 0,
        expanded: false,
      }]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddTodo();
  };

  const toggleComplete = (id: string) =>
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const toggleExpand = (id: string) =>
    setTodos(todos.map(t => t.id === id ? { ...t, expanded: !t.expanded } : t));

  const setTodoDeadline = (todoId: string, deadline: string) =>
    setTodos(todos.map(t => t.id === todoId ? { ...t, deadline } : t));

  const setTodoCategory = (todoId: string, categoryId: string) =>
    setTodos(todos.map(t => t.id === todoId ? { ...t, categoryId } : t));

  const addCategory = (todoId: string) => {
    const name = newCatInput.trim();
    if (!name) return;
    const usedColors = categories.map(c => c.color);
    const nextColor = COLOR_PALETTE.find(c => !usedColors.includes(c)) ?? COLOR_PALETTE[categories.length % COLOR_PALETTE.length];
    const newCat: Category = { id: Date.now().toString(), name, color: nextColor };
    setCategories([...categories, newCat]);
    setTodos(todos.map(t => t.id === todoId ? { ...t, categoryId: newCat.id } : t));
    setNewCatInput('');
    setShowCatInput(null);
  };

  const deleteCategory = (catId: string) => {
    if (['study', 'work', 'personal'].includes(catId)) return; // keep defaults
    setCategories(categories.filter(c => c.id !== catId));
    setTodos(todos.map(t => t.categoryId === catId ? { ...t, categoryId: '' } : t));
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  const getChip = (todo: Todo) => {
    if (todo.deadline === '오늘 마감') return { label: '오늘 마감', border: '#FCA5A5', color: '#EF4444' };
    if (todo.rolloverCount >= 2)      return { label: `${todo.rolloverCount}번 이월`, border: '#FCD34D', color: '#D97706' };
    if (todo.deadline)                return { label: todo.deadline, border: '#BAE6FD', color: '#0EA5E9' };
    return null;
  };

  const getCat = (id: string) => categories.find(c => c.id === id);

  const pickerTodo = deadlinePickerTodoId ? todos.find(t => t.id === deadlinePickerTodoId) : null;

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', position: 'relative' }}>

      {/* ── Header ── */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 13, color: '#374151', marginBottom: 4, letterSpacing: '0.01em', fontWeight: 500 }}>
          수요일 · 2026
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          5월 13일
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 6, gap: 6 }}>
          <div style={{ width: 3, height: 14, background: '#005AE0', borderRadius: 2 }} />
          <span style={{ fontSize: 13, color: '#005AE0', fontWeight: 600, letterSpacing: '0.02em' }}>ToDoList</span>
        </div>
      </div>

      {/* ── Progress ── */}
      <div style={{ margin: '14px 16px', background: '#EFF6FF', borderRadius: 16, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 500 }}>오늘 진행률</div>
            <div style={{ fontSize: 11, color: '#93C5FD', marginTop: 1 }}>{completedCount}개 완료 · {totalCount - completedCount}개 남음</div>
          </div>
          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="#BFDBFE" strokeWidth="3.5" />
              <circle
                cx="26" cy="26" r="22" fill="none" stroke="#005AE0" strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress / 100)}`}
                transform="rotate(-90 26 26)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#005AE0' }}>
              {progress}%
            </div>
          </div>
        </div>
        <div style={{ height: 6, background: '#BFDBFE', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #005AE0 0%, #3B82F6 100%)', borderRadius: 3, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* ── Inline input ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderBottom: '1px solid #F1F5F9' }}>
        <Circle size={17} color="#D1D5DB" strokeWidth={1.5} style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="할 일 추가..."
          style={{ flex: 1, fontSize: 13, color: '#111827', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit' }}
        />
        {inputValue.trim() && (
          <button onClick={handleAddTodo} style={{ fontSize: 12, fontWeight: 600, color: '#005AE0', border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
            추가
          </button>
        )}
      </div>

      {/* ── Active todos ── */}
      {activeTodos.length > 0 && (
        <div>
          <div style={{ padding: '10px 20px 4px', fontSize: 10, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            할 일 · {activeTodos.length}
          </div>
          {activeTodos.map(todo => {
            const chip = getChip(todo);
            const cat = getCat(todo.categoryId);
            return (
              <div key={todo.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid #F8FAFC' }}>
                  <button onClick={() => toggleComplete(todo.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, lineHeight: 0 }}>
                    <Circle size={18} color="#D1D5DB" strokeWidth={1.5} />
                  </button>
                  <span style={{ flex: 1, fontSize: 13, color: '#111827', lineHeight: 1.4 }}>{todo.text}</span>
                  {chip && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, border: `1px solid ${chip.border}`, color: chip.color, flexShrink: 0, fontWeight: 500 }}>
                      {chip.label}
                    </span>
                  )}
                  {cat && !chip && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, border: `1px solid ${cat.color}40`, color: cat.color, flexShrink: 0 }}>
                      {cat.name}
                    </span>
                  )}
                  <button onClick={() => toggleExpand(todo.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
                    {todo.expanded
                      ? <ChevronUp size={16} color="#9CA3AF" strokeWidth={1.5} />
                      : <ChevronDown size={16} color="#C4C9D4" strokeWidth={1.5} />}
                  </button>
                </div>

                {todo.expanded && (
                  <div style={{ padding: '10px 20px 14px 48px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                    {/* Deadline row — clickable to open picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, color: '#9CA3AF', width: 30, flexShrink: 0 }}>마감</span>
                      <button
                        onClick={() => setDeadlinePickerTodoId(todo.id)}
                        style={{
                          fontSize: 10, fontWeight: 500,
                          color: todo.deadline ? '#005AE0' : '#9CA3AF',
                          border: `1px solid ${todo.deadline ? '#BFDBFE' : '#E5E7EB'}`,
                          borderRadius: 20, padding: '3px 10px',
                          background: todo.deadline ? '#EFF6FF' : 'transparent',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        {todo.deadline || '+ 마감 설정'}
                      </button>
                    </div>

                    {/* Category row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, color: '#9CA3AF', width: 30, flexShrink: 0 }}>유형</span>
                      {categories.map(c => {
                        const isActive = todo.categoryId === c.id;
                        const isDefault = ['study', 'work', 'personal'].includes(c.id);
                        return (
                          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            <button
                              onClick={() => setTodoCategory(todo.id, c.id)}
                              style={{
                                fontSize: 10,
                                border: `1px solid ${isActive ? c.color : '#E5E7EB'}`,
                                borderRadius: isDefault ? 20 : '20px 0 0 20px',
                                padding: '3px 8px',
                                color: isActive ? c.color : '#9CA3AF',
                                background: isActive ? `${c.color}12` : 'transparent',
                                cursor: 'pointer', fontFamily: 'inherit',
                                fontWeight: isActive ? 600 : 400,
                                transition: 'all 0.15s ease',
                                borderRight: isDefault ? undefined : 'none',
                              }}
                            >
                              {c.name}
                            </button>
                            {!isDefault && (
                              <button
                                onClick={() => deleteCategory(c.id)}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 18, height: 22,
                                  border: `1px solid ${isActive ? c.color : '#E5E7EB'}`,
                                  borderLeft: 'none',
                                  borderRadius: '0 20px 20px 0',
                                  background: 'transparent',
                                  cursor: 'pointer', padding: 0,
                                }}
                              >
                                <X size={9} color="#9CA3AF" strokeWidth={2} />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* Add new category */}
                      {showCatInput === todo.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            autoFocus
                            value={newCatInput}
                            onChange={e => setNewCatInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') addCategory(todo.id); if (e.key === 'Escape') { setShowCatInput(null); setNewCatInput(''); } }}
                            placeholder="유형 이름"
                            style={{
                              width: 72, fontSize: 10, padding: '3px 8px',
                              border: '1px solid #005AE0', borderRadius: 20, outline: 'none',
                              fontFamily: 'inherit', color: '#111827',
                            }}
                          />
                          <button onClick={() => addCategory(todo.id)} style={{ fontSize: 10, color: '#005AE0', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                            추가
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setShowCatInput(todo.id); setNewCatInput(''); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 2,
                            fontSize: 10, color: '#9CA3AF',
                            border: '1px dashed #D1D5DB', borderRadius: 20,
                            padding: '3px 8px', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          <Plus size={10} strokeWidth={2} />
                          유형 추가
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Completed todos ── */}
      {completedTodos.length > 0 && (
        <div>
          <div style={{ padding: '10px 20px 4px', fontSize: 10, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            완료 · {completedTodos.length}
          </div>
          {completedTodos.map(todo => (
            <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid #F8FAFC' }}>
              <button onClick={() => toggleComplete(todo.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, lineHeight: 0 }}>
                <CheckCircle2 size={18} color="#005AE0" strokeWidth={1.8} />
              </button>
              <span style={{ flex: 1, fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>{todo.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Demo button ── */}
      <div style={{ padding: '20px 20px 24px' }}>
        <button onClick={onOpenDeadline} style={{ width: '100%', padding: '13px', background: '#005AE0', color: '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.1px' }}>
          마감 알림 체험하기
        </button>
      </div>

      {/* ── Deadline picker (bottom sheet overlay, inside phone frame) ── */}
      <DeadlinePicker
        open={deadlinePickerTodoId !== null}
        onClose={() => setDeadlinePickerTodoId(null)}
        onConfirm={deadline => {
          if (deadlinePickerTodoId) setTodoDeadline(deadlinePickerTodoId, deadline);
        }}
        currentDeadline={pickerTodo?.deadline}
      />
    </div>
  );
}
