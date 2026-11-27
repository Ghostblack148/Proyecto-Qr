import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import usePermisoCamara from '../hooks/usePermisoCamara';
import { validarEntrada } from '../services/validacionService';
import Resultado from '../components/Resultado';
import { colores, estilos } from '../theme';

function Esquinas() {
  return (
    <View style={s.visor}>
      <View style={[s.esquina, { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 22 }]} />
      <View style={[s.esquina, { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 22 }]} />
      <View style={[s.esquina, { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 22 }]} />
      <View
        style={[s.esquina, { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 22 }]}
      />
    </View>
  );
}

export default function EscanerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
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
        <Text style={[estilos.titulo, { textAlign: 'center' }]}>Ya no hay permiso de cámara</Text>
        <TouchableOpacity style={estilos.boton} onPress={() => navigation.replace('Permiso')}>
          <Text style={estilos.botonTexto}>Revisar permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[estilos.boton, estilos.botonVerde]} onPress={() => navigation.replace('Manual')}>
          <Text style={estilos.botonTexto}>Validar escribiendo el código</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (errorCamara) {
    return (
      <View style={[estilos.pantalla, { justifyContent: 'center' }]}>
        <Text style={estilos.texto}>No se pudo abrir la cámara: {errorCamara}</Text>
        <TouchableOpacity style={[estilos.boton, estilos.botonVerde]} onPress={() => navigation.replace('Manual')}>
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

      <View style={[s.barra, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={s.barraEvento}>FERIA TECNOLÓGICA UTEM</Text>
          <Text style={s.barraTitulo}>Escanear entrada</Text>
        </View>
        <TouchableOpacity style={s.cerrar} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={colores.blanco} />
        </TouchableOpacity>
      </View>

      {!resultado && (
        <>
          <Esquinas />
          <View style={s.ayuda}>
            <Ionicons name="qr-code-outline" size={18} color={colores.blanco} />
            <Text style={s.ayudaTexto}>Centra el QR de la entrada</Text>
          </View>
        </>
      )}

      {resultado && (
        <View style={[s.panel, { paddingBottom: insets.bottom + 16 }]}>
          <Resultado resultado={resultado} ms={ms} />
          <TouchableOpacity style={estilos.boton} onPress={siguiente}>
            <Ionicons name="scan-outline" size={20} color={colores.blanco} />
            <Text style={estilos.botonTexto}>Escanear siguiente</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  barra: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: 'rgba(11,30,74,0.75)',
  },
  barraEvento: { color: colores.verde, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  barraTitulo: { color: colores.blanco, fontSize: 20, fontWeight: '900' },
  cerrar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visor: { width: '68%', aspectRatio: 1 },
  esquina: { position: 'absolute', width: 52, height: 52, borderColor: colores.verde },
  ayuda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    backgroundColor: 'rgba(11,30,74,0.75)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  ayudaTexto: { color: colores.blanco, fontWeight: '700', fontSize: 15 },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colores.blanco,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
});
