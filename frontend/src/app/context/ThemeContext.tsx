import { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  language: string;
  setLanguage: (v: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false, setDarkMode: () => {},
  language: '한국어', setLanguage: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('한국어');

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, language, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}
