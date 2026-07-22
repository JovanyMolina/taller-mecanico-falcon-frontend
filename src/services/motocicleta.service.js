import api from './api';

async function listar(busqueda) {
  const query = busqueda ? `?q=${encodeURIComponent(busqueda)}` : '';
  const respuesta = await api.get(`/motocicletas${query}`);
  return respuesta.data;
}

async function crear(datos) {
  const respuesta = await api.post('/motocicletas', datos);
  return respuesta.data;
}

async function actualizar(id, datos) {
  const respuesta = await api.put(`/motocicletas/${id}`, datos);
  return respuesta.data;
}

async function cambiarActivo(id, activo) {
  const respuesta = await api.patch(`/motocicletas/${id}/activo`, { activo });
  return respuesta.data;
}

async function cambiarEstado(id, estado) {
  const respuesta = await api.patch(`/motocicletas/${id}/estado`, { estado });
  return respuesta.data;
}

export default { listar, crear, actualizar, cambiarActivo, cambiarEstado };
