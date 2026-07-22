import { useEffect, useState } from 'react';

export function useDebounce(valor, demoraMs = 300) {
  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {
    const timeoutId = setTimeout(() => setValorDebounced(valor), demoraMs);
    return () => clearTimeout(timeoutId);
  }, [valor, demoraMs]);

  return valorDebounced;
}
