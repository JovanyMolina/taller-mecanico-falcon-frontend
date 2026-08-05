'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Printer, ArrowLeft } from 'lucide-react';
import cotizacionService from '../../../../../services/cotizacion.service';
import configuracionService from '../../../../../services/configuracion.service';
import { API_ORIGIN } from '../../../../../services/api';

const ESTADO_LABEL = {
  pendiente: 'PENDIENTE DE APROBACIÓN',
  aprobada: 'APROBADA',
  rechazada: 'RECHAZADA',
};

const ESTADO_COLOR = {
  pendiente: 'border-amber-500 text-amber-700 bg-amber-50',
  aprobada: 'border-green-600 text-green-700 bg-green-50',
  rechazada: 'border-red-600 text-red-700 bg-red-50',
};

const TIPO_LABEL = {
  refaccion: 'Refacción',
  mano_obra: 'Mano de obra',
  refaccion_caducidad: 'Refacción con caducidad',
};

export default function ImprimirCotizacionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cotizacion, setCotizacion] = useState(null);
  const [negocio, setNegocio] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([cotizacionService.obtenerPorId(id), configuracionService.obtener()])
      .then(([datosCotizacion, datosNegocio]) => {
        setCotizacion(datosCotizacion);
        setNegocio(datosNegocio);
      })
      .catch((error) => {
        Swal.fire({ icon: 'error', title: 'No se pudo cargar la cotización', text: error.message });
      })
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return <p className="p-8 text-center text-sm text-neutral-400">Cargando...</p>;
  }

  if (!cotizacion || !negocio) {
    return <p className="p-8 text-center text-sm text-neutral-400">Cotización no encontrada.</p>;
  }

  const fecha = new Date(cotizacion.created_at).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <div className="no-imprimir mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-[#1C1B1A]"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-md bg-[#1C1B1A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90"
        >
          <Printer size={16} />
          Imprimir
        </button>
      </div>

      <div className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-10 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
          <div className="flex items-center gap-4">
            <img
              src={`${API_ORIGIN}${negocio.logo_url}`}
              alt={negocio.nombre}
              className="h-16 w-16 object-contain"
            />
            <div>
              <p className="text-lg font-bold text-[#1C1B1A]">{negocio.nombre}</p>
              <p className="text-xs text-neutral-500">{negocio.direccion}</p>
              <p className="text-xs text-neutral-500">
                {negocio.telefono} · {negocio.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-neutral-400">Cotización</p>
            <p className="text-2xl font-bold text-[#1C1B1A]">#{cotizacion.id}</p>
            <p className="mt-1 text-xs text-neutral-500">{fecha}</p>
          </div>
        </div>

        <div
          className={`mt-6 inline-block rounded-md border px-4 py-2 text-sm font-bold ${ESTADO_COLOR[cotizacion.estado]}`}
        >
          {ESTADO_LABEL[cotizacion.estado]}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">Cliente</p>
            <p className="mt-1 font-medium text-[#1C1B1A]">{cotizacion.cliente_nombre}</p>
            <p className="text-neutral-500">{cotizacion.cliente_telefono}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">Moto</p>
            <p className="mt-1 font-medium text-[#1C1B1A]">
              {cotizacion.moto_marca} {cotizacion.moto_modelo}
            </p>
            <p className="text-neutral-500">{cotizacion.moto_placa || 'Sin placa'}</p>
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-800 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-2">Tipo</th>
              <th className="py-2">Concepto</th>
              <th className="py-2 text-right">Cant.</th>
              <th className="py-2 text-right">Precio unit.</th>
              <th className="py-2 text-right">Caducidad</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cotizacion.items.map((item) => (
              <tr key={item.id} className="border-b border-neutral-100">
                <td className="py-2 text-neutral-600">{TIPO_LABEL[item.tipo]}</td>
                <td className="py-2 text-neutral-800">{item.concepto}</td>
                <td className="py-2 text-right text-neutral-600">{item.cantidad}</td>
                <td className="py-2 text-right text-neutral-600">
                  ${Number(item.precio_unitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 text-right text-neutral-600">
                  {item.caducacion
                    ? new Date(`${item.caducacion}T00:00:00`).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="py-2 text-right font-medium text-[#1C1B1A]">
                  ${Number(item.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cotizacion.observaciones && (
          <div className="mt-6 border-t border-neutral-200 pt-4">
            <p className="text-xs uppercase tracking-wide text-neutral-400">Observaciones</p>
            <p className="mt-1 whitespace-pre-line text-sm text-neutral-700">{cotizacion.observaciones}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-neutral-200 pt-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-neutral-400">Total</p>
            <p className="text-2xl font-bold text-[#1C1B1A]">
              ${Number(cotizacion.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            {Number(cotizacion.anticipo) > 0 && (
              <div className="mt-2 space-y-0.5 border-t border-neutral-200 pt-2">
                <p className="text-xs text-neutral-500">
                  Anticipo:{' '}
                  <span className="font-medium text-neutral-700">
                    ${Number(cotizacion.anticipo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-sm font-bold text-[#B4650F]">
                  Saldo restante: $
                  {(Number(cotizacion.total) - Number(cotizacion.anticipo)).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="no-imprimir mt-10 text-center text-xs text-neutral-400">
          Cotización generada por {cotizacion.creado_por_nombre} — {negocio.nombre}
        </p>
      </div>
    </div>
  );
}