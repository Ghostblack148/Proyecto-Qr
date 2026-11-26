import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Share
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const TIEMPOS = [1, 3, 5, 10];

export default function DocenteScreen({ serverUrl, onVolver }) {
  const [curso, setCurso] = useState('Taller de Aplicaciones Móviles');
  const [minutos, setMinutos] = useState(3);
  const [sesion, setSesion] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const [asistentes, setAsistentes] = useState([]);
  const [cargando, setCargando] = useState(false);

  const crearSesion = async () => {
    if (!curso.trim()) {
      return Alert.alert('Falta el curso', 'Escribe el nombre de la asignatura o sesión.');
    }
    setCargando(true);
    try {
      const res = await fetch(`${serverUrl}/api/sesiones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curso, duracionMinutos: minutos }),
      });
      const data = await res.json();
      setSesion(data);
      setAsistentes([]);
      setSegundos(minutos * 60);
    } catch (e) {
      Alert.alert('Sin conexión', `No se pudo conectar a ${serverUrl}. Verifica que el servidor esté encendido.`);
    } finally {
      setCargando(false);
    }
  };

  // Actualiza cuenta regresiva y consulta asistentes en vivo cada 2 segundos
  useEffect(() => {
    if (!sesion) return;

    const timerSegundos = setInterval(() => {
      setSegundos((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const pollingAsistentes = setInterval(async () => {
      try {
        const res = await fetch(`${serverUrl}/api/sesiones/${sesion.id}`);
        if (res.ok) {
          const data = await res.json();
          setAsistentes(data.asistentes || []);
          setSegundos(data.segundosRestantes);
        }
      } catch (_) {}
    }, 2000);

    return () => {
      clearInterval(timerSegundos);
      clearInterval(pollingAsistentes);
    };
  }, [sesion, serverUrl]);

  const exportarRegistro = async () => {
    if (!sesion) return;
    const fecha = new Date(sesion.creadoEn).toLocaleDateString('es-CL');
    const filas = [
      'Curso,Fecha,Nombre,RUT,Hora',
      ...asistentes.map((a) => `"${sesion.curso}",${fecha},"${a.nombre}",${a.rut},${a.hora}`),
    ];
    const csv = filas.join('\n');

    try {
      await Share.share({
        title: `Asistencia_${sesion.curso}.csv`,
        message: csv,
      });
    } catch (e) {
      Alert.alert('Error al exportar', e.message);
    }
  };

  const formatearTiempo = (seg) => {
    const m = String(Math.floor(seg / 60)).padStart(2, '0');
    const s = String(seg % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Panel Docente</Text>

      {!sesion ? (
        <View style={styles.card}>
          <Text style={styles.label}>Nombre de la clase o sesión</Text>
          <TextInput
            style={styles.input}
            value={curso}
            onChangeText={setCurso}
            placeholder="Ej. Ingeniería de Software"
          />

          <Text style={styles.label}>Ventana de tiempo (minutos)</Text>
          <View style={styles.filaTiempos}>
            {TIEMPOS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, minutos === t && styles.chipActivo]}
                onPress={() => setMinutos(t)}
              >
                <Text style={[styles.chipTexto, minutos === t && styles.chipTextoActivo]}>
                  {t} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.btnPrimario} onPress={crearSesion} disabled={cargando}>
            <Text style={styles.btnTexto}>{cargando ? 'Generando...' : 'Generar código QR'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.qrCard}>
            <Text style={styles.cursoTitulo}>{sesion.curso}</Text>
            <Text style={[styles.badge, segundos > 0 ? styles.badgeActiva : styles.badgeExpirada]}>
              {segundos > 0 ? `ACTIVA • ${formatearTiempo(segundos)}` : 'VENTANA EXPIRADA (00:00)'}
            </Text>

            <View style={styles.qrWrapper}>
              <QRCode value={`ASISTENCIA|${sesion.id}`} size={200} />
            </View>
            <Text style={styles.idTexto}>ID Sesión: {sesion.id}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.listaHeader}>
              <Text style={styles.subtitulo}>Asistentes en vivo ({asistentes.length})</Text>
              <TouchableOpacity style={styles.btnExportar} onPress={exportarRegistro}>
                <Text style={styles.btnExportarTexto}>Exportar CSV</Text>
              </TouchableOpacity>
            </View>

            {asistentes.length === 0 ? (
              <Text style={styles.vacio}>Esperando que los alumnos escaneen el QR...</Text>
            ) : (
              asistentes.map((item, idx) => (
                <View key={item.rut} style={styles.filaAsistente}>
                  <Text style={styles.asistenteNombre}>{idx + 1}. {item.nombre}</Text>
                  <Text style={styles.asistenteMeta}>{item.rut} • {item.hora}</Text>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity style={styles.btnSecundario} onPress={() => setSesion(null)}>
            <Text style={styles.btnSecundarioTexto}>Nueva sesión</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.btnVolver} onPress={onVolver}>
        <Text style={styles.btnVolverTexto}>Cambiar rol / Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f2f7fc', padding: 20, paddingTop: 48 },
  titulo: { fontSize: 24, fontWeight: '900', color: '#0f2740', textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16 },
  qrCard: { backgroundColor: '#fff', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 16 },
  cursoTitulo: { fontSize: 18, fontWeight: '800', color: '#0f2740', marginBottom: 8, textAlign: 'center' },
  badge: { fontSize: 13, fontWeight: '800', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 16, overflow: 'hidden' },
  badgeActiva: { backgroundColor: '#dcfce7', color: '#15803d' },
  badgeExpirada: { backgroundColor: '#ffe4e6', color: '#be123c' },
  qrWrapper: { padding: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  idTexto: { fontSize: 12, color: '#64748b', marginTop: 10 },
  label: { fontSize: 14, fontWeight: '700', color: '#1e3a5f', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 14 },
  filaTiempos: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  chip: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#cbd5e1', alignItems: 'center' },
  chipActivo: { backgroundColor: '#0d63a5', borderColor: '#0d63a5' },
  chipTexto: { fontWeight: '700', color: '#334155' },
  chipTextoActivo: { color: '#fff' },
  btnPrimario: { backgroundColor: '#0d63a5', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: '800', fontSize: 15 },
  listaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subtitulo: { fontSize: 16, fontWeight: '800', color: '#0f2740' },
  btnExportar: { backgroundColor: '#14b8a6', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  btnExportarTexto: { color: '#fff', fontWeight: '700', fontSize: 13 },
  vacio: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
  filaAsistente: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingVertical: 8 },
  asistenteNombre: { fontSize: 15, fontWeight: '700', color: '#0f2740' },
  asistenteMeta: { fontSize: 12, color: '#64748b' },
  btnSecundario: { borderWidth: 1.5, borderColor: '#0d63a5', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnSecundarioTexto: { color: '#0d63a5', fontWeight: '700' },
  btnVolver: { padding: 12, alignItems: 'center' },
  btnVolverTexto: { color: '#64748b', fontWeight: '600' },
});