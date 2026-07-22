'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import SelectorMoto from './SelectorMoto';

const ITEM_VACIO = { tipo: 'refaccion', concepto: '', cantidad: 1, precio_unitario: '' };

function nombreMoto(cotizacion) {
  if (!cotizacion) return '';
  return `${cotizacion.moto_marca} ${cotizacion.moto_modelo} · ${cotizacion.moto_placa || 'sin placa'} (${cotizacion.cliente_nombre})`;
}

export default function CotizacionFormModal({ cotizacion, soloLectura, onGuardar, onCerrar, guardando }) {
  const esEdicion = Boolean(cotizacion);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      moto_id: cotizacion?.moto_id || null,
      items: cotizacion?.items?.length
        ? cotizacion.items.map((i) => ({
            tipo: i.tipo,
            concepto: i.concepto,
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario,
          }))
        : [ITEM_VACIO],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    reset({
      moto_id: cotizacion?.moto_id || null,
      items: cotizacion?.items?.length
        ? cotizacion.items.map((i) => ({
            tipo: i.tipo,
            concepto: i.concepto,
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario,
          }))
        : [ITEM_VACIO],
    });
  }, [cotizacion, reset]);

 
  const itemsEnVivo = watch('items');
  const total = (itemsEnVivo || []).reduce((acc, item) => {
    const cantidad = Number(item.cantidad) || 0;
    const precio = Number(item.precio_unitario) || 0;
    return acc + cantidad * precio;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1C1B1A]">
            {soloLectura ? 'Cotización' : esEdicion ? 'Editar cotización' : 'Nueva cotización'}
          </h2>
          <button onClick={onCerrar} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onGuardar)} className="mt-5 space-y-5" noValidate>
          <div>
            <label className="text-sm font-medium text-[#1C1B1A]">Moto</label>
            {soloLectura ? (
              <p className="mt-1.5 text-sm text-neutral-600">{nombreMoto(cotizacion)}</p>
            ) : (
              <>
                <div className="mt-1.5">
                  <Controller
                    name="moto_id"
                    control={control}
                    rules={{ required: 'Selecciona una moto' }}
                    render={({ field }) => (
                      <SelectorMoto
                        value={field.value}
                        nombreInicial={nombreMoto(cotizacion)}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {errors.moto_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.moto_id.message}</p>
                )}
              </>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#1C1B1A]">Ítems</label>
              {!soloLectura && (
                <button
                  type="button"
                  onClick={() => append(ITEM_VACIO)}
                  className="flex items-center gap-1 text-xs font-medium text-[#B4650F] hover:underline"
                >
                  <Plus size={14} />
                  Agregar ítem
                </button>
              )}
            </div>

            <div className="mt-2 space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 items-start gap-2">
                  <select
                    disabled={soloLectura}
                    className="col-span-3 rounded-md border border-neutral-300 px-2 py-2 text-xs outline-none focus:border-[#1C1B1A] disabled:bg-neutral-50"
                    {...register(`items.${index}.tipo`)}
                  >
                    <option value="refaccion">Refacción</option>
                    <option value="mano_obra">Mano de obra</option>
                  </select>

                  <div className="col-span-4">
                    <input
                      disabled={soloLectura}
                      placeholder="Concepto"
                      className="w-full rounded-md border border-neutral-300 px-2 py-2 text-xs outline-none focus:border-[#1C1B1A] disabled:bg-neutral-50"
                      {...register(`items.${index}.concepto`, { required: 'Requerido' })}
                    />
                  </div>

                  <input
                    type="number"
                    disabled={soloLectura}
                    placeholder="Cant."
                    min={1}
                    className="col-span-1 rounded-md border border-neutral-300 px-2 py-2 text-xs outline-none focus:border-[#1C1B1A] disabled:bg-neutral-50"
                    {...register(`items.${index}.cantidad`, { required: true, min: 1 })}
                  />

                  <input
                    type="number"
                    step="0.01"
                    disabled={soloLectura}
                    placeholder="Precio unit."
                    min={0}
                    className="col-span-3 rounded-md border border-neutral-300 px-2 py-2 text-xs outline-none focus:border-[#1C1B1A] disabled:bg-neutral-50"
                    {...register(`items.${index}.precio_unitario`, { required: true, min: 0 })}
                  />

                  {!soloLectura && (
                    <button
                      type="button"
                      onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length === 1}
                      className="col-span-1 flex items-center justify-center rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
            <span className="text-sm text-neutral-500">Total:</span>
            <span className="text-lg font-bold text-[#1C1B1A]">
              ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 rounded-md border border-neutral-300 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
            >
              {soloLectura ? 'Cerrar' : 'Cancelar'}
            </button>
            {!soloLectura && (
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 rounded-md bg-[#1C1B1A] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
