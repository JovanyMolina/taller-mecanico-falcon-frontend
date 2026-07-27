import api from './api';

async function listar(busqueda) {
  const query = busqueda ? `?q=${encodeURIComponent(busqueda)}` : '';
  const respuesta = await api.get(`/usuarios${query}`);
  return respuesta.data;
}

async function crear(datos) {
  const respuesta = await api.post('/usuarios', datos);
  return respuesta.data;
}

async function actualizar(id, datos) {
  const respuesta = await api.put(`/usuarios/${id}`, datos);
  return respuesta.data;
}

async function cambiarEstado(id, activo) {
  const respuesta = await api.patch(`/usuarios/${id}/estado`, { activo });
  return respuesta.data;
}

async function eliminar(id) {
  const respuesta = await api.delete(`/usuarios/${id}`);
  return respuesta;
}

async function listarTecnicos() {
  const respuesta = await api.get('/usuarios/tecnicos');
  return respuesta.data;
}

export default { listar, crear, actualizar, cambiarEstado, eliminar, listarTecnicos };
