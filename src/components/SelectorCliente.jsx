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
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
        <input
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            onChange(null); 
          }}
          onFocus={() => setAbierto(true)}
          placeholder="Buscar cliente por nombre o teléfono..."
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 py-2 pl-9 pr-8 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
        />
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
      </div>

      {abierto && (
        <div className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg">
          {buscando && <p className="px-3 py-2 text-sm text-neutral-400 dark:text-neutral-500">Buscando...</p>}
          {!buscando && resultados.length === 0 && (
            <p className="px-3 py-2 text-sm text-neutral-400 dark:text-neutral-500">Sin resultados.</p>
          )}
          {!buscando &&
            resultados.map((cliente) => (
              <button
                key={cliente.id}
                type="button"
                onClick={() => seleccionar(cliente)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <span className="font-medium text-[#1C1B1A] dark:text-neutral-100">{cliente.nombre}</span>
                <span className="ml-2 text-neutral-400 dark:text-neutral-500">{cliente.telefono}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
