import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { estilos } from '../theme';

const TIPOS = [
  { clave: 'camara', titulo: 'Carga de la cámara', detalle: 'Desde "Continuar" o "Escanear" hasta onCameraReady' },
  { clave: 'registro', titulo: 'Registro de asistencia', detalle: 'Desde que se lee el QR hasta la respuesta del servidor' },
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

export default function MedicionesScreen() {
  const { mediciones, borrarMediciones } = useApp();

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      {TIPOS.map(({ clave, titulo, detalle }) => {
        const valores = mediciones.filter((m) => m.tipo === clave).map((m) => m.ms);
        const r = resumen(valores);
        return (
          <View key={clave} style={estilos.card}>
            <Text style={[estilos.texto, { fontWeight: '800' }]}>{titulo}</Text>
            <Text style={estilos.nota}>{detalle}</Text>
            {r ? (
              <>
                <Text style={[estilos.texto, { marginTop: 8 }]}>
                  {r.n} repeticiones · promedio {r.promedio} ms · mín {r.minimo} ms · máx {r.maximo} ms
                </Text>
                <Text style={estilos.nota}>{valores.map((v, i) => `#${i + 1}: ${v} ms`).join('   ')}</Text>
              </>
            ) : (
              <Text style={[estilos.nota, { marginTop: 8 }]}>Sin mediciones todavía.</Text>
            )}
          </View>
        );
      })}
      <Text style={estilos.nota}>
        Las mediciones se borran al cerrar la app. Anótalas en la planilla antes de salir.
      </Text>
      <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={borrarMediciones}>
        <Text style={estilos.botonBordeTexto}>Borrar mediciones</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
