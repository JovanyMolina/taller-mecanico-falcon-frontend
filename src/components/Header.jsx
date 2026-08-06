'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header className="no-imprimir flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-4 lg:px-8">
      <div className="lg:hidden">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#B4650F] dark:text-[#F5A623]">
          Taller Motos
        </span>
      </div>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="text-right">
          <p className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">{usuario?.nombre}</p>
          <p className="text-xs capitalize text-neutral-400 dark:text-neutral-500">{usuario?.rol}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 transition hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <LogOut size={14} />
          Salir
        </button>
      </div>
    </header>
  );
}
