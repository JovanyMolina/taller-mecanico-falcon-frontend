import api from './api';

async function subir(motoId, archivos) {
  const formData = new FormData();
  archivos.forEach((archivo) => formData.append('fotos', archivo));
  const respuesta = await api.postFormData(`/motocicletas/${motoId}/evidencias`, formData);
  return respuesta.data;
}

async function listarPorMoto(motoId) {
  const respuesta = await api.get(`/motocicletas/${motoId}/evidencias`);
  return respuesta.data;
}

async function eliminar(motoId, evidenciaId) {
  const respuesta = await api.delete(`/motocicletas/${motoId}/evidencias/${evidenciaId}`);
  return respuesta;
}

export default { subir, listarPorMoto, eliminar };
