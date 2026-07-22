import api from './api';

async function listar(busqueda) {
  const query = busqueda ? `?q=${encodeURIComponent(busqueda)}` : '';
  const respuesta = await api.get(`/clientes${query}`);
  return respuesta.data;
}

async function crear(datos) {
  const respuesta = await api.post('/clientes', datos);
  return respuesta.data;
}

async function actualizar(id, datos) {
  const respuesta = await api.put(`/clientes/${id}`, datos);
  return respuesta.data;
}

async function cambiarEstado(id, activo) {
  const respuesta = await api.patch(`/clientes/${id}/estado`, { activo });
  return respuesta.data;
}

export default { listar, crear, actualizar, cambiarEstado };
