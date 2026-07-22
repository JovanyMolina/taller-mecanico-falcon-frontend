'use client';

import { useAuth } from '../../../context/AuthContext';

export default function DashboardPage() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1C1B1A]">Hola, {usuario?.nombre}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Panel temporal — aquí construiremos las estadísticas del taller más adelante.
      </p>
    </div>
  );
}
