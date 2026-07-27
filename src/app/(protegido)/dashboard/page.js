'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Bike, Wrench, Clock, Users, ClipboardList, ClipboardCheck, Calendar } from 'lucide-react';
import dashboardService from '../../../services/dashboard.service';
import { useAuth } from '../../../context/AuthContext';

const TARJETAS = [
  { clave: 'motosHoy', label: 'Motos ingresadas hoy', icon: Bike, color: 'bg-blue-50 text-blue-600' },
  { clave: 'motosEnReparacion', label: 'Motos en reparación', icon: Wrench, color: 'bg-amber-50 text-amber-600' },
  { clave: 'entregadosHoy', label: 'Entregadas hoy', icon: ClipboardCheck, color: 'bg-green-50 text-green-600' },
  { clave: 'serviciosPendientes', label: 'Servicios pendientes', icon: ClipboardList, color: 'bg-neutral-100 text-neutral-600' },
  { clave: 'serviciosEnProceso', label: 'Servicios en proceso', icon: Clock, color: 'bg-orange-50 text-orange-600' },
  { clave: 'serviciosTerminados', label: 'Servicios terminados', icon: ClipboardCheck, color: 'bg-green-50 text-green-600' },
  { clave: 'cotizacionesPendientes', label: 'Cotizaciones por aprobar', icon: ClipboardList, color: 'bg-amber-50 text-amber-600' },
  { clave: 'citasHoy', label: 'Citas de hoy', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
  { clave: 'usuariosActivos', label: 'Usuarios activos', icon: Users, color: 'bg-neutral-100 text-neutral-600' },
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
      <h1 className="text-2xl font-bold text-[#1C1B1A]">Hola, {usuario?.nombre}</h1>
      <p className="mt-1 text-sm text-neutral-500">Resumen general del taller.</p>

      {cargando ? (
        <p className="mt-8 text-center text-sm text-neutral-400">Cargando estadísticas...</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TARJETAS.map(({ clave, label, icon: Icon, color }) => (
            <div key={clave} className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-md ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1C1B1A]">{stats?.[clave] ?? 0}</p>
                <p className="text-xs text-neutral-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
