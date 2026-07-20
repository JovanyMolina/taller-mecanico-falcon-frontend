import api from './api';

async function login(email, password) {
  const respuesta = await api.post('/auth/login', { email, password });
  return respuesta.data; 
}

export default { login };
