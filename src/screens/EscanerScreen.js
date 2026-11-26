import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useApp } from '../context/AppContext';
import usePermisoCamara from '../hooks/usePermisoCamara';
import { validarEntrada } from '../services/validacionService';
import Resultado from '../components/Resultado';
import { estilos } from '../theme';

export default function EscanerScreen({ navigation, route }) {
  const { inicio } = route.params || {};
  const { agregarMedicion } = useApp();
  const { estado: permiso } = usePermisoCamara();
  const [resultado, setResultado] = useState(null);
  const [ms, setMs] = useState(null);
  const [errorCamara, setErrorCamara] = useState(null);
  const bloqueo = useRef(false); // anti-rebote: la cámara entrega muchas lecturas por segundo
  const medidaCamara = useRef(false);
  const listoDesde = useRef(null); // desde cuándo la cámara está lista para la próxima entrada

  // Medición 1: desde "Escanear entrada" / "Continuar" hasta que la cámara está lista
  const alEstarLista = () => {
    listoDesde.current = Date.now();
    if (medidaCamara.current || !inicio) return;
    medidaCamara.current = true;
    agregarMedicion('camara', Date.now() - inicio);
  };

  const alLeer = async ({ data }) => {
    if (bloqueo.current || !data) return;
    bloqueo.current = true;
    const r = await validarEntrada(data);
    // Medición 2: tiempo por entrada escaneando (desde que está lista hasta el resultado)
    const t = listoDesde.current ? Date.now() - listoDesde.current : null;
    if (t != null) agregarMedicion('escaneo', t);
    setMs(t);
    setResultado(r);
  };

  const siguiente = () => {
    setResultado(null);
    setMs(null);
    listoDesde.current = Date.now();
    bloqueo.current = false;
  };

  // El permiso pudo ser revocado desde Ajustes mientras la app estaba abierta
  if (permiso !== 'concedido' && permiso !== 'cargando') {
    return (
      <View style={[estilos.pantalla, { justifyContent: 'center' }]}>
        <Text style={estilos.texto}>Ya no hay permiso de cámara.</Text>
        <TouchableOpacity style={estilos.boton} onPress={() => navigation.replace('Permiso')}>
          <Text style={estilos.botonTexto}>Revisar permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[estilos.boton, estilos.botonSecundario]} onPress={() => navigation.replace('Manual')}>
          <Text style={estilos.botonTexto}>Validar escribiendo el código</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (errorCamara) {
    return (
      <View style={[estilos.pantalla, { justifyContent: 'center' }]}>
        <Text style={estilos.texto}>No se pudo abrir la cámara: {errorCamara}</Text>
        <TouchableOpacity style={estilos.boton} onPress={() => navigation.replace('Manual')}>
          <Text style={estilos.botonTexto}>Validar escribiendo el código</Text>
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
        onBarcodeScanned={resultado ? undefined : alLeer}
        onCameraReady={alEstarLista}
        onMountError={(e) => setErrorCamara(e.message)}
      />
      {!resultado && <View style={s.visor} />}
      {!resultado && <Text style={s.ayuda}>Apunta al QR de la entrada</Text>}

      {resultado && (
        <View style={s.panel}>
          <Resultado resultado={resultado} ms={ms} />
          <TouchableOpacity style={estilos.boton} onPress={siguiente}>
            <Text style={estilos.botonTexto}>Escanear siguiente</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={s.cerrar} onPress={() => navigation.goBack()}>
        <Text style={estilos.botonTexto}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  visor: { width: '65%', aspectRatio: 1, borderWidth: 3, borderColor: '#5eead4', borderRadius: 20 },
  ayuda: { color: '#fff', fontWeight: '700', marginTop: 16, fontSize: 16 },
  panel: { position: 'absolute', left: 16, right: 16, bottom: 110, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  cerrar: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
});
