'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import SelectorMoto from './SelectorMoto';

const ITEM_VACIO = { tipo: 'refaccion', concepto: '', cantidad: 1, precio_unitario: '', caducacion: '' };

const TIPO_LABEL = {
  refaccion: 'Refacción',
  mano_obra: 'Mano de obra',
  refaccion_caducidad: 'Refacción con caducidad',
};

function nombreMoto(cotizacion) {
  if (!cotizacion) return '';
  return `${cotizacion.moto_marca} ${cotizacion.moto_modelo} · ${cotizacion.moto_placa || 'sin placa'} (${cotizacion.cliente_nombre})`;
}

function mapearItems(cotizacion) {
  return cotizacion?.items?.length
    ? cotizacion.items.map((i) => ({
        tipo: i.tipo,
        concepto: i.concepto,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario,
        caducacion: i.caducacion ? String(i.caducacion).slice(0, 10) : '',
      }))
    : [ITEM_VACIO];
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
      observaciones: cotizacion?.observaciones || '',
      garantia: cotizacion?.garantia || '',
      anticipo: cotizacion?.anticipo ?? '',
      items: mapearItems(cotizacion),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    reset({
      moto_id: cotizacion?.moto_id || null,
      observaciones: cotizacion?.observaciones || '',
      garantia: cotizacion?.garantia || '',
      anticipo: cotizacion?.anticipo ?? '',
      items: mapearItems(cotizacion),
    });
  }, [cotizacion, reset]);

  const itemsEnVivo = watch('items');
  const anticipoEnVivo = watch('anticipo');
  const total = (itemsEnVivo || []).reduce((acc, item) => {
    const cantidad = Number(item.cantidad) || 0;
    const precio = Number(item.precio_unitario) || 0;
    return acc + cantidad * precio;
  }, 0);
  const anticipoNum = Number(anticipoEnVivo) || 0;
  const saldoRestante = total - anticipoNum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1C1B1A] dark:text-neutral-100">
            {soloLectura ? 'Cotización' : esEdicion ? 'Editar cotización' : 'Nueva cotización'}
          </h2>
          <button onClick={onCerrar} className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onGuardar)} className="mt-5 space-y-5" noValidate>
          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">Moto</label>
            {soloLectura ? (
              <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-300">{nombreMoto(cotizacion)}</p>
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
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.moto_id.message}</p>
                )}
              </>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">Ítems</label>
              {!soloLectura && (
                <button
                  type="button"
                  onClick={() => append(ITEM_VACIO)}
                  className="flex items-center gap-1 text-xs font-medium text-[#B4650F] dark:text-[#F5A623] hover:underline"
                >
                  <Plus size={14} />
                  Agregar ítem
                </button>
              )}
            </div>

            <div className="mt-2 space-y-2">
              {fields.map((field, index) => {
                const tipoActual = itemsEnVivo?.[index]?.tipo;
                const tieneCaducidad = tipoActual === 'refaccion_caducidad';

                return (
                  <div
                    key={field.id}
                    className={`rounded-md ${tieneCaducidad ? 'border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-2' : ''}`}
                  >
                    <div className="grid grid-cols-12 items-start gap-2">
                      {soloLectura ? (
                        <div className="col-span-3 flex items-center px-2 py-2 text-xs text-neutral-600 dark:text-neutral-300">
                          {TIPO_LABEL[field.tipo] || field.tipo}
                        </div>
                      ) : (
                        <select
                          disabled={soloLectura}
                          className="col-span-3 rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-2 text-xs outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 disabled:bg-neutral-50 dark:disabled:bg-neutral-900"
                          {...register(`items.${index}.tipo`)}
                        >
                          <option value="refaccion">Refacción</option>
                          <option value="mano_obra">Mano de obra</option>
                          <option value="refaccion_caducidad">Refacción con caducidad</option>
                        </select>
                      )}

                      <div className="col-span-4">
                        <input
                          disabled={soloLectura}
                          placeholder="Concepto"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-2 text-xs outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 disabled:bg-neutral-50 dark:disabled:bg-neutral-900"
                          {...register(`items.${index}.concepto`, { required: 'Requerido' })}
                        />
                      </div>

                      <input
                        type="number"
                        disabled={soloLectura}
                        placeholder="Cant."
                        min={1}
                        className="col-span-1 rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-2 text-xs outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 disabled:bg-neutral-50 dark:disabled:bg-neutral-900"
                        {...register(`items.${index}.cantidad`, { required: true, min: 1 })}
                      />

                      <input
                        type="number"
                        step="0.01"
                        disabled={soloLectura}
                        placeholder="Precio unit."
                        min={0}
                        className="col-span-3 rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-2 text-xs outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 disabled:bg-neutral-50 dark:disabled:bg-neutral-900"
                        {...register(`items.${index}.precio_unitario`, { required: true, min: 0 })}
                      />

                      {!soloLectura && (
                        <button
                          type="button"
                          onClick={() => fields.length > 1 && remove(index)}
                          disabled={fields.length === 1}
                          className="col-span-1 flex items-center justify-center rounded-md p-2 text-neutral-400 dark:text-neutral-500 hover:bg-red-50 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {tieneCaducidad && (
                      <div className="mt-2 flex items-center gap-2 pl-2">
                        <label className="text-xs font-medium text-amber-800 dark:text-amber-300">Fecha de caducidad:</label>
                        {soloLectura ? (
                          <span className="text-xs text-neutral-600 dark:text-neutral-300">
                            {itemsEnVivo?.[index]?.caducacion
                              ? new Date(`${itemsEnVivo[index].caducacion}T00:00:00`).toLocaleDateString('es-MX', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : 'Sin fecha'}
                          </span>
                        ) : (
                          <input
                            type="date"
                            className="rounded-md border border-amber-300 dark:border-amber-700 px-2 py-1.5 text-xs outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500"
                            {...register(`items.${index}.caducacion`)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">Anticipo</label>
            {soloLectura ? (
              <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-300">
                {cotizacion?.anticipo
                  ? `$${Number(cotizacion.anticipo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                  : 'Sin anticipo'}
              </p>
            ) : (
              <>
                <div className="relative mt-1.5 max-w-[200px]">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 py-2 pl-6 pr-3 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 disabled:bg-neutral-50 dark:disabled:bg-neutral-900"
                    {...register('anticipo', { min: { value: 0, message: 'Debe ser un monto positivo' } })}
                  />
                </div>
                {errors.anticipo && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.anticipo.message}</p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">Observaciones</label>
            {soloLectura ? (
              <p className="mt-1.5 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
                {cotizacion?.observaciones || 'Sin observaciones'}
              </p>
            ) : (
              <>
                <textarea
                  rows={3}
                  placeholder="Notas u observaciones adicionales sobre la cotización (opcional)"
                  maxLength={1000}
                  className="mt-1.5 w-full resize-none rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 disabled:bg-neutral-50 dark:disabled:bg-neutral-900"
                  {...register('observaciones')}
                />
                {errors.observaciones && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.observaciones.message}</p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#1C1B1A] dark:text-neutral-100">
              Garantía <span className="font-normal text-neutral-400 dark:text-neutral-500">(opcional)</span>
            </label>
            {soloLectura ? (
              <p className="mt-1.5 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
                {cotizacion?.garantia || 'Sin garantía especificada'}
              </p>
            ) : (
              <>
                <textarea
                  rows={2}
                  placeholder="Ej. 3 meses en mano de obra y 6 meses en refacciones (opcional)"
                  maxLength={500}
                  className="mt-1.5 w-full resize-none rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 disabled:bg-neutral-50 dark:disabled:bg-neutral-900"
                  {...register('garantia')}
                />
                {errors.garantia && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.garantia.message}</p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Total:</span>
              <span className="text-lg font-bold text-[#1C1B1A] dark:text-neutral-100">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {anticipoNum > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Anticipo:</span>
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    ${anticipoNum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Saldo restante:</span>
                  <span className="text-sm font-bold text-[#B4650F] dark:text-[#F5A623]">
                    ${saldoRestante.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              {soloLectura ? 'Cerrar' : 'Cancelar'}
            </button>
            {!soloLectura && (
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 rounded-md bg-[#1C1B1A] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90 disabled:opacity-50 dark:bg-neutral-100 dark:text-[#1C1B1A] dark:hover:bg-neutral-200"
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
