'use client';

import { useAuth } from '../../context/AuthContext';
import RutaProtegida from '../../components/RutaProtegida';

function DashboardContenido() {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#B4650F]">
              Taller Motos
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#1C1B1A]">
              Hola, {usuario?.nombre}
            </h1>
          </div>
          <button
            onClick={logout}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">
            Sesión activa como <span className="font-medium text-[#1C1B1A]">{usuario?.rol}</span>.
            Este es un panel temporal — aquí construiremos el dashboard real más adelante.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RutaProtegida>
      <DashboardContenido />
    </RutaProtegida>
  );
}
