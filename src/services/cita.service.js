import api from './api';

async function listar(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.desde) params.append('desde', filtros.desde);
  if (filtros.hasta) params.append('hasta', filtros.hasta);
  if (filtros.busqueda) params.append('q', filtros.busqueda);
  const query = params.toString() ? `?${params.toString()}` : '';

  const respuesta = await api.get(`/citas${query}`);
  return respuesta.data;
}

async function crear(datos) {
  const respuesta = await api.post('/citas', datos);
  return respuesta.data;
}

async function actualizar(id, datos) {
  const respuesta = await api.put(`/citas/${id}`, datos);
  return respuesta.data;
}

async function cambiarEstado(id, estado) {
  const respuesta = await api.patch(`/citas/${id}/estado`, { estado });
  return respuesta.data;
}

export default { listar, crear, actualizar, cambiarEstado };
