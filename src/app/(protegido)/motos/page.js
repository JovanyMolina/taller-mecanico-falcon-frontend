'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Search, Plus, Pencil, Power } from 'lucide-react';
import motocicletaService from '../../../services/motocicleta.service';
import { useDebounce } from '../../../hooks/useDebounce';
import MotoFormModal from '../../../components/MotoFormModal';

const TRANSICIONES = {
  recibida: ['en_diagnostico'],
  en_diagnostico: ['en_reparacion', 'recibida'],
  en_reparacion: ['lista', 'en_diagnostico'],
  lista: ['entregada', 'en_reparacion'],
  entregada: [],
};

const ESTADO_LABEL = {
  recibida: 'Recibida',
  en_diagnostico: 'En diagnóstico',
  en_reparacion: 'En reparación',
  lista: 'Lista',
  entregada: 'Entregada',
};

const ESTADO_COLOR = {
  recibida: 'bg-blue-100 text-blue-700',
  en_diagnostico: 'bg-amber-100 text-amber-700',
  en_reparacion: 'bg-orange-100 text-orange-700',
  lista: 'bg-green-100 text-green-700',
  entregada: 'bg-neutral-200 text-neutral-600',
};

export default function MotosPage() {
  const [motos, setMotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebounce(busqueda, 300);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [motoEditando, setMotoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarMotos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await motocicletaService.listar(busquedaDebounced);
      setMotos(data);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la lista', text: error.message });
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced]);

  useEffect(() => {
    cargarMotos();
  }, [cargarMotos]);

  function abrirModalNuevo() {
    setMotoEditando(null);
    setModalAbierto(true);
  }

  function abrirModalEditar(moto) {
    setMotoEditando(moto);
    setModalAbierto(true);
  }

  async function guardarMoto(datos) {
    setGuardando(true);
    try {
      if (motoEditando) {
        await motocicletaService.actualizar(motoEditando.id, datos);
      } else {
        await motocicletaService.crear(datos);
      }
      setModalAbierto(false);
      await cargarMotos();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.message });
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo(moto) {
    const activando = !moto.activo;

    if (!activando) {
      const confirmacion = await Swal.fire({
        icon: 'warning',
        title: `¿Desactivar esta moto?`,
        text: `${moto.marca} ${moto.modelo} dejará de aparecer en las búsquedas activas.`,
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#1C1B1A',
      });
      if (!confirmacion.isConfirmed) return;
    }

    try {
      await motocicletaService.cambiarActivo(moto.id, activando);
      await cargarMotos();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo actualizar el estado', text: error.message });
    }
  }

  async function cambiarEstadoServicio(moto, nuevoEstado) {
    if (nuevoEstado === 'entregada') {
      const confirmacion = await Swal.fire({
        icon: 'question',
        title: '¿Marcar como entregada?',
        text: 'Confirma que el cliente ya se llevó la moto.',
        showCancelButton: true,
        confirmButtonText: 'Sí, entregada',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#1C1B1A',
      });
      if (!confirmacion.isConfirmed) return;
    }

    try {
      await motocicletaService.cambiarEstado(moto.id, nuevoEstado);
      await cargarMotos();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cambiar el estado', text: error.message });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1A]">Motos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {motos.length} moto{motos.length !== 1 && 's'} registrada{motos.length !== 1 && 's'}
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="flex items-center gap-2 rounded-md bg-[#1C1B1A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90"
        >
          <Plus size={16} />
          Registrar moto
        </button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por placa, cliente o teléfono..."
          className="w-full rounded-md border border-neutral-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Moto</th>
              <th className="px-4 py-3 font-medium">Placa</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Activa</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  Cargando...
                </td>
              </tr>
            )}

            {!cargando && motos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  No se encontraron motos.
                </td>
              </tr>
            )}

            {!cargando &&
              motos.map((moto) => (
                <tr key={moto.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1C1B1A]">{moto.cliente_nombre}</p>
                    <p className="text-xs text-neutral-400">{moto.cliente_telefono}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {moto.marca} {moto.modelo} {moto.anio && `(${moto.anio})`}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{moto.placa || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={moto.estado}
                      onChange={(e) => cambiarEstadoServicio(moto, e.target.value)}
                      className={`rounded-full border-none px-2.5 py-1 text-xs font-medium outline-none ${ESTADO_COLOR[moto.estado]}`}
                    >
                      <option value={moto.estado} disabled>
                        {ESTADO_LABEL[moto.estado]}
                      </option>
                      {TRANSICIONES[moto.estado]?.map((siguiente) => (
                        <option key={siguiente} value={siguiente}>
                          → {ESTADO_LABEL[siguiente]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        moto.activo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {moto.activo ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirModalEditar(moto)}
                        className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-[#1C1B1A]"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => alternarActivo(moto)}
                        className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-[#1C1B1A]"
                        title={moto.activo ? 'Desactivar' : 'Activar'}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <MotoFormModal
          moto={motoEditando}
          onGuardar={guardarMoto}
          onCerrar={() => setModalAbierto(false)}
          guardando={guardando}
        />
      )}
    </div>
  );
}
