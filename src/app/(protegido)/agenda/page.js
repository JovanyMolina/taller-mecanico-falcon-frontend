'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import citaService from '../../../services/cita.service';
import configuracionService from '../../../services/configuracion.service';
import CitaFormModal from '../../../components/CitaFormModal';
import {
  obtenerLunes,
  sumarDias,
  formatearISO,
  generarDiasSemana,
  DIAS_SEMANA,
} from '../../../utils/fechas';

const TRANSICIONES = {
  programada: ['confirmada', 'cancelada'],
  confirmada: ['completada', 'cancelada'],
  completada: [],
  cancelada: [],
};

const ESTADO_LABEL = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

const ESTADO_COLOR = {
  programada: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  confirmada: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  completada: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  cancelada: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
};

export default function AgendaPage() {
  const [lunes, setLunes] = useState(() => obtenerLunes(new Date()));
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [trabajaDomingos, setTrabajaDomingos] = useState(true); 

  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);
  const [fechaParaNueva, setFechaParaNueva] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    configuracionService
      .obtener()
      .then((config) => setTrabajaDomingos(Boolean(config.trabaja_domingos)))
      .catch(() => setTrabajaDomingos(true)); 
  }, []);

  const dias = generarDiasSemana(lunes);
  const domingo = dias[6];

  const cargarCitas = useCallback(async () => {
    setCargando(true);
    try {
      const data = await citaService.listar({
        desde: formatearISO(lunes),
        hasta: formatearISO(domingo),
      });
      setCitas(data);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la agenda', text: error.message });
    } finally {
      setCargando(false);
    }
  }, [lunes]);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  function irSemanaAnterior() {
    setLunes((actual) => sumarDias(actual, -7));
  }

  function irSemanaSiguiente() {
    setLunes((actual) => sumarDias(actual, 7));
  }

  function irHoy() {
    setLunes(obtenerLunes(new Date()));
  }

  function abrirModalNueva(dia) {
    setCitaEditando(null);
    setFechaParaNueva(formatearISO(dia));
    setModalAbierto(true);
  }

  function abrirModalEditar(cita) {
    setCitaEditando(cita);
    setFechaParaNueva(null);
    setModalAbierto(true);
  }

  async function guardarCita(datos) {
    setGuardando(true);
    try {
      if (citaEditando) {
        await citaService.actualizar(citaEditando.id, datos);
      } else {
        await citaService.crear(datos);
      }
      setModalAbierto(false);
      await cargarCitas();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.message });
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(cita, nuevoEstado) {
    if (nuevoEstado === 'cancelada') {
      const confirmacion = await Swal.fire({
        icon: 'warning',
        title: '¿Cancelar esta cita?',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver',
        confirmButtonColor: '#1C1B1A',
      });
      if (!confirmacion.isConfirmed) return;
    }

    try {
      await citaService.cambiarEstado(cita.id, nuevoEstado);
      await cargarCitas();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cambiar el estado', text: error.message });
    }
  }

  function citasDelDia(dia) {
    const iso = formatearISO(dia);
    return citas.filter((c) => c.fecha.slice(0, 10) === iso);
  }

  const rangoLegible = `${lunes.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  })} - ${domingo.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1A] dark:text-neutral-100">Agenda semanal</h1>
          <p className="mt-1 text-sm capitalize text-neutral-500 dark:text-neutral-400">{rangoLegible}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={irSemanaAnterior}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 p-2 text-neutral-600 dark:text-neutral-300 transition hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={irHoy}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 transition hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            Hoy
          </button>
          <button
            onClick={irSemanaSiguiente}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 p-2 text-neutral-600 dark:text-neutral-300 transition hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {cargando ? (
        <p className="mt-8 text-center text-sm text-neutral-400 dark:text-neutral-500">Cargando agenda...</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {dias.map((dia, index) => {
            const citasDia = citasDelDia(dia);
            const esHoy = formatearISO(dia) === formatearISO(new Date());
            const citasActivas = citasDia.filter((c) => c.estado !== 'cancelada');

            return (
              <div key={dia.toISOString()} className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div
                  className={`flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-3 py-2 ${
                    esHoy ? 'bg-[#1C1B1A]' : 'bg-neutral-50 dark:bg-neutral-950'
                  }`}
                >
                  <div>
                    <p
                      className={`text-xs font-medium uppercase tracking-wide ${
                        esHoy ? 'text-[#F5A623]' : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {DIAS_SEMANA[index]}
                    </p>
                    <p className={`text-sm font-bold ${esHoy ? 'text-white' : 'text-[#1C1B1A] dark:text-neutral-100'}`}>
                      {dia.getDate()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      esHoy ? 'bg-white/10 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {citasActivas.length}
                  </span>
                </div>

                <div className="space-y-2 p-2">
                  {citasDia.map((cita) => (
                    <div key={cita.id} className="rounded-md border border-neutral-200 dark:border-neutral-800 p-2 text-xs">
                      <button
                        onClick={() => abrirModalEditar(cita)}
                        className="block w-full text-left font-medium text-[#1C1B1A] dark:text-neutral-100 hover:underline"
                      >
                        {cita.hora ? `${cita.hora.slice(0, 5)} · ` : ''}
                        {cita.cliente_nombre}
                      </button>
                      {cita.motivo && <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">{cita.motivo}</p>}
                      <select
                        value={cita.estado}
                        onChange={(e) => cambiarEstado(cita, e.target.value)}
                        className={`mt-1.5 w-full rounded-full border-none px-2 py-0.5 text-[10px] font-medium outline-none ${ESTADO_COLOR[cita.estado]}`}
                      >
                        <option value={cita.estado} disabled className="bg-white text-neutral-800">
                          {ESTADO_LABEL[cita.estado]}
                        </option>
                        {TRANSICIONES[cita.estado]?.map((s) => (
                          <option key={s} value={s} className="bg-white text-neutral-800">
                            → {ESTADO_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {index === 6 && !trabajaDomingos ? (
                    <p className="py-2 text-center text-xs text-neutral-400 dark:text-neutral-500">Cerrado los domingos</p>
                  ) : (
                    <button
                      onClick={() => abrirModalNueva(dia)}
                      className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 py-2 text-xs text-neutral-400 dark:text-neutral-500 transition hover:border-[#1C1B1A] dark:hover:border-neutral-500 hover:text-[#1C1B1A] dark:hover:text-white"
                    >
                      <Plus size={12} />
                      Agendar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAbierto && (
        <CitaFormModal
          cita={citaEditando}
          fechaInicial={fechaParaNueva}
          trabajaDomingos={trabajaDomingos}
          onGuardar={guardarCita}
          onCerrar={() => setModalAbierto(false)}
          guardando={guardando}
        />
      )}
    </div>
  );
}