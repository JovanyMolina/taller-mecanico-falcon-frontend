'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

export default function ClienteFormModal({ cliente, onGuardar, onCerrar, guardando }) {
  const esEdicion = Boolean(cliente);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: cliente?.nombre || '',
      telefono: cliente?.telefono || '',
      email: cliente?.email || '',
      direccion: cliente?.direccion || '',
    },
  });

  useEffect(() => {
    reset({
      nombre: cliente?.nombre || '',
      telefono: cliente?.telefono || '',
      email: cliente?.email || '',
      direccion: cliente?.direccion || '',
    });
  }, [cliente, reset]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1C1B1A]">
            {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={onCerrar} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onGuardar)} className="mt-5 space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">Nombre</label>
            <input
              className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
              {...register('nombre', { required: 'El nombre es obligatorio' })}
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">Teléfono</label>
            <input
              className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
              {...register('telefono', {
                required: 'El teléfono es obligatorio',
                minLength: { value: 10, message: 'Debe tener al menos 10 dígitos' },
              })}
            />
            {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">
              Email <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <input
              type="email"
              className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
              {...register('email', {
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email no válido' },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">
              Dirección <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <input
              className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
              {...register('direccion')}
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
