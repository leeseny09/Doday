import { createContext, useContext, useState, useEffect } from 'react';
import api from '../../api/axios';

export interface Category { id: string; name: string; color: string }

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'study',    name: '공부', color: '#005AE0' },
  { id: 'work',     name: '업무', color: '#0EA5E9' },
  { id: 'personal', name: '개인', color: '#8B5CF6' },
];

const PALETTE = [
  '#005AE0', '#0EA5E9', '#8B5CF6', '#10B981',
  '#F97316', '#EF4444', '#EC4899', '#14B8A6',
  '#F59E0B', '#6366F1', '#84CC16', '#06B6D4',
];

interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  palette: string[];
}

const CategoryContext = createContext<CategoryContextType>({
  categories: DEFAULT_CATEGORIES,
  addCategory: async () => {},
  deleteCategory: async () => {},
  refresh: async () => {},
  palette: PALETTE,
});

export const useCategories = () => useContext(CategoryContext);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const load = async () => {
    try {
      const res = await api.get('/api/categories');
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length > 0) {
        setCategories(list.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          color: c.color ?? '#005AE0',
        })));
      }
    } catch {
      // 실패 시 기존 상태 유지
    }
  };

  useEffect(() => { load(); }, []);

  const addCategory = async (name: string, color: string) => {
    try {
      const res = await api.post('/api/categories', { name, color });
      setCategories(prev => [...prev, {
        id: String(res.data.id ?? Date.now()),
        name: res.data.name ?? name,
        color: res.data.color ?? color,
      }]);
    } catch {
      setCategories(prev => [...prev, { id: Date.now().toString(), name, color }]);
    }
  };

  const deleteCategory = async (id: string) => {
    if (['study', 'work', 'personal'].includes(id)) return;
    try {
      await api.delete(`/api/categories/${id}`);
    } catch {
      // 삭제 실패해도 UI에서는 제거
    }
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory, refresh: load, palette: PALETTE }}>
      {children}
    </CategoryContext.Provider>
  );
}
