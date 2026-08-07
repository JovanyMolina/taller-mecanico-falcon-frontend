'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Bike,
  FileText,
  Wrench,
  Image as ImageIcon,
  ChevronDown,
  ExternalLink,
  X,
  Calendar,
  Gauge,
} from 'lucide-react';
import clienteService from '../../../../services/cliente.service';
import { API_ORIGIN } from '../../../../services/api';

const MOTO_ESTADO_LABEL = {
  recibida: 'Recibida',
  en_diagnostico: 'En diagnóstico',
  en_reparacion: 'En reparación',
  lista: 'Lista',
  entregada: 'Entregada',
};

const MOTO_ESTADO_COLOR = {
  recibida: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  en_diagnostico: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  en_reparacion: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  lista: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  entregada: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300',
};

const COTIZACION_ESTADO_LABEL = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

const COTIZACION_ESTADO_COLOR = {
  pendiente: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  aprobada: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  rechazada: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
};

const ORDEN_ESTADO_LABEL = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  terminada: 'Terminada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

const ORDEN_ESTADO_COLOR = {
  pendiente: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  en_proceso: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  terminada: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  entregada: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  cancelada: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
};

function formatoFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatoMoneda(valor) {
  return `$${Number(valor).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

export default function HistorialClientePage() {
  const { id } = useParams();
  const router = useRouter();
  const [historial, setHistorial] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [motoAbierta, setMotoAbierta] = useState(null);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  useEffect(() => {
    clienteService
      .obtenerHistorial(id)
      .then((data) => {
        setHistorial(data);
        if (data.motos.length > 0) {
          setMotoAbierta(data.motos[0].id);
        }
      })
      .catch((error) => {
        Swal.fire({ icon: 'error', title: 'No se pudo cargar el historial', text: error.message });
      })
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return <p className="p-8 text-center text-sm text-neutral-400 dark:text-neutral-500">Cargando...</p>;
  }

  if (!historial) {
    return <p className="p-8 text-center text-sm text-neutral-400 dark:text-neutral-500">Cliente no encontrado.</p>;
  }

  const { cliente, motos } = historial;

  const totalCotizaciones = motos.reduce((acc, m) => acc + m.cotizaciones.length, 0);
  const totalFacturado = motos.reduce(
    (acc, m) => acc + m.cotizaciones.filter((c) => c.estado === 'aprobada').reduce((s, c) => s + Number(c.total), 0),
    0
  );
  const ultimaVisita = motos.reduce((ultima, m) => {
    if (!m.fecha_recepcion) return ultima;
    return !ultima || new Date(m.fecha_recepcion) > new Date(ultima) ? m.fecha_recepcion : ultima;
  }, null);

  return (
    <div>
      <button
        onClick={() => router.push('/historial')}
        className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-[#1C1B1A] dark:hover:text-white"
      >
        <ArrowLeft size={16} />
        Volver al historial
      </button>

      {/* Encabezado del cliente */}
      <div className="mt-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-[#1C1B1A] dark:text-neutral-100">{cliente.nombre}</h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              cliente.activo
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {cliente.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-600 dark:text-neutral-300">
          {cliente.telefono && (
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> {cliente.telefono}
            </span>
          )}
          {cliente.email && (
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> {cliente.email}
            </span>
          )}
          {cliente.direccion && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> {cliente.direccion}
            </span>
          )}
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Motos</p>
          <p className="mt-1 text-xl font-bold text-[#1C1B1A] dark:text-neutral-100">{motos.length}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Cotizaciones</p>
          <p className="mt-1 text-xl font-bold text-[#1C1B1A] dark:text-neutral-100">{totalCotizaciones}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Facturado (aprobado)</p>
          <p className="mt-1 text-xl font-bold text-[#1C1B1A] dark:text-neutral-100">{formatoMoneda(totalFacturado)}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Última visita</p>
          <p className="mt-1 text-xl font-bold text-[#1C1B1A] dark:text-neutral-100">{formatoFecha(ultimaVisita)}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Bike size={18} className="text-neutral-500 dark:text-neutral-400" />
        <h2 className="text-lg font-semibold text-[#1C1B1A] dark:text-neutral-100">
          {motos.length} moto{motos.length !== 1 && 's'} registrada{motos.length !== 1 && 's'}
        </h2>
      </div>

      {motos.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 px-4 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
          Este cliente todavía no tiene motos registradas.
        </p>
      )}

      {/* Acordeón de motos */}
      <div className="mt-4 space-y-3">
        {motos.map((moto) => {
          const abierta = motoAbierta === moto.id;
          return (
            <div
              key={moto.id}
              className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
            >
              {/* Cabecera clicable */}
              <button
                onClick={() => setMotoAbierta(abierta ? null : moto.id)}
                className="flex w-full flex-wrap items-center justify-between gap-2 px-6 py-4 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
              >
                <div>
                  <p className="text-lg font-bold text-[#1C1B1A] dark:text-neutral-100">
                    {moto.marca} {moto.modelo} {moto.anio ? `(${moto.anio})` : ''}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {moto.placa || 'Sin placa'} · {moto.color || 'Sin color'} · Recibida el {formatoFecha(moto.fecha_recepcion)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-neutral-400 dark:text-neutral-500 sm:inline">
                    {moto.cotizaciones.length} cotización{moto.cotizaciones.length !== 1 && 'es'} · {moto.ordenes.length} orden
                    {moto.ordenes.length !== 1 && 'es'} · {moto.evidencias.length} foto{moto.evidencias.length !== 1 && 's'}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${MOTO_ESTADO_COLOR[moto.estado]}`}>
                    {MOTO_ESTADO_LABEL[moto.estado]}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-neutral-400 dark:text-neutral-500 transition-transform ${abierta ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {abierta && (
                <div className="border-t border-neutral-100 dark:border-neutral-800 px-6 py-5">
                  {/* Datos generales de la moto */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                    {moto.kilometraje != null && (
                      <span className="flex items-center gap-1.5">
                        <Gauge size={14} /> {Number(moto.kilometraje).toLocaleString('es-MX')} km
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} /> Recibida el {formatoFecha(moto.fecha_recepcion)}
                    </span>
                  </div>

                  {moto.falla_reportada && (
                    <div className="mt-3 rounded-md bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300">
                      <span className="font-medium text-neutral-500 dark:text-neutral-400">Falla reportada: </span>
                      {moto.falla_reportada}
                    </div>
                  )}

                  {/* Cotizaciones */}
                  <div className="mt-5">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                      <FileText size={13} /> Cotizaciones
                    </p>
                    {moto.cotizaciones.length === 0 ? (
                      <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">Sin cotizaciones.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {moto.cotizaciones.map((cotizacion) => (
                          <div
                            key={cotizacion.id}
                            className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-sm">
                                <span className="font-semibold text-[#1C1B1A] dark:text-neutral-100">
                                  Cotización #{cotizacion.id}
                                </span>
                                <span className="text-neutral-500 dark:text-neutral-400"> · {formatoFecha(cotizacion.created_at)}</span>
                              </div>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${COTIZACION_ESTADO_COLOR[cotizacion.estado]}`}
                              >
                                {COTIZACION_ESTADO_LABEL[cotizacion.estado]}
                              </span>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-neutral-600 dark:text-neutral-300">
                              <span>
                                Total: <span className="font-medium">{formatoMoneda(cotizacion.total)}</span>
                              </span>
                              {Number(cotizacion.anticipo) > 0 && (
                                <span>
                                  Anticipo: <span className="font-medium">{formatoMoneda(cotizacion.anticipo)}</span>
                                </span>
                              )}
                            </div>

                            {cotizacion.observaciones && (
                              <p className="mt-1.5 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
                                <span className="font-medium text-neutral-500 dark:text-neutral-400">Observaciones: </span>
                                {cotizacion.observaciones}
                              </p>
                            )}

                            {cotizacion.garantia && (
                              <p className="mt-1.5 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
                                <span className="font-medium text-neutral-500 dark:text-neutral-400">Garantía: </span>
                                {cotizacion.garantia}
                              </p>
                            )}

                            <a
                              href={`/cotizaciones/${cotizacion.id}/imprimir`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#B4650F] dark:text-[#F5A623] hover:underline"
                            >
                              Ver cotización completa <ExternalLink size={12} />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Evidencias */}
                  {moto.evidencias.length > 0 && (
                    <div className="mt-5">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                        <ImageIcon size={13} /> Evidencias
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {moto.evidencias.map((evidencia) => (
                          <button
                            key={evidencia.id}
                            onClick={() => setImagenAmpliada(evidencia)}
                            title={evidencia.descripcion || ''}
                          >
                            <img
                              src={`${API_ORIGIN}${evidencia.url_imagen}`}
                              alt={evidencia.descripcion || 'Evidencia'}
                              className="h-20 w-20 rounded-md border border-neutral-200 dark:border-neutral-700 object-cover transition hover:opacity-80"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Visor de imagen ampliada */}
      {imagenAmpliada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setImagenAmpliada(null)}
        >
          <button
            onClick={() => setImagenAmpliada(null)}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>
          <div className="max-w-3xl">
            <img
              src={`${API_ORIGIN}${imagenAmpliada.url_imagen}`}
              alt={imagenAmpliada.descripcion || 'Evidencia'}
              className="max-h-[80vh] w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {imagenAmpliada.descripcion && (
              <p className="mt-2 text-center text-sm text-white/80">{imagenAmpliada.descripcion}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
