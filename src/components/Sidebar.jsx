'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Bike, FileText, Wrench, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/motos', label: 'Motos', icon: Bike },
  { href: '/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { href: '/ordenes', label: 'Órdenes', icon: Wrench },
  { href: '/usuarios', label: 'Usuarios', icon: UserCog, soloAdmin: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { usuario } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.soloAdmin || usuario?.rol === 'admin');

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-[#1C1B1A] lg:flex">
      <div className="px-6 py-6">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F5A623]">Taller</span>
        <p className="text-lg font-bold text-white">FALCON</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ href, label, icon: Icon }) => {
          const activo = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                activo
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <Icon size={18} strokeWidth={activo ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-4">
        <div className="flex gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-full skew-x-[-20deg] bg-[#F5A623]"
              style={{ opacity: i % 2 === 0 ? 0.9 : 0.15 }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
