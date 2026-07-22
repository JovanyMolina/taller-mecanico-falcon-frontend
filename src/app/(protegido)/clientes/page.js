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
  const busquedaDebounced = useDebounce(busqueda, 300);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarClientes = useCallback(async () => {
    setCargando(true);
    try {
      const data = await clienteService.listar(busquedaDebounced);
      setClientes(data);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la lista', text: error.message });
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced]);

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
          <h1 className="text-2xl font-bold text-[#1C1B1A]">Clientes</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {clientes.length} cliente{clientes.length !== 1 && 's'} registrado{clientes.length !== 1 && 's'}
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="flex items-center gap-2 rounded-md bg-[#1C1B1A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90"
        >
          <Plus size={16} />
          Nuevo cliente
        </button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, teléfono o email..."
          className="w-full rounded-md border border-neutral-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
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
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  Cargando...
                </td>
              </tr>
            )}

            {!cargando && clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  No se encontraron clientes.
                </td>
              </tr>
            )}

            {!cargando &&
              clientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#1C1B1A]">{cliente.nombre}</td>
                  <td className="px-4 py-3 text-neutral-600">{cliente.telefono}</td>
                  <td className="px-4 py-3 text-neutral-600">{cliente.direccion || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        cliente.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirModalEditar(cliente)}
                        className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-[#1C1B1A]"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => alternarEstado(cliente)}
                        className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-[#1C1B1A]"
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
