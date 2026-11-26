import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DocenteScreen from './src/screens/DocenteScreen';
import AlumnoScreen from './src/screens/AlumnoScreen';

export default function App() {
  const [rol, setRol] = useState(null); // null | 'docente' | 'alumno'
  const [serverUrl, setServerUrl] = useState('http://192.168.1.10:3000');

  if (rol === 'docente') {
    return <DocenteScreen serverUrl={serverUrl.trim()} onVolver={() => setRol(null)} />;
  }

  if (rol === 'alumno') {
    return <AlumnoScreen serverUrl={serverUrl.trim()} onVolver={() => setRol(null)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>ASISTENCIA QR EN VIVO</Text>
      <Text style={styles.titulo}>Control de Asistencia</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Dirección del servidor (ver terminal)</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="http://192.168.X.X:3000"
        />
      </View>

      <TouchableOpacity style={styles.btnDocente} onPress={() => setRol('docente')}>
        <Text style={styles.btnTexto}>Entrar como Docente (Generar QR)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnAlumno} onPress={() => setRol('alumno')}>
        <Text style={styles.btnTexto}>Entrar como Alumno (Escanear QR)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f7fc', padding: 24, justifyContent: 'center' },
  badge: { alignSelf: 'center', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '800', fontSize: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  titulo: { fontSize: 28, fontWeight: '900', color: '#0f2740', textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 15 },
  btnDocente: { backgroundColor: '#0d63a5', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnAlumno: { backgroundColor: '#14b8a6', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: '800', fontSize: 16 },
});