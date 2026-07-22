'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 lg:px-8">
      <div className="lg:hidden">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#B4650F]">
          Taller Motos
        </span>
      </div>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-[#1C1B1A]">{usuario?.nombre}</p>
          <p className="text-xs capitalize text-neutral-400">{usuario?.rol}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
        >
          <LogOut size={14} />
          Salir
        </button>
      </div>
    </header>
  );
}
