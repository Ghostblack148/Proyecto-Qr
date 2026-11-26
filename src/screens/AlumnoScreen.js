import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function AlumnoScreen({ serverUrl, onVolver }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [escaneando, setEscaneando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const bloqueo = useRef(false);

  const iniciarEscaneo = async () => {
    if (!nombre.trim() || !rut.trim()) {
      return setResultado({ estado: 'ERROR', mensaje: 'Ingresa tu nombre y RUT antes de escanear.' });
    }
    if (!permission?.granted) {
      const resp = await requestPermission();
      if (!resp.granted) {
        return setResultado({ estado: 'ERROR', mensaje: 'Se requiere permiso de cámara para marcar asistencia.' });
      }
    }
    setResultado(null);
    bloqueo.current = false;
    setEscaneando(true);
  };

  const manejarEscaneo = async ({ data }) => {
    if (bloqueo.current || !data) return;
    bloqueo.current = true;
    setEscaneando(false);
    setProcesando(true);

    try {
      if (!data.startsWith('ASISTENCIA|')) {
        setResultado({ estado: 'INVALIDO', mensaje: 'Este QR no pertenece al sistema de asistencia.' });
        return;
      }

      const sesionId = data.split('|')[1];
      const res = await fetch(`${serverUrl}/api/asistencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesionId, nombre, rut }),
      });
      const json = await res.json();
      setResultado(json);
    } catch (e) {
      setResultado({ estado: 'ERROR', mensaje: `No se pudo conectar con ${serverUrl}` });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Marcar Asistencia</Text>

      {escaneando ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={manejarEscaneo}
          />
          <View style={styles.visor} />
          <TouchableOpacity style={styles.btnCancelar} onPress={() => setEscaneando(false)}>
            <Text style={styles.btnTexto}>Cancelar cámara</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Esteban Pérez"
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>RUT</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 20.123.456-7"
            value={rut}
            onChangeText={setRut}
            autoCapitalize="characters"
          />

          <TouchableOpacity style={styles.btnPrimario} onPress={iniciarEscaneo}>
            <Text style={styles.btnTexto}>Escanear QR del docente</Text>
          </TouchableOpacity>
        </View>
      )}

      {procesando && <ActivityIndicator size="large" color="#0d63a5" style={{ marginTop: 16 }} />}

      {resultado && (
        <View style={[styles.resCard, styles[resultado.estado] || styles.ERROR]}>
          <Text style={styles.resEstado}>{resultado.estado}</Text>
          <Text style={styles.resMensaje}>{resultado.mensaje}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.btnVolver} onPress={onVolver}>
        <Text style={styles.btnVolverTexto}>Cambiar rol / Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f7fc', padding: 20, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: '900', color: '#0f2740', textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18 },
  label: { fontSize: 14, fontWeight: '700', color: '#1e3a5f', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 14 },
  btnPrimario: { backgroundColor: '#0d63a5', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cameraContainer: { height: 360, borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  visor: { width: 210, height: 210, borderWidth: 3, borderColor: '#14b8a6', borderRadius: 12 },
  btnCancelar: { position: 'absolute', bottom: 16, backgroundColor: 'rgba(15, 39, 64, 0.85)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  resCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderLeftWidth: 6, marginTop: 16 },
  REGISTRADO: { borderLeftColor: '#16a34a' },
  DUPLICADO: { borderLeftColor: '#f59e0b' },
  EXPIRADO: { borderLeftColor: '#e11d48' },
  INVALIDO: { borderLeftColor: '#e11d48' },
  ERROR: { borderLeftColor: '#7c3aed' },
  resEstado: { fontSize: 16, fontWeight: '900', color: '#0f2740' },
  resMensaje: { fontSize: 14, color: '#334155', marginTop: 4 },
  btnVolver: { marginTop: 20, padding: 12, alignItems: 'center' },
  btnVolverTexto: { color: '#64748b', fontWeight: '600' },
});