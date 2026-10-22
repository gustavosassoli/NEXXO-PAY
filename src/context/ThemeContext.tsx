import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'nexo-theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Falha silenciosa de localStorage (ex: navegação privada ou bloqueio)
  }
  return 'dark'; // Padrão é sempre escuro
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const applyTheme = useCallback((newTheme: Theme) => {
    // 1. Aplica atributo data-theme na tag <html>
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.style.colorScheme = 'dark';
    }

    // 2. Atualiza meta name="theme-color"
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      if (bg) {
        metaThemeColor.setAttribute('content', bg);
      }
    }

    // 3. Grava no localStorage com try/catch
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignora falha de escrita em localStorage
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev: Theme) => {
      const nextTheme: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
};
