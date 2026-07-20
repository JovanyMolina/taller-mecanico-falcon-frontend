'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida({ children }) {
  const { estaAutenticado, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      router.replace('/login');
    }
  }, [cargando, estaAutenticado, router]);

  if (cargando || !estaAutenticado) {
    return null;
  }

  return children;
}
