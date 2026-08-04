'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Swal from 'sweetalert2';
import { X, Camera, Trash2 } from 'lucide-react';
import SelectorCliente from './SelectorCliente';
import motoEvidenciaService from '../services/motoEvidencia.service';
import { API_ORIGIN } from '../services/api';

export default function MotoFormModal({ moto, onGuardar, onCerrar, guardando }) {
  const esEdicion = Boolean(moto);
  const [fotos, setFotos] = useState([]);
  const [evidencias, setEvidencias] = useState([]);
  const [cargandoEvidencias, setCargandoEvidencias] = useState(false);

  useEffect(() => {
    if (!esEdicion) return;

    setCargandoEvidencias(true);
    motoEvidenciaService
      .listarPorMoto(moto.id)
      .then(setEvidencias)
      .catch(() => setEvidencias([]))
      .finally(() => setCargandoEvidencias(false));
  }, [moto?.id]);

  async function eliminarEvidencia(evidencia) {
    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar esta foto?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1C1B1A',
    });
    if (!confirmacion.isConfirmed) return;

    try {
      await motoEvidenciaService.eliminar(moto.id, evidencia.id);
      setEvidencias((actual) => actual.filter((e) => e.id !== evidencia.id));
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: error.message });
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cliente_id: moto?.cliente_id || null,
      marca: moto?.marca || '',
      modelo: moto?.modelo || '',
      anio: moto?.anio || '',
      placa: moto?.placa || '',
      color: moto?.color || '',
      kilometraje: moto?.kilometraje || '',
      falla_reportada: moto?.falla_reportada || '',
    },
  });

  useEffect(() => {
    reset({
      cliente_id: moto?.cliente_id || null,
      marca: moto?.marca || '',
      modelo: moto?.modelo || '',
      anio: moto?.anio || '',
      placa: moto?.placa || '',
      color: moto?.color || '',
      kilometraje: moto?.kilometraje || '',
      falla_reportada: moto?.falla_reportada || '',
    });
  }, [moto, reset]);

  function alGuardar(datos) {
    onGuardar({ ...datos, fotos });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1C1B1A]">
            {esEdicion ? 'Editar moto' : 'Registrar moto'}
          </h2>
          <button onClick={onCerrar} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(alGuardar)} className="mt-5 space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">Cliente</label>
            <div className="mt-1.5">
              <Controller
                name="cliente_id"
                control={control}
                rules={{ required: 'Selecciona un cliente' }}
                render={({ field }) => (
                  <SelectorCliente
                    value={field.value}
                    nombreInicial={moto?.cliente_nombre}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            {errors.cliente_id && (
              <p className="mt-1 text-xs text-red-600">{errors.cliente_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#1C1B1A]">Marca</label>
              <input
                className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
                {...register('marca', { required: 'La marca es obligatoria' })}
              />
              {errors.marca && <p className="mt-1 text-xs text-red-600">{errors.marca.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-[#1C1B1A]">Modelo</label>
              <input
                className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
                {...register('modelo', { required: 'El modelo es obligatorio' })}
              />
              {errors.modelo && <p className="mt-1 text-xs text-red-600">{errors.modelo.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-[#1C1B1A]">Año</label>
              <input
                type="number"
                className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
                {...register('anio')}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1C1B1A]">
                Placa <span className="font-normal text-neutral-400">(opc.)</span>
              </label>
              <input
                className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
                {...register('placa')}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1C1B1A]">Color</label>
              <input
                className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
                {...register('color')}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">
              Kilometraje <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <input
              type="number"
              className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
              {...register('kilometraje')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">
              Falla reportada <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <textarea
              rows={3}
              className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
              {...register('falla_reportada')}
            />
          </div>


          {!esEdicion && (
            <div>
              <label className="text-sm font-medium text-[#1C1B1A]">
                Evidencia en fotos <span className="font-normal text-neutral-400">(opcional)</span>
              </label>
              <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-neutral-300 px-3 py-2.5 text-sm text-neutral-500 transition hover:border-[#1C1B1A] hover:text-[#1C1B1A]">
                <Camera size={16} />
                {fotos.length > 0
                  ? `${fotos.length} foto${fotos.length !== 1 ? 's' : ''} seleccionada${fotos.length !== 1 ? 's' : ''}`
                  : 'Seleccionar fotos (cualquier formato de imagen)'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setFotos(Array.from(e.target.files || []))}
                />
              </label>
            </div>
          )}

          {esEdicion && (
            <div>
              <label className="text-sm font-medium text-[#1C1B1A]">Evidencia en fotos</label>

              {cargandoEvidencias && (
                <p className="mt-1.5 text-xs text-neutral-400">Cargando fotos...</p>
              )}

              {!cargandoEvidencias && evidencias.length === 0 && (
                <p className="mt-1.5 text-xs text-neutral-400">No hay fotos registradas para esta moto.</p>
              )}

              {!cargandoEvidencias && evidencias.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {evidencias.map((evidencia) => (
                    <div key={evidencia.id} className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200">
                      <img
                        src={`${API_ORIGIN}${evidencia.url_imagen}`}
                        alt="Evidencia de la moto"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => eliminarEvidencia(evidencia)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
                        title="Eliminar foto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
