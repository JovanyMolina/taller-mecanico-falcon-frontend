'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import SelectorCliente from './SelectorCliente';
import SelectorMoto from './SelectorMoto';

export default function CitaFormModal({ cita, fechaInicial, onGuardar, onCerrar, guardando }) {
  const esEdicion = Boolean(cita);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cliente_id: cita?.cliente_id || null,
      moto_id: cita?.moto_id || null,
      fecha: cita?.fecha ? cita.fecha.slice(0, 10) : fechaInicial || '',
      hora: cita?.hora ? cita.hora.slice(0, 5) : '',
      motivo: cita?.motivo || '',
    },
  });

  useEffect(() => {
    reset({
      cliente_id: cita?.cliente_id || null,
      moto_id: cita?.moto_id || null,
      fecha: cita?.fecha ? cita.fecha.slice(0, 10) : fechaInicial || '',
      hora: cita?.hora ? cita.hora.slice(0, 5) : '',
      motivo: cita?.motivo || '',
    });
  }, [cita, fechaInicial, reset]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1C1B1A]">
            {esEdicion ? 'Editar cita' : 'Nueva cita'}
          </h2>
          <button onClick={onCerrar} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onGuardar)} className="mt-5 space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">Cliente</label>
            {esEdicion ? (
              <p className="mt-1.5 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                {cita.cliente_nombre}
              </p>
            ) : (
              <>
                <div className="mt-1.5">
                  <Controller
                    name="cliente_id"
                    control={control}
                    rules={{ required: 'Selecciona un cliente' }}
                    render={({ field }) => (
                      <SelectorCliente value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
                {errors.cliente_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.cliente_id.message}</p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">
              Moto <span className="font-normal text-neutral-400">(opcional, si ya está registrada)</span>
            </label>
            <div className="mt-1.5">
              <Controller
                name="moto_id"
                control={control}
                render={({ field }) => (
                  <SelectorMoto
                    value={field.value}
                    nombreInicial={
                      cita?.moto_marca
                        ? `${cita.moto_marca} ${cita.moto_modelo} · ${cita.moto_placa || 'sin placa'}`
                        : ''
                    }
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#1C1B1A]">Fecha</label>
              <input
                type="date"
                className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
                {...register('fecha', { required: 'La fecha es obligatoria' })}
              />
              {errors.fecha && <p className="mt-1 text-xs text-red-600">{errors.fecha.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-[#1C1B1A]">
                Hora <span className="font-normal text-neutral-400">(opc.)</span>
              </label>
              <input
                type="time"
                className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
                {...register('hora')}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">
              Motivo <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <textarea
              rows={2}
              className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
              {...register('motivo')}
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
