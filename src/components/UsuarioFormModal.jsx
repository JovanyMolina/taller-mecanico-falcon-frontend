'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

export default function UsuarioFormModal({ usuario, onGuardar, onCerrar, guardando }) {
  const esEdicion = Boolean(usuario);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: usuario?.nombre || '',
      email: usuario?.email || '',
      password: '',
      rol: usuario?.rol || 'usuario',
    },
  });

  useEffect(() => {
    reset({
      nombre: usuario?.nombre || '',
      email: usuario?.email || '',
      password: '',
      rol: usuario?.rol || 'usuario',
    });
  }, [usuario, reset]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1C1B1A] dark:text-neutral-100">
            {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button onClick={onCerrar} className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onGuardar)} className="mt-5 space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">Nombre</label>
            <input
              className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
              {...register('nombre', { required: 'El nombre es obligatorio' })}
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">Email</label>
            <input
              type="email"
              className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
              {...register('email', {
                required: 'El email es obligatorio',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email no válido' },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
          </div>
          {!esEdicion && (
            <div>
              <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">Contraseña</label>
              <input
                type="password"
                className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: { value: 6, message: 'Debe tener al menos 6 caracteres' },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">Rol</label>
            <select
              className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
              {...register('rol', { required: true })}
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
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
