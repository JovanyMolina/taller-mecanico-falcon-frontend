'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import SelectorMoto from './SelectorMoto';
import usuarioService from '../services/usuario.service';

export default function OrdenFormModal({ orden, onGuardar, onCerrar, guardando }) {
  const esEdicion = Boolean(orden);
  const [tecnicos, setTecnicos] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      moto_id: orden?.moto_id || null,
      cotizacion_id: orden?.cotizacion_id || '',
      tecnico_asignado: orden?.tecnico_asignado || '',
      fecha_entrega_estimada: orden?.fecha_entrega_estimada
        ? orden.fecha_entrega_estimada.slice(0, 10)
        : '',
      observaciones: orden?.observaciones || '',
    },
  });

  useEffect(() => {
    usuarioService
      .listarTecnicos()
      .then(setTecnicos)
      .catch(() => setTecnicos([]));
  }, []);

  useEffect(() => {
    reset({
      moto_id: orden?.moto_id || null,
      cotizacion_id: orden?.cotizacion_id || '',
      tecnico_asignado: orden?.tecnico_asignado || '',
      fecha_entrega_estimada: orden?.fecha_entrega_estimada
        ? orden.fecha_entrega_estimada.slice(0, 10)
        : '',
      observaciones: orden?.observaciones || '',
    });
  }, [orden, reset]);

  function alGuardar(datos) {
    onGuardar({
      ...datos,
      cotizacion_id: datos.cotizacion_id || null,
      tecnico_asignado: datos.tecnico_asignado || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1C1B1A] dark:text-neutral-100">
            {esEdicion ? 'Editar orden de servicio' : 'Nueva orden de servicio'}
          </h2>
          <button onClick={onCerrar} className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(alGuardar)} className="mt-5 space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">Moto</label>
            {esEdicion ? (
              <p className="mt-1.5 rounded-md bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300">
                {orden.moto_marca} {orden.moto_modelo} · {orden.moto_placa || 'sin placa'} (
                {orden.cliente_nombre})
              </p>
            ) : (
              <>
                <div className="mt-1.5">
                  <Controller
                    name="moto_id"
                    control={control}
                    rules={{ required: 'Selecciona una moto' }}
                    render={({ field }) => (
                      <SelectorMoto value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
                {errors.moto_id && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.moto_id.message}</p>
                )}
              </>
            )}
          </div>

          {!esEdicion && (
            <div>
              <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">
                ID de cotización aprobada <span className="font-normal text-neutral-400 dark:text-neutral-500">(opcional)</span>
              </label>
              <input
                type="number"
                className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
                {...register('cotizacion_id')}
              />
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                Déjalo vacío para un trabajo directo sin cotización previa.
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">
              Técnico asignado <span className="font-normal text-neutral-400 dark:text-neutral-500">(opcional)</span>
            </label>
            <select
              className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
              {...register('tecnico_asignado')}
            >
              <option value="">Sin asignar</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">
              Fecha de entrega estimada <span className="font-normal text-neutral-400 dark:text-neutral-500">(opcional)</span>
            </label>
            <input
              type="date"
              className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
              {...register('fecha_entrega_estimada')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">
              Observaciones <span className="font-normal text-neutral-400 dark:text-neutral-500">(opcional)</span>
            </label>
            <textarea
              rows={3}
              className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
              {...register('observaciones')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 rounded-md bg-[#1C1B1A] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90 disabled:opacity-50 dark:bg-neutral-100 dark:text-[#1C1B1A] dark:hover:bg-neutral-200"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
