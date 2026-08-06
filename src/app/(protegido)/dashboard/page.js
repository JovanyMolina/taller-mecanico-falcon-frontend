'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Bike, Wrench, Clock, Users, ClipboardList, ClipboardCheck, Calendar } from 'lucide-react';
import dashboardService from '../../../services/dashboard.service';
import { useAuth } from '../../../context/AuthContext';

const TARJETAS = [
  { clave: 'motosHoy', label: 'Motos ingresadas hoy', icon: Bike, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { clave: 'motosEnReparacion', label: 'Motos en reparación', icon: Wrench, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { clave: 'entregadosHoy', label: 'Entregadas hoy', icon: ClipboardCheck, color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { clave: 'serviciosPendientes', label: 'Servicios pendientes', icon: ClipboardList, color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300' },
  { clave: 'serviciosEnProceso', label: 'Servicios en proceso', icon: Clock, color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  { clave: 'serviciosTerminados', label: 'Servicios terminados', icon: ClipboardCheck, color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { clave: 'cotizacionesPendientes', label: 'Cotizaciones por aprobar', icon: ClipboardList, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { clave: 'citasHoy', label: 'Citas de hoy', icon: Calendar, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { clave: 'usuariosActivos', label: 'Usuarios activos', icon: Users, color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300' },
];

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    dashboardService
      .obtenerEstadisticas()
      .then(setStats)
      .catch((error) =>
        Swal.fire({ icon: 'error', title: 'No se pudieron cargar las estadísticas', text: error.message })
      )
      .finally(() => setCargando(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1C1B1A] dark:text-neutral-100">Hola, {usuario?.nombre}</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Resumen general del taller.</p>

      {cargando ? (
        <p className="mt-8 text-center text-sm text-neutral-400 dark:text-neutral-500">Cargando estadísticas...</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TARJETAS.map(({ clave, label, icon: Icon, color }) => (
            <div key={clave} className="flex items-center gap-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-md ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1C1B1A] dark:text-neutral-100">{stats?.[clave] ?? 0}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
