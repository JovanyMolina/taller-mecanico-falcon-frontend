import api from './api';

async function obtener() {
  const respuesta = await api.get('/configuracion');
  return respuesta.data;
}

async function actualizar(datos) {
  const respuesta = await api.put('/configuracion', datos);
  return respuesta.data;
}

async function actualizarLogo(archivo) {
  const formData = new FormData();
  formData.append('logo', archivo);
  const respuesta = await api.postFormData('/configuracion/logo', formData);
  return respuesta.data;
}

export default { obtener, actualizar, actualizarLogo };
