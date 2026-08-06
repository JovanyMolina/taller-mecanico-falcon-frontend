'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { esOscuro, alternarTema, listo } = useTheme();

  return (
    <button
      type="button"
      onClick={alternarTema}
      title={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`flex items-center justify-center rounded-md border border-neutral-300 p-2 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 ${
        listo ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {esOscuro ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
