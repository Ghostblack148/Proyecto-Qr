// Estado compartido entre pantallas: las mediciones de tiempo.
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Cada medición: { tipo: 'camara' | 'escaneo' | 'manual', ms, fecha }
  const [mediciones, setMediciones] = useState([]);

  const agregarMedicion = useCallback((tipo, ms) => {
    setMediciones((prev) => [...prev, { tipo, ms: Math.round(ms), fecha: new Date().toISOString() }]);
  }, []);

  const borrarMediciones = useCallback(() => setMediciones([]), []);

  const valor = useMemo(
    () => ({ mediciones, agregarMedicion, borrarMediciones }),
    [mediciones, agregarMedicion, borrarMediciones]
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
