'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Search, ChevronRight } from 'lucide-react';
import clienteService from '../../../services/cliente.service';
import { useDebounce } from '../../../hooks/useDebounce';

export default function HistorialPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebounce(busqueda, 300);

  const cargarClientes = useCallback(async () => {
    setCargando(true);
    try {
      const data = await clienteService.listar(busquedaDebounced, '');
      setClientes(data);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la lista', text: error.message });
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-[#1C1B1A] dark:text-neutral-100">Historial de servicio</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Busca un cliente para ver todas las motos que ha llevado al taller y su historial completo.
        </p>
      </div>

      <div className="mt-6 max-w-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente por nombre o teléfono..."
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
          />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-h-[600px] overflow-y-auto">
          {cargando && (
            <p className="px-4 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">Cargando...</p>
          )}

          {!cargando && clientes.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
              No se encontraron clientes.
            </p>
          )}

          {!cargando &&
            clientes.map((cliente) => (
              <button
                key={cliente.id}
                onClick={() => router.push(`/historial/${cliente.id}`)}
                className="flex w-full items-center justify-between border-b border-neutral-100 dark:border-neutral-800 px-4 py-3.5 text-left transition last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
              >
                <div>
                  <p className="font-medium text-[#1C1B1A] dark:text-neutral-100">{cliente.nombre}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{cliente.telefono || 'Sin teléfono'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {!cliente.activo && (
                    <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Inactivo
                    </span>
                  )}
                  <ChevronRight size={18} className="text-neutral-400 dark:text-neutral-500" />
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
