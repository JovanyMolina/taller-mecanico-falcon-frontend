'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Search, Plus, Pencil, Power, Trash2 } from 'lucide-react';
import usuarioService from '../../../services/usuario.service';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAuth } from '../../../context/AuthContext';
import UsuarioFormModal from '../../../components/UsuarioFormModal';

const ROL_LABEL = { admin: 'Administrador', usuario: 'Usuario' };

export default function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebounce(busqueda, 300);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const data = await usuarioService.listar(busquedaDebounced);
      setUsuarios(data);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la lista', text: error.message });
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  function abrirModalNuevo() {
    setUsuarioEditando(null);
    setModalAbierto(true);
  }

  function abrirModalEditar(usuario) {
    setUsuarioEditando(usuario);
    setModalAbierto(true);
  }

  async function guardarUsuario(datos) {
    setGuardando(true);
    try {
      if (usuarioEditando) {
        const { password, ...datosSinPassword } = datos;
        await usuarioService.actualizar(usuarioEditando.id, datosSinPassword);
      } else {
        await usuarioService.crear(datos);
      }
      setModalAbierto(false);
      await cargarUsuarios();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.message });
    } finally {
      setGuardando(false);
    }
  }

  async function alternarEstado(usuario) {
    const activando = !usuario.activo;

    if (!activando) {
      const confirmacion = await Swal.fire({
        icon: 'warning',
        title: `¿Desactivar a ${usuario.nombre}?`,
        text: 'No podrá iniciar sesión mientras esté desactivado.',
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#1C1B1A',
      });
      if (!confirmacion.isConfirmed) return;
    }

    try {
      await usuarioService.cambiarEstado(usuario.id, activando);
      await cargarUsuarios();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo actualizar el estado', text: error.message });
    }
  }

  async function eliminarUsuario(usuario) {
    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: `¿Eliminar a ${usuario.nombre}?`,
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmacion.isConfirmed) return;

    try {
      await usuarioService.eliminar(usuario.id);
      await cargarUsuarios();
    } catch (error) {
      // Si tiene historial (cotizaciones, órdenes), el backend lo rechaza y
      // sugiere desactivar en su lugar — se lo ofrecemos directo aquí.
      const ofrecerDesactivar = await Swal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text: error.message,
        showCancelButton: error.message.includes('Desactívalo'),
        confirmButtonText: error.message.includes('Desactívalo') ? 'Desactivar en su lugar' : 'Entendido',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#1C1B1A',
      });
      if (ofrecerDesactivar.isConfirmed && error.message.includes('Desactívalo')) {
        await alternarEstado(usuario);
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1A]">Usuarios</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {usuarios.length} usuario{usuarios.length !== 1 && 's'} registrado
            {usuarios.length !== 1 && 's'}
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="flex items-center gap-2 rounded-md bg-[#1C1B1A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C1B1A]/90"
        >
          <Plus size={16} />
          Nuevo usuario
        </button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full rounded-md border border-neutral-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1C1B1A] focus:ring-1 focus:ring-[#1C1B1A]"
        />
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white">
        <div className="max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
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

            {!cargando && usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}

            {!cargando &&
              usuarios.map((usuario) => {
                const esUnoMismo = usuario.id === usuarioActual?.id;

                return (
                  <tr key={usuario.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-[#1C1B1A]">
                      {usuario.nombre}
                      {esUnoMismo && <span className="ml-2 text-xs text-neutral-400">(tú)</span>}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{usuario.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          usuario.rol === 'admin'
                            ? 'bg-[#1C1B1A]/10 text-[#1C1B1A]'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {ROL_LABEL[usuario.rol]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          usuario.activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirModalEditar(usuario)}
                          className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-[#1C1B1A]"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* No se puede desactivar ni eliminar la propia cuenta — el backend
                            ya lo bloquea, pero también lo ocultamos aquí para no ofrecer
                            una acción que sabemos que va a fallar. */}
                        {!esUnoMismo && (
                          <>
                            <button
                              onClick={() => alternarEstado(usuario)}
                              className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-[#1C1B1A]"
                              title={usuario.activo ? 'Desactivar' : 'Activar'}
                            >
                              <Power size={16} />
                            </button>
                            <button
                              onClick={() => eliminarUsuario(usuario)}
                              className="rounded-md p-1.5 text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        </div>
      </div>

      {modalAbierto && (
        <UsuarioFormModal
          usuario={usuarioEditando}
          onGuardar={guardarUsuario}
          onCerrar={() => setModalAbierto(false)}
          guardando={guardando}
        />
      )}
    </div>
  );
}
