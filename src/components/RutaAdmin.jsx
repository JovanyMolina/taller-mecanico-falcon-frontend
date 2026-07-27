'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export default function RutaAdmin({ children }) {
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (usuario && usuario.rol !== 'admin') {
      Swal.fire({
        icon: 'error',
        title: 'Acceso restringido',
        text: 'Esta sección es solo para administradores.',
        confirmButtonColor: '#1C1B1A',
      });
      router.replace('/dashboard');
    }
  }, [usuario, router]);

  if (!usuario || usuario.rol !== 'admin') {
    return null;
  }

  return children;
}
