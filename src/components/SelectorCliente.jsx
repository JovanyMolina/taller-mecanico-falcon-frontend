'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import clienteService from '../services/cliente.service';
import { useDebounce } from '../hooks/useDebounce';


export default function SelectorCliente({ value, nombreInicial, onChange }) {
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
    clienteService
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

  function seleccionar(cliente) {
    setTexto(cliente.nombre);
    setAbierto(false);
    onChange(cliente.id);
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
            onChange(null); // hasta que no elija de la lista, no hay cliente_id válido
          }}
          onFocus={() => setAbierto(true)}
          placeholder="Buscar cliente por nombre o teléfono..."
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
            resultados.map((cliente) => (
              <button
                key={cliente.id}
                type="button"
                onClick={() => seleccionar(cliente)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
              >
                <span className="font-medium text-[#1C1B1A]">{cliente.nombre}</span>
                <span className="ml-2 text-neutral-400">{cliente.telefono}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
