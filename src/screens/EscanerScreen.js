import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useApp } from '../context/AppContext';
import usePermisoCamara from '../hooks/usePermisoCamara';
import { leerCodigo, marcarAsistencia } from '../services/asistenciaService';
import { estilos } from '../theme';

export default function EscanerScreen({ navigation, route }) {
  const { nombre, rut, inicio } = route.params;
  const { serverUrl, agregarMedicion } = useApp();
  const { estado: permiso } = usePermisoCamara();
  const [procesando, setProcesando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [errorCamara, setErrorCamara] = useState(null);
  const bloqueo = useRef(false); // anti-rebote: la cámara dispara muchas lecturas por segundo
  const medidaCamara = useRef(false);

  // Medición 1: desde "Continuar" (o desde el botón Escanear) hasta que la cámara está lista
  const alEstarLista = () => {
    if (medidaCamara.current || !inicio) return;
    medidaCamara.current = true;
    agregarMedicion('camara', Date.now() - inicio);
  };

  const volverConResultado = (resultado) => {
    navigation.popTo('Alumno', { resultado: { ...resultado, id: Date.now() } });
  };

  const alLeer = async ({ data }) => {
    if (bloqueo.current || !data) return;
    bloqueo.current = true;

    const leido = leerCodigo(data);
    if (!leido) {
      setAviso('Ese QR no es de asistencia. Apunta al código del docente.');
      setTimeout(() => {
        setAviso(null);
        bloqueo.current = false;
      }, 1500);
      return;
    }

    // Medición 2: desde que se lee el QR hasta que el servidor confirma
    const t0 = Date.now();
    setProcesando(true);
    try {
      const respuesta = await marcarAsistencia(serverUrl, { ...leido, nombre, rut });
      const ms = Date.now() - t0;
      agregarMedicion('registro', ms);
      volverConResultado({ estado: respuesta.estado, mensaje: respuesta.mensaje, ms });
    } catch (e) {
      volverConResultado({ estado: e.estado || 'ERROR', mensaje: e.message });
    }
  };

  // El permiso pudo ser revocado desde Ajustes mientras la app estaba abierta
  if (permiso !== 'concedido' && permiso !== 'cargando') {
    return (
      <View style={[estilos.pantalla, { justifyContent: 'center' }]}>
        <Text style={estilos.texto}>Ya no hay permiso de cámara.</Text>
        <TouchableOpacity style={estilos.boton} onPress={() => navigation.replace('Permiso', { nombre, rut })}>
          <Text style={estilos.botonTexto}>Revisar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (errorCamara) {
    return (
      <View style={[estilos.pantalla, { justifyContent: 'center' }]}>
        <Text style={estilos.texto}>No se pudo abrir la cámara: {errorCamara}</Text>
        <TouchableOpacity style={estilos.boton} onPress={() => navigation.goBack()}>
          <Text style={estilos.botonTexto}>Escribir el código a mano</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.contenedor}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={procesando ? undefined : alLeer}
        onCameraReady={alEstarLista}
        onMountError={(e) => setErrorCamara(e.message)}
      />
      <View style={s.visor} />
      {aviso && (
        <View style={s.aviso}>
          <Text style={s.avisoTexto}>{aviso}</Text>
        </View>
      )}
      {procesando && (
        <View style={s.capa}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.capaTexto}>Registrando asistencia…</Text>
        </View>
      )}
      <TouchableOpacity style={s.cancelar} onPress={() => navigation.goBack()}>
        <Text style={estilos.botonTexto}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  visor: { width: '65%', aspectRatio: 1, borderWidth: 3, borderColor: '#5eead4', borderRadius: 20 },
  aviso: { position: 'absolute', top: 40, left: 20, right: 20, backgroundColor: '#fef3c7', padding: 12, borderRadius: 10 },
  avisoTexto: { color: '#92400e', fontWeight: '700', textAlign: 'center' },
  capa: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  capaTexto: { color: '#fff', fontWeight: '700', marginTop: 12, fontSize: 16 },
  cancelar: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minHeight: 48,
  },
});
