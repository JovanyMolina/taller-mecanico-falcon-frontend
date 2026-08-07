'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Upload } from 'lucide-react';
import configuracionService from '../../../services/configuracion.service';
import { API_ORIGIN } from '../../../services/api';
import { useConfiguracion } from '../../../context/ConfiguracionContext';

export default function ConfiguracionPage() {
  const { config, cargando, actualizarConfig } = useConfiguracion();
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const inputArchivoRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (config) {
      reset({
        nombre: config.nombre,
        direccion: config.direccion || '',
        telefono: config.telefono || '',
        email: config.email || '',
        trabaja_domingos: Boolean(config.trabaja_domingos),
      });
    }
  }, [config, reset]);

  async function guardar(datos) {
    setGuardando(true);
    try {
      const actualizado = await configuracionService.actualizar(datos);
      actualizarConfig(actualizado);
      Swal.fire({ icon: 'success', title: 'Datos guardados', confirmButtonColor: '#1C1B1A' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.message });
    } finally {
      setGuardando(false);
    }
  }

  async function alSeleccionarArchivo(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendoLogo(true);
    try {
      const actualizado = await configuracionService.actualizarLogo(archivo);
      actualizarConfig(actualizado);
      Swal.fire({ icon: 'success', title: 'Logo actualizado', confirmButtonColor: '#1C1B1A' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo subir el logo', text: error.message });
    } finally {
      setSubiendoLogo(false);
      e.target.value = ''; 
    }
  }

  if (cargando) {
    return <p className="text-center text-sm text-neutral-400 dark:text-neutral-500">Cargando configuración...</p>;
  }

  if (!config) {
    return (
      <p className="text-center text-sm text-neutral-400 dark:text-neutral-500">
        No se pudo cargar la configuración del negocio.
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1C1B1A] dark:text-neutral-100">Configuración</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Estos datos aparecen en el membrete de las cotizaciones impresas.
      </p>

      <div className="mt-6 max-w-2xl space-y-8">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <h2 className="text-sm font-semibold text-[#1C1B1A] dark:text-neutral-100">Logo</h2>
          <div className="mt-4 flex items-center gap-5">
            <img
              src={`${API_ORIGIN}${config.logo_url}`}
              alt={config.nombre}
              className="h-20 w-20 rounded-md border border-neutral-200 dark:border-neutral-800 object-contain p-2"
            />
            <div>
              <button
                type="button"
                onClick={() => inputArchivoRef.current?.click()}
                disabled={subiendoLogo}
                className="flex items-center gap-2 rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50"
              >
                <Upload size={16} />
                {subiendoLogo ? 'Subiendo...' : 'Subir nuevo logo'}
              </button>
              <input
                ref={inputArchivoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={alSeleccionarArchivo}
                className="hidden"
              />
              <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">JPG, PNG o WEBP. Máximo 2 MB.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(guardar)} className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6" noValidate>
          <h2 className="text-sm font-semibold text-[#1C1B1A] dark:text-neutral-100">Datos del negocio</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">Nombre del negocio</label>
              <input
                className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
                {...register('nombre', { required: 'El nombre es obligatorio' })}
              />
              {errors.nombre && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">
                Dirección <span className="font-normal text-neutral-400 dark:text-neutral-500">(opcional)</span>
              </label>
              <input
                className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
                {...register('direccion')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">
                  Teléfono <span className="font-normal text-neutral-400 dark:text-neutral-500">(opc.)</span>
                </label>
                <input
                  className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
                 {...register('telefono', 
                    {pattern: { value: /^[0-9()+-\s]*$/, message: 'Teléfono no válido' },
                    maxLength: { value: 10, message: 'Máximo 10 numeros' }, 
                    minLength: { value: 10, message: 'Mínimo 10 numeros' }})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">
                  Email <span className="font-normal text-neutral-400 dark:text-neutral-500">(opc.)</span>
                </label>
                <input
                  type="email"
                  className="mt-1.5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
                  {...register('email', {
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email no válido' },
                  })}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-5">
            <h2 className="text-sm font-semibold text-[#1C1B1A] dark:text-neutral-100">Horario</h2>
            <label className="mt-3 flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-[#1C1B1A] dark:text-neutral-100 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
                {...register('trabaja_domingos')}
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">El taller trabaja los domingos</span>
            </label>
            <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
              Si está apagado, la Agenda no permite crear ni mover citas a domingo.
            </p>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="mt-6 rounded-md bg-[#1C1B1A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90 disabled:opacity-50 dark:bg-neutral-100 dark:text-[#1C1B1A] dark:hover:bg-neutral-200"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
