'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import motocicletaService from '../services/motocicleta.service';
import { useDebounce } from '../hooks/useDebounce';

// value: moto_id actual (o null). onChange(motoId): notifica la selección.
// nombreInicial: texto para precargar en modo edición sin pedir de nuevo al backend.
export default function SelectorMoto({ value, nombreInicial, onChange }) {
  const [texto, setTexto] = useState(nombreInicial || '');
  const [resultados, setResultados] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const contenedorRef = useRef(null);
  const textoDebounced = useDebounce(texto, 300);

  useEffect(() => {
    if (!abierto) return;

    let vigente = true;
    setBuscando(true);
    motocicletaService
      .listar(textoDebounced)
      .then((data) => {
        if (vigente) setResultados(data);
      })
      .finally(() => {
        if (vigente) setBuscando(false);
      });

    return () => {
      vigente = false;
    };
  }, [textoDebounced, abierto]);

  useEffect(() => {
    function alClicFuera(e) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', alClicFuera);
    return () => document.removeEventListener('mousedown', alClicFuera);
  }, []);

  function seleccionar(moto) {
    setTexto(`${moto.marca} ${moto.modelo} · ${moto.placa || 'sin placa'} (${moto.cliente_nombre})`);
    setAbierto(false);
    onChange(moto.id);
  }

  return (
    <div ref={contenedorRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            onChange(null);
          }}
          onFocus={() => setAbierto(true)}
          placeholder="Buscar moto por placa o dueño..."
          className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-8 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
        />
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      </div>

      {abierto && (
        <div className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-neutral-200 bg-white shadow-lg">
          {buscando && <p className="px-3 py-2 text-sm text-neutral-400">Buscando...</p>}
          {!buscando && resultados.length === 0 && (
            <p className="px-3 py-2 text-sm text-neutral-400">Sin resultados.</p>
          )}
          {!buscando &&
            resultados.map((moto) => (
              <button
                key={moto.id}
                type="button"
                onClick={() => seleccionar(moto)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
              >
                <span className="font-medium text-[#1C1B1A]">
                  {moto.marca} {moto.modelo}
                </span>
                <span className="ml-2 text-neutral-400">
                  {moto.placa || 'sin placa'} · {moto.cliente_nombre}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
