// Estado compartido entre pantallas: dirección del servidor y mediciones.
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [serverUrl, setServerUrl] = useState('http://192.168.1.10:3000');
  // Cada medición: { tipo: 'camara' | 'registro', ms, fecha }
  const [mediciones, setMediciones] = useState([]);

  const agregarMedicion = useCallback((tipo, ms) => {
    // Inmutable: se crea un arreglo nuevo en vez de modificar el anterior
    setMediciones((prev) => [...prev, { tipo, ms: Math.round(ms), fecha: new Date().toISOString() }]);
  }, []);

  const borrarMediciones = useCallback(() => setMediciones([]), []);

  const valor = useMemo(
    () => ({
      serverUrl: serverUrl.trim().replace(/\/+$/, ''),
      setServerUrl,
      mediciones,
      agregarMedicion,
      borrarMediciones,
    }),
    [serverUrl, mediciones, agregarMedicion, borrarMediciones]
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
