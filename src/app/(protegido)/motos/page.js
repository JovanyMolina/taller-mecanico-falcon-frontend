'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Search, Plus, Pencil, Power } from 'lucide-react';
import motocicletaService from '../../../services/motocicleta.service';
import motoEvidenciaService from '../../../services/motoEvidencia.service';
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
  recibida: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  en_diagnostico: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  en_reparacion: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  lista: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  entregada: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300',
};

export default function MotosPage() {
  const [motos, setMotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const busquedaDebounced = useDebounce(busqueda, 300);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [motoEditando, setMotoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarMotos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await motocicletaService.listar(busquedaDebounced, filtroEstado);
      setMotos(data);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la lista', text: error.message });
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced, filtroEstado]);

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

  async function guardarMoto(datosConFotos) {
    const { fotos, ...datos } = datosConFotos;

    setGuardando(true);
    try {
      if (motoEditando) {
        await motocicletaService.actualizar(motoEditando.id, datos);
      } else {
        const motoCreada = await motocicletaService.crear(datos);
        if (fotos && fotos.length > 0) {
          try {
            await motoEvidenciaService.subir(motoCreada.id, fotos);
          } catch (errorFotos) {
            Swal.fire({
              icon: 'warning',
              title: 'Moto registrada, pero las fotos no se pudieron subir',
              text: errorFotos.message,
            });
          }
        }
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
          <h1 className="text-2xl font-bold text-[#1C1B1A] dark:text-neutral-100">Motos</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {motos.length} moto{motos.length !== 1 && 's'} registrada{motos.length !== 1 && 's'}
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="flex items-center gap-2 rounded-md bg-[#1C1B1A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90 dark:bg-neutral-100 dark:text-[#1C1B1A] dark:hover:bg-neutral-200"
        >
          <Plus size={16} />
          Registrar moto
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por placa, cliente o teléfono..."
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
          />
        </div>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_LABEL).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
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
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">
                  Cargando...
                </td>
              </tr>
            )}

            {!cargando && motos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">
                  No se encontraron motos.
                </td>
              </tr>
            )}

            {!cargando &&
              motos.map((moto) => (
                <tr key={moto.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1C1B1A] dark:text-neutral-100">{moto.cliente_nombre}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">{moto.cliente_telefono}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {moto.marca} {moto.modelo} {moto.anio && `(${moto.anio})`}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{moto.placa || '—'}</td>
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
                        moto.activo ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {moto.activo ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirModalEditar(moto)}
                        className="rounded-md p-1.5 text-neutral-500 dark:text-neutral-400 transition hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-[#1C1B1A] dark:hover:text-white"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => alternarActivo(moto)}
                        className="rounded-md p-1.5 text-neutral-500 dark:text-neutral-400 transition hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-[#1C1B1A] dark:hover:text-white"
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