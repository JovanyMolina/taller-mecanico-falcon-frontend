'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Search, Plus, Pencil, Eye, Check, X as XIcon } from 'lucide-react';
import cotizacionService from '../../../services/cotizacion.service';
import { useDebounce } from '../../../hooks/useDebounce';
import CotizacionFormModal from '../../../components/CotizacionFormModal';

const ESTADO_COLOR = {
  pendiente: 'bg-amber-100 text-amber-700',
  aprobada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-700',
};

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const busquedaDebounced = useDebounce(busqueda, 300);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cotizacionActiva, setCotizacionActiva] = useState(null);
  const [soloLectura, setSoloLectura] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargarCotizaciones = useCallback(async () => {
    setCargando(true);
    try {
      const data = await cotizacionService.listar({
        estado: filtroEstado,
        busqueda: busquedaDebounced,
      });
      setCotizaciones(data);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la lista', text: error.message });
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced, filtroEstado]);

  useEffect(() => {
    cargarCotizaciones();
  }, [cargarCotizaciones]);

  function abrirModalNuevo() {
    setCotizacionActiva(null);
    setSoloLectura(false);
    setModalAbierto(true);
  }

  async function abrirModalEditar(cotizacionResumen) {
    try {
      const detalle = await cotizacionService.obtenerPorId(cotizacionResumen.id);
      setCotizacionActiva(detalle);
      setSoloLectura(detalle.estado !== 'pendiente');
      setModalAbierto(true);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la cotización', text: error.message });
    }
  }

  async function guardarCotizacion(datos) {
    const items = datos.items.map((item) => ({
      tipo: item.tipo,
      concepto: item.concepto,
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio_unitario),
    }));

    setGuardando(true);
    try {
      if (cotizacionActiva) {
        await cotizacionService.actualizar(cotizacionActiva.id, { items });
      } else {
        await cotizacionService.crear({ moto_id: datos.moto_id, items });
      }
      setModalAbierto(false);
      await cargarCotizaciones();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.message });
    } finally {
      setGuardando(false);
    }
  }

  async function resolver(cotizacion, nuevoEstado) {
    const confirmacion = await Swal.fire({
      icon: nuevoEstado === 'aprobada' ? 'question' : 'warning',
      title: nuevoEstado === 'aprobada' ? '¿Aprobar cotización?' : '¿Rechazar cotización?',
      text: `Total: $${Number(cotizacion.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      showCancelButton: true,
      confirmButtonText: nuevoEstado === 'aprobada' ? 'Sí, aprobar' : 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1C1B1A',
    });
    if (!confirmacion.isConfirmed) return;

    try {
      await cotizacionService.cambiarEstado(cotizacion.id, nuevoEstado);
      await cargarCotizaciones();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo actualizar', text: error.message });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1A]">Cotizaciones</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {cotizaciones.length} cotización{cotizaciones.length !== 1 && 'es'}
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="flex items-center gap-2 rounded-md bg-[#1C1B1A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90"
        >
          <Plus size={16} />
          Nueva cotización
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por placa o cliente..."
            className="w-full rounded-md border border-neutral-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
          />
        </div>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3 font-medium">Moto</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Creada por</th>
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

            {!cargando && cotizaciones.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  No se encontraron cotizaciones.
                </td>
              </tr>
            )}

            {!cargando &&
              cotizaciones.map((cotizacion) => (
                <tr key={cotizacion.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 text-neutral-600">
                    {cotizacion.moto_marca} {cotizacion.moto_modelo}
                    <span className="ml-1 text-neutral-400">({cotizacion.moto_placa || 'sin placa'})</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{cotizacion.cliente_nombre}</td>
                  <td className="px-4 py-3 font-medium text-[#1C1B1A]">
                    ${Number(cotizacion.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_COLOR[cotizacion.estado]}`}>
                      {ESTADO_LABEL[cotizacion.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{cotizacion.creado_por_nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {cotizacion.estado === 'pendiente' ? (
                        <>
                          <button
                            onClick={() => abrirModalEditar(cotizacion)}
                            className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-[#1C1B1A]"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => resolver(cotizacion, 'aprobada')}
                            className="rounded-md p-1.5 text-neutral-500 transition hover:bg-green-50 hover:text-green-700"
                            title="Aprobar"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => resolver(cotizacion, 'rechazada')}
                            className="rounded-md p-1.5 text-neutral-500 transition hover:bg-red-50 hover:text-red-700"
                            title="Rechazar"
                          >
                            <XIcon size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => abrirModalEditar(cotizacion)}
                          className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-[#1C1B1A]"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <CotizacionFormModal
          cotizacion={cotizacionActiva}
          soloLectura={soloLectura}
          onGuardar={guardarCotizacion}
          onCerrar={() => setModalAbierto(false)}
          guardando={guardando}
        />
      )}
    </div>
  );
}
