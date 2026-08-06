'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const SCRIPT_INICIAL_TEMA = `
(function () {
  try {
    var tema = localStorage.getItem('tema');
    var prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var esOscuro = tema ? tema === 'oscuro' : prefiereOscuro;
    if (esOscuro) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }) {
  const [esOscuro, setEsOscuro] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const actual = document.documentElement.classList.contains('dark');
    setEsOscuro(actual);
    setListo(true);
  }, []);

  function alternarTema() {
    setEsOscuro((actual) => {
      const nuevo = !actual;
      document.documentElement.classList.toggle('dark', nuevo);
      try {
        localStorage.setItem('tema', nuevo ? 'oscuro' : 'claro');
      } catch (e) {
        
      }
      return nuevo;
    });
  }

  return (
    <ThemeContext.Provider value={{ esOscuro, alternarTema, listo }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}
