import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useApp } from '../context/AppContext';
import { crearSesion, obtenerSesion } from '../services/asistenciaService';
import { colores, estilos } from '../theme';

const TIEMPOS = [1, 3, 5, 10];
const INTERVALO_CONSULTA_MS = 2000;

function formatearTiempo(seg) {
  const m = String(Math.floor(seg / 60)).padStart(2, '0');
  const s = String(seg % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function celdaCsv(valor) {
  return `"${String(valor).replace(/"/g, '""')}"`;
}

export default function DocenteScreen() {
  const { serverUrl } = useApp();
  const [curso, setCurso] = useState('Taller de Aplicaciones Móviles');
  const [minutos, setMinutos] = useState(3);

  // Cuatro estados de carga: 'inicial' | 'cargando' | 'error' | 'listo'
  const [estado, setEstado] = useState('inicial');
  const [mensajeError, setMensajeError] = useState('');
  const [sesion, setSesion] = useState(null);
  const [conexionCaida, setConexionCaida] = useState(false);
  const claveRef = useRef(null);

  const iniciar = async () => {
    if (!curso.trim()) {
      setMensajeError('Escribe el nombre de la clase.');
      return setEstado('error');
    }
    setEstado('cargando');
    try {
      const data = await crearSesion(serverUrl, curso.trim(), minutos);
      claveRef.current = data.claveDocente;
      setSesion(data);
      setConexionCaida(false);
      setEstado('listo');
    } catch (e) {
      setMensajeError(e.message);
      setEstado('error');
    }
  };

  // Consulta la lista en vivo y el QR vigente. Se detiene sola al salir de la pantalla
  // o cuando la sesión termina.
  const sesionId = sesion?.id;
  const sesionActiva = sesion?.activa;
  useEffect(() => {
    if (!sesionId || !sesionActiva) return undefined;
    let cancelado = false;

    const consultar = async () => {
      try {
        const data = await obtenerSesion(serverUrl, sesionId, claveRef.current);
        if (!cancelado) {
          setSesion(data);
          setConexionCaida(false);
        }
      } catch (e) {
        if (!cancelado) setConexionCaida(true); // se avisa en pantalla, no se traga el error
      }
    };

    const intervalo = setInterval(consultar, INTERVALO_CONSULTA_MS);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [sesionId, sesionActiva, serverUrl]);

  const exportar = async () => {
    if (!sesion) return;
    const fecha = new Date(sesion.creadoEn).toLocaleDateString('es-CL');
    const filas = [
      'Curso,Fecha,Nombre,RUT,Hora',
      ...sesion.asistentes.map((a) => [sesion.curso, fecha, a.nombre, a.rut, a.hora].map(celdaCsv).join(',')),
    ];
    try {
      await Share.share({ title: `Asistencia ${sesion.curso}.csv`, message: filas.join('\n') });
    } catch (e) {
      Alert.alert('No se pudo exportar', e.message);
    }
  };

  const nuevaSesion = () => {
    setSesion(null);
    claveRef.current = null;
    setEstado('inicial');
  };

  if (estado === 'listo' && sesion) {
    return (
      <ScrollView contentContainerStyle={estilos.pantalla}>
        {conexionCaida && (
          <View style={s.aviso}>
            <Text style={s.avisoTexto}>Sin conexión con el servidor. Reintentando… La lista puede estar desactualizada.</Text>
          </View>
        )}

        <View style={[estilos.card, { alignItems: 'center' }]}>
          <Text style={s.curso}>{sesion.curso}</Text>
          {sesion.activa ? (
            <>
              <QRCode value={sesion.qr} size={220} />
              <Text style={s.codigo}>{sesion.codigo}</Text>
              <Text style={estilos.nota}>Código para escribir a mano si el alumno no tiene cámara</Text>
              <Text style={s.cambio}>El código cambia en {sesion.segundosHastaCambio} s</Text>
              <Text style={s.reloj}>Cierra en {formatearTiempo(sesion.segundosRestantes)}</Text>
            </>
          ) : (
            <Text style={[s.reloj, { color: colores.rojo }]}>Sesión cerrada</Text>
          )}
        </View>

        <View style={estilos.card}>
          <Text style={s.subtitulo}>Asistentes en vivo ({sesion.asistentes.length})</Text>
          {sesion.asistentes.length === 0 ? (
            <Text style={estilos.nota}>Todavía nadie ha marcado asistencia.</Text>
          ) : (
            sesion.asistentes.map((a) => (
              <View key={a.rut} style={s.fila}>
                <Text style={s.nombre}>{a.nombre}</Text>
                <Text style={estilos.nota}>
                  {a.rut} · {a.hora}
                </Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={[estilos.boton, sesion.asistentes.length === 0 && estilos.botonDeshabilitado]}
          onPress={exportar}
          disabled={sesion.asistentes.length === 0}
        >
          <Text style={estilos.botonTexto}>Exportar registro (CSV)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={nuevaSesion}>
          <Text style={estilos.botonBordeTexto}>Nueva sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <View style={estilos.card}>
        <Text style={estilos.label}>Nombre de la clase</Text>
        <TextInput style={estilos.input} value={curso} onChangeText={setCurso} />

        <Text style={estilos.label}>Ventana para marcar (minutos)</Text>
        <View style={s.chips}>
          {TIEMPOS.map((t) => (
            <TouchableOpacity key={t} style={[s.chip, minutos === t && s.chipActivo]} onPress={() => setMinutos(t)}>
              <Text style={[s.chipTexto, minutos === t && s.chipTextoActivo]}>{t} min</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[estilos.boton, estado === 'cargando' && estilos.botonDeshabilitado]}
          onPress={iniciar}
          disabled={estado === 'cargando'}
        >
          {estado === 'cargando' ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>Generar código QR</Text>}
        </TouchableOpacity>

        {estado === 'error' && <Text style={[estilos.error, { marginTop: 12 }]}>{mensajeError}</Text>}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  curso: { fontSize: 18, fontWeight: '800', color: colores.azulOscuro, marginBottom: 12, textAlign: 'center' },
  codigo: { fontSize: 26, fontWeight: '900', letterSpacing: 3, color: colores.azul, marginTop: 14 },
  cambio: { fontSize: 13, color: colores.ambar, fontWeight: '700', marginTop: 8 },
  reloj: { fontSize: 20, fontWeight: '900', color: colores.azulOscuro, marginTop: 8 },
  subtitulo: { fontSize: 16, fontWeight: '800', color: colores.azulOscuro, marginBottom: 8 },
  fila: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  nombre: { fontSize: 15, fontWeight: '700', color: colores.texto },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: colores.borde, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  chipActivo: { backgroundColor: colores.azul, borderColor: colores.azul },
  chipTexto: { color: colores.texto, fontWeight: '700' },
  chipTextoActivo: { color: '#fff' },
  aviso: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 10, marginBottom: 12 },
  avisoTexto: { color: '#92400e', fontWeight: '700' },
});
