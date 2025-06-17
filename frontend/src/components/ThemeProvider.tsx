import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({
  theme: 'light',
  toggle: () => {},
});

export const usePreferredColorScheme = () => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const system = usePreferredColorScheme();
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || system);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
