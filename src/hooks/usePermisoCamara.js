// Hook del permiso de cámara. Traduce la respuesta del sistema a cuatro estados claros:
//   'cargando'      -> todavía no sabemos
//   'sin_preguntar' -> nunca se ha pedido (o se puede volver a pedir)
//   'concedido'     -> se puede usar la cámara
//   'bloqueado'     -> rechazo definitivo: el sistema ya no muestra el diálogo, solo queda Ajustes
// En iPhone el primer "No permitir" ya es definitivo. En Android lo es después de dos rechazos
// o si se marca "No volver a preguntar".
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as Linking from 'expo-linking';

function traducir(permiso) {
  if (!permiso) return 'cargando';
  if (permiso.granted) return 'concedido';
  if (permiso.canAskAgain) return 'sin_preguntar';
  return 'bloqueado';
}

export default function usePermisoCamara() {
  const [permiso, solicitarSistema, consultar] = useCameraPermissions();
  const [rechazadoRecien, setRechazadoRecien] = useState(false);
  const [error, setError] = useState(null);

  // Al volver desde Ajustes, se vuelve a consultar: el usuario pudo haber cambiado el permiso.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        consultar().catch(() => {});
      }
    });
    return () => sub.remove();
  }, [consultar]);

  const solicitar = useCallback(async () => {
    setError(null);
    try {
      const respuesta = await solicitarSistema();
      setRechazadoRecien(!respuesta.granted);
      return respuesta.granted;
    } catch (e) {
      setError('No se pudo solicitar el permiso de cámara.');
      return false;
    }
  }, [solicitarSistema]);

  const abrirAjustes = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch (e) {
      setError('No se pudieron abrir los Ajustes. Ábrelos manualmente y busca Expo Go → Cámara.');
    }
  }, []);

  return {
    estado: traducir(permiso),
    rechazadoRecien, // true si el usuario acaba de tocar "No permitir"
    error,
    solicitar,
    abrirAjustes,
  };
}
