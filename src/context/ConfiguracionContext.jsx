'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import configuracionService from '../services/configuracion.service';

const ConfiguracionContext = createContext(null);

export function ConfiguracionProvider({ children }) {
  const { estaAutenticado } = useAuth();
  const [config, setConfig] = useState(null);
  const [cargando, setCargando] = useState(true);

  const recargarConfig = useCallback(async () => {
    try {
      const data = await configuracionService.obtener();
      setConfig(data);
    } catch {

    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (estaAutenticado) {
      recargarConfig();
    } else {
      setConfig(null);
      setCargando(false);
    }
  }, [estaAutenticado, recargarConfig]);

  const value = {
    config,
    cargando,
    actualizarConfig: setConfig,
    recargarConfig,
  };

  return <ConfiguracionContext.Provider value={value}>{children}</ConfiguracionContext.Provider>;
}

export function useConfiguracion() {
  const context = useContext(ConfiguracionContext);
  if (!context) {
    throw new Error('useConfiguracion debe usarse dentro de un ConfiguracionProvider');
  }
  return context;
}
