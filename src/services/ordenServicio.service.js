import api from './api';

async function listar(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.busqueda) params.append('q', filtros.busqueda);
  const query = params.toString() ? `?${params.toString()}` : '';

  const respuesta = await api.get(`/ordenes${query}`);
  return respuesta.data;
}

async function obtenerPorId(id) {
  const respuesta = await api.get(`/ordenes/${id}`);
  return respuesta.data;
}

async function crear(datos) {
  const respuesta = await api.post('/ordenes', datos);
  return respuesta.data;
}

async function actualizar(id, datos) {
  const respuesta = await api.put(`/ordenes/${id}`, datos);
  return respuesta.data;
}

async function cambiarEstado(id, estado, fecha_entrega_real) {
  const respuesta = await api.patch(`/ordenes/${id}/estado`, { estado, fecha_entrega_real });
  return respuesta.data;
}

export default { listar, obtenerPorId, crear, actualizar, cambiarEstado };
