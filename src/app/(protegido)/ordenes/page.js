'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Search, Plus, Pencil } from 'lucide-react';
import ordenService from '../../../services/ordenServicio.service';
import { useDebounce } from '../../../hooks/useDebounce';
import OrdenFormModal from '../../../components/OrdenFormModal';

const TRANSICIONES = {
  pendiente: ['en_proceso', 'cancelada'],
  en_proceso: ['terminada', 'cancelada'],
  terminada: ['entregada', 'en_proceso'],
  entregada: [],
  cancelada: [],
};

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  terminada: 'Terminada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

const ESTADO_COLOR = {
  pendiente: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  en_proceso: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  terminada: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  entregada: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  cancelada: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
};

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const busquedaDebounced = useDebounce(busqueda, 300);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [ordenEditando, setOrdenEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarOrdenes = useCallback(async () => {
    setCargando(true);
    try {
      const data = await ordenService.listar({ estado: filtroEstado, busqueda: busquedaDebounced });
      setOrdenes(data);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la lista', text: error.message });
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced, filtroEstado]);

  useEffect(() => {
    cargarOrdenes();
  }, [cargarOrdenes]);

  function abrirModalNuevo() {
    setOrdenEditando(null);
    setModalAbierto(true);
  }

  async function abrirModalEditar(ordenResumen) {
    try {
      const detalle = await ordenService.obtenerPorId(ordenResumen.id);
      setOrdenEditando(detalle);
      setModalAbierto(true);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la orden', text: error.message });
    }
  }

  async function guardarOrden(datos) {
    setGuardando(true);
    try {
      if (ordenEditando) {
        await ordenService.actualizar(ordenEditando.id, datos);
      } else {
        await ordenService.crear(datos);
      }
      setModalAbierto(false);
      await cargarOrdenes();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.message });
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(orden, nuevoEstado) {
    if (nuevoEstado === 'cancelada') {
      const confirmacion = await Swal.fire({
        icon: 'warning',
        title: '¿Cancelar esta orden?',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver',
        confirmButtonColor: '#1C1B1A',
      });
      if (!confirmacion.isConfirmed) return;

      await aplicarCambioEstado(orden.id, nuevoEstado);
      return;
    }

    if (nuevoEstado === 'entregada') {
      const { value: fecha, isConfirmed } = await Swal.fire({
        icon: 'question',
        title: 'Fecha de entrega real',
        input: 'date',
        inputValue: new Date().toISOString().slice(0, 10),
        showCancelButton: true,
        confirmButtonText: 'Marcar como entregada',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#1C1B1A',
        inputValidator: (value) => (!value ? 'La fecha es obligatoria' : undefined),
      });
      if (!isConfirmed) return;

      await aplicarCambioEstado(orden.id, nuevoEstado, fecha);
      return;
    }

    await aplicarCambioEstado(orden.id, nuevoEstado);
  }

  async function aplicarCambioEstado(id, estado, fechaEntregaReal) {
    try {
      await ordenService.cambiarEstado(id, estado, fechaEntregaReal);
      await cargarOrdenes();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cambiar el estado', text: error.message });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1A] dark:text-neutral-100">Órdenes de servicio</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {ordenes.length} orden{ordenes.length !== 1 && 'es'}
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="flex items-center gap-2 rounded-md bg-[#1C1B1A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90 dark:bg-neutral-100 dark:text-[#1C1B1A] dark:hover:bg-neutral-200"
        >
          <Plus size={16} />
          Nueva orden
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por placa o cliente..."
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
          />
        </div>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2.5 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_LABEL).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <th className="px-4 py-3 font-medium">Moto</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Técnico</th>
              <th className="px-4 py-3 font-medium">Entrega estimada</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">
                  Cargando...
                </td>
              </tr>
            )}

            {!cargando && ordenes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">
                  No se encontraron órdenes.
                </td>
              </tr>
            )}

            {!cargando &&
              ordenes.map((orden) => (
                <tr key={orden.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {orden.moto_marca} {orden.moto_modelo}
                    <span className="ml-1 text-neutral-400 dark:text-neutral-500">({orden.moto_placa || 'sin placa'})</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{orden.cliente_nombre}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{orden.tecnico_nombre || '—'}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {orden.fecha_entrega_estimada ? orden.fecha_entrega_estimada.slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={orden.estado}
                      onChange={(e) => cambiarEstado(orden, e.target.value)}
                      className={`rounded-full border-none px-2.5 py-1 text-xs font-medium outline-none ${ESTADO_COLOR[orden.estado]}`}
                    >
                      <option value={orden.estado} disabled className="bg-white text-neutral-800">
                        {ESTADO_LABEL[orden.estado]}
                      </option>
                      {TRANSICIONES[orden.estado]?.map((siguiente) => (
                        <option key={siguiente} value={siguiente} className="bg-white text-neutral-800">
                          → {ESTADO_LABEL[siguiente]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => abrirModalEditar(orden)}
                        className="rounded-md p-1.5 text-neutral-500 dark:text-neutral-400 transition hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-[#1C1B1A] dark:hover:text-white"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        </div>
      </div>

      {modalAbierto && (
        <OrdenFormModal
          orden={ordenEditando}
          onGuardar={guardarOrden}
          onCerrar={() => setModalAbierto(false)}
          guardando={guardando}
        />
      )}
    </div>
  );
}