import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colores, estilos } from '../theme';

const TIPOS = [
  {
    clave: 'escaneo',
    titulo: 'Validar escaneando',
    detalle: 'Desde que la cámara está lista hasta ver el resultado',
    icono: 'qr-code-outline',
    color: colores.azul,
  },
  {
    clave: 'manual',
    titulo: 'Validar digitando',
    detalle: 'Desde la primera tecla hasta ver el resultado',
    icono: 'keypad-outline',
    color: colores.verdeOscuro,
  },
  {
    clave: 'camara',
    titulo: 'Carga de la cámara',
    detalle: 'Desde "Escanear entrada" o "Continuar" hasta onCameraReady',
    icono: 'speedometer-outline',
    color: colores.azulOscuro,
  },
];

// Estado derivado: los promedios se calculan, no se guardan
function resumen(valores) {
  if (valores.length === 0) return null;
  const total = valores.reduce((a, b) => a + b, 0);
  return {
    n: valores.length,
    promedio: Math.round(total / valores.length),
    minimo: Math.min(...valores),
    maximo: Math.max(...valores),
  };
}

function Dato({ etiqueta, valor }) {
  return (
    <View style={s.dato}>
      <Text style={s.datoValor}>{valor}</Text>
      <Text style={s.datoEtiqueta}>{etiqueta}</Text>
    </View>
  );
}

export default function MedicionesScreen() {
  const { mediciones, borrarMediciones } = useApp();

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      {TIPOS.map(({ clave, titulo, detalle, icono, color }) => {
        const valores = mediciones.filter((m) => m.tipo === clave).map((m) => m.ms);
        const r = resumen(valores);
        return (
          <View key={clave} style={estilos.card}>
            <View style={s.cabecera}>
              <View style={[s.icono, { backgroundColor: color }]}>
                <Ionicons name={icono} size={22} color={colores.blanco} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.titulo}>{titulo}</Text>
                <Text style={s.detalle}>{detalle}</Text>
              </View>
              <Text style={[s.contador, { color }]}>{r ? r.n : 0}</Text>
            </View>
            {r ? (
              <>
                <View style={s.datos}>
                  <Dato etiqueta="Promedio" valor={`${r.promedio} ms`} />
                  <Dato etiqueta="Mínimo" valor={`${r.minimo} ms`} />
                  <Dato etiqueta="Máximo" valor={`${r.maximo} ms`} />
                </View>
                <Text style={estilos.nota}>{valores.map((v, i) => `#${i + 1}: ${v}`).join('  ·  ')}</Text>
              </>
            ) : (
              <Text style={[estilos.nota, { marginTop: 12 }]}>Sin mediciones todavía.</Text>
            )}
          </View>
        );
      })}
      <Text style={[estilos.nota, { textAlign: 'center' }]}>
        Las mediciones se borran al cerrar la app. Anótalas en la planilla antes de salir.
      </Text>
      <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={borrarMediciones}>
        <Ionicons name="trash-outline" size={20} color={colores.azul} />
        <Text style={estilos.botonBordeTexto}>Borrar mediciones</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icono: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 16, fontWeight: '800', color: colores.texto },
  detalle: { fontSize: 12, color: colores.suave, marginTop: 2 },
  contador: { fontSize: 28, fontWeight: '900' },
  datos: { flexDirection: 'row', gap: 8, marginTop: 14 },
  dato: { flex: 1, backgroundColor: colores.fondo, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  datoValor: { fontSize: 16, fontWeight: '900', color: colores.texto },
  datoEtiqueta: { fontSize: 11, color: colores.suave, fontWeight: '600', marginTop: 2 },
});
