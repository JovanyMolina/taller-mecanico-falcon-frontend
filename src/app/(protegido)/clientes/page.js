'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Search, Plus, Pencil, Power } from 'lucide-react';
import clienteService from '../../../services/cliente.service';
import { useDebounce } from '../../../hooks/useDebounce';
import ClienteFormModal from '../../../components/ClienteFormModal';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const busquedaDebounced = useDebounce(busqueda, 300);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarClientes = useCallback(async () => {
    setCargando(true);
    try {
      const data = await clienteService.listar(busquedaDebounced, filtroEstado);
      setClientes(data);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la lista', text: error.message });
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced, filtroEstado]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  function abrirModalNuevo() {
    setClienteEditando(null);
    setModalAbierto(true);
  }

  function abrirModalEditar(cliente) {
    setClienteEditando(cliente);
    setModalAbierto(true);
  }

  async function guardarCliente(datos) {
    setGuardando(true);
    try {
      if (clienteEditando) {
        await clienteService.actualizar(clienteEditando.id, datos);
      } else {
        await clienteService.crear(datos);
      }
      setModalAbierto(false);
      await cargarClientes();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.message });
    } finally {
      setGuardando(false);
    }
  }

  async function alternarEstado(cliente) {
    const activando = !cliente.activo;

    if (!activando) {
      const confirmacion = await Swal.fire({
        icon: 'warning',
        title: `¿Desactivar a ${cliente.nombre}?`,
        text: 'Dejará de aparecer como opción disponible al registrar motos nuevas.',
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#1C1B1A',
      });
      if (!confirmacion.isConfirmed) return;
    }

    try {
      await clienteService.cambiarEstado(cliente.id, activando);
      await cargarClientes();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo actualizar el estado', text: error.message });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1A] dark:text-neutral-100">Clientes</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {clientes.length} cliente{clientes.length !== 1 && 's'} registrado{clientes.length !== 1 && 's'}
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="flex items-center gap-2 rounded-md bg-[#1C1B1A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90 dark:bg-neutral-100 dark:text-[#1C1B1A] dark:hover:bg-neutral-200"
        >
          <Plus size={16} />
          Nuevo cliente
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, teléfono o email..."
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
        />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 focus:border-[#1C1B1A] dark:focus:border-neutral-500 focus:ring-1 focus:ring-[#1C1B1A] dark:focus:ring-neutral-500"
        >
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Teléfono</th>
              <th className="px-4 py-3 font-medium">Dirección</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">
                  Cargando...
                </td>
              </tr>
            )}

            {!cargando && clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">
                  No se encontraron clientes.
                </td>
              </tr>
            )}

            {!cargando &&
              clientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#1C1B1A] dark:text-neutral-100">{cliente.nombre}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{cliente.telefono}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{cliente.direccion || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        cliente.activo
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirModalEditar(cliente)}
                        className="rounded-md p-1.5 text-neutral-500 dark:text-neutral-400 transition hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-[#1C1B1A] dark:hover:text-white"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => alternarEstado(cliente)}
                        className="rounded-md p-1.5 text-neutral-500 dark:text-neutral-400 transition hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-[#1C1B1A] dark:hover:text-white"
                        title={cliente.activo ? 'Desactivar' : 'Activar'}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        </div>
      </div>

      {modalAbierto && (
        <ClienteFormModal
          cliente={clienteEditando}
          onGuardar={guardarCliente}
          onCerrar={() => setModalAbierto(false)}
          guardando={guardando}
        />
      )}
    </div>
  );
}
