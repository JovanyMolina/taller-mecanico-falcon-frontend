'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = 'taller_motos_token';
const STORAGE_KEY_USUARIO = 'taller_motos_usuario';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem(STORAGE_KEY_TOKEN);
    const usuarioGuardado = localStorage.getItem(STORAGE_KEY_USUARIO);

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }

    setCargando(false);
  }, []);

  async function login(email, password) {
    const { usuario: usuarioLogueado, token: tokenNuevo } = await authService.login(email, password);

    localStorage.setItem(STORAGE_KEY_TOKEN, tokenNuevo);
    localStorage.setItem(STORAGE_KEY_USUARIO, JSON.stringify(usuarioLogueado));

    setToken(tokenNuevo);
    setUsuario(usuarioLogueado);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USUARIO);
    setToken(null);
    setUsuario(null);
  }

  const value = {
    usuario,
    token,
    cargando,
    estaAutenticado: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
