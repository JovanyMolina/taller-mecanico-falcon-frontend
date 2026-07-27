import api from './api';

async function obtenerEstadisticas() {
  const respuesta = await api.get('/dashboard/estadisticas');
  return respuesta.data;
}

export default { obtenerEstadisticas };
