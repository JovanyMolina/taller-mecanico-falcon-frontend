import api from './api';

async function listar(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.busqueda) params.append('q', filtros.busqueda);
  const query = params.toString() ? `?${params.toString()}` : '';

  const respuesta = await api.get(`/cotizaciones${query}`);
  return respuesta.data;
}

async function obtenerPorId(id) {
  const respuesta = await api.get(`/cotizaciones/${id}`);
  return respuesta.data;
}

async function crear(datos) {
  const respuesta = await api.post('/cotizaciones', datos);
  return respuesta.data;
}

async function actualizar(id, datos) {
  const respuesta = await api.put(`/cotizaciones/${id}`, datos);
  return respuesta.data;
}

async function cambiarEstado(id, estado) {
  const respuesta = await api.patch(`/cotizaciones/${id}/estado`, { estado });
  return respuesta.data;
}

export default { listar, obtenerPorId, crear, actualizar, cambiarEstado };
