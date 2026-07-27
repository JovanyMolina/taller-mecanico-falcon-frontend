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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1C1B1A]">
            {esEdicion ? 'Editar orden de servicio' : 'Nueva orden de servicio'}
          </h2>
          <button onClick={onCerrar} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(alGuardar)} className="mt-5 space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">Moto</label>
            {esEdicion ? (
              // No se permite cambiar la moto de una orden ya creada (decisión de arquitectura
              // que tomamos al construir el backend): solo se muestra, no se edita.
              <p className="mt-1.5 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
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
                  <p className="mt-1 text-xs text-red-600">{errors.moto_id.message}</p>
                )}
              </>
            )}
          </div>

          {!esEdicion && (
            <div>
              <label className="text-sm font-medium text-[#1C1B1A]">
                ID de cotización aprobada <span className="font-normal text-neutral-400">(opcional)</span>
              </label>
              <input
                type="number"
                className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
                {...register('cotizacion_id')}
              />
              <p className="mt-1 text-xs text-neutral-400">
                Déjalo vacío para un trabajo directo sin cotización previa.
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">
              Técnico asignado <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <select
              className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
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
            <label className="text-sm font-medium text-[#1C1B1A]">
              Fecha de entrega estimada <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <input
              type="date"
              className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
              {...register('fecha_entrega_estimada')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">
              Observaciones <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <textarea
              rows={3}
              className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
              {...register('observaciones')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 rounded-md border border-neutral-300 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 rounded-md bg-[#1C1B1A] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
