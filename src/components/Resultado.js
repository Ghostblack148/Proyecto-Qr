import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estiloEstado } from '../theme';

export default function Resultado({ resultado, ms }) {
  if (!resultado) return null;
  const e = estiloEstado[resultado.estado] || estiloEstado.ERROR;
  return (
    <View style={[s.caja, { backgroundColor: e.fondo, borderColor: e.color }]}>
      <Ionicons name={e.icono} size={56} color={e.color} />
      <Text style={[s.titulo, { color: e.color }]}>{e.titulo}</Text>
      {resultado.codigo ? <Text style={s.codigo}>{resultado.codigo}</Text> : null}
      <Text style={s.mensaje}>{resultado.mensaje}</Text>
      {ms != null && (
        <View style={s.tiempo}>
          <Ionicons name="time-outline" size={14} color={colores.suave} />
          <Text style={s.tiempoTexto}>{ms} ms</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  caja: { borderRadius: 20, borderWidth: 2, padding: 20, alignItems: 'center', marginTop: 16 },
  titulo: { fontSize: 24, fontWeight: '900', marginTop: 6 },
  codigo: { fontSize: 16, fontWeight: '700', color: colores.texto, letterSpacing: 1.5, marginTop: 4 },
  mensaje: { fontSize: 15, color: colores.texto, marginTop: 8, textAlign: 'center' },
  tiempo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  tiempoTexto: { fontSize: 13, color: colores.suave, fontWeight: '600' },
});
