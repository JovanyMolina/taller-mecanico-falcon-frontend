'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(datos) {
    setEnviando(true);
    try {
      await login(datos.email, datos.password);
      router.push('/dashboard');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo iniciar sesión',
        text: error.message,
        confirmButtonColor: '#1C1B1A',
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#1C1B1A] px-14 py-12 lg:flex">
      {/* marca de agua para el fondo */}
       {/*  <div className="absolute inset-0 z-0">
          <img
            src="/Falcon.webp"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-10"
          />
        </div> */}
        <img
          src="/Falcon.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-[36rem] w-[36rem] rotate-12 object-contain opacity-[0.06]"
        />

        <div className="relative">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F5A623]">
            Sistema interno
          </span>
          <div className="mt-6 flex items-center gap-4">
            <img src="/Falcon.webp" alt="Taller Motos Falcon" className="h-16 w-16 object-contain" />
            <h1 className="text-4xl font-bold leading-[1.05] text-white">
              Taller
              <br />
              Motos
            </h1>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/50">
            Recepción, cotizaciones y órdenes de servicio en un solo lugar —
            del ingreso de la moto hasta la entrega al cliente.
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-1.5">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-3 shrink-0 skew-x-[-20deg] bg-[#F5A623]/90"
                style={{ opacity: i % 2 === 0 ? 1 : 0.15 }}
              />
            ))}
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-white/30">
            Acceso restringido al personal del taller
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 sm:px-16 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#B4650F]">
              Taller Motos
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#1C1B1A]">Inicia sesión</h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            Usa tu correo y contraseña asignados por el administrador.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-[#1C1B1A]">
                Correo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
                placeholder="tu@tallermotos.com"
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo no válido' },
                })}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-[#1C1B1A]">
                Contraseña
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
                  placeholder="••••••••"
                  {...register('password', { required: 'La contraseña es obligatoria' })}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((actual) => !actual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  tabIndex={-1}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-md bg-[#1C1B1A] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90 disabled:opacity-50"
            >
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
