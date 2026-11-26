// Pantalla de explicación propia ANTES del diálogo del sistema.
// Cubre los tres caminos: concedido, denegado (se puede reintentar) y rechazo definitivo (Ajustes).
// En todos los casos la app sigue siendo útil: se puede validar escribiendo el código.
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import usePermisoCamara from '../hooks/usePermisoCamara';
import { colores, estilos } from '../theme';

function Punto({ icono, texto }) {
  return (
    <View style={s.punto}>
      <View style={s.puntoIcono}>
        <Ionicons name={icono} size={18} color={colores.verdeOscuro} />
      </View>
      <Text style={s.puntoTexto}>{texto}</Text>
    </View>
  );
}

function Cabecera({ icono, color, fondo, titulo, texto }) {
  return (
    <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 20 }}>
      <View style={[s.circulo, { backgroundColor: fondo }]}>
        <Ionicons name={icono} size={48} color={color} />
      </View>
      <Text style={s.titulo}>{titulo}</Text>
      <Text style={s.subtitulo}>{texto}</Text>
    </View>
  );
}

export default function PermisoScreen({ navigation }) {
  const { estado, rechazadoRecien, error, solicitar, abrirAjustes } = usePermisoCamara();
  const inicioRef = useRef(null);

  // Si el permiso queda concedido (al tocar Permitir, o al volver desde Ajustes), se pasa a la cámara.
  useEffect(() => {
    if (estado === 'concedido') {
      navigation.replace('Escaner', { inicio: inicioRef.current ?? Date.now() });
    }
  }, [estado, navigation]);

  const continuar = async () => {
    inicioRef.current = Date.now(); // punto de partida de la medición de carga de cámara
    await solicitar();
  };

  const modoManual = () => navigation.replace('Manual');

  if (estado === 'cargando' || estado === 'concedido') {
    return (
      <View style={[estilos.pantalla, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colores.azul} />
      </View>
    );
  }

  if (estado === 'bloqueado') {
    return (
      <ScrollView contentContainerStyle={estilos.pantalla}>
        <Cabecera
          icono="eye-off-outline"
          color={colores.rojo}
          fondo={colores.rojoClaro}
          titulo="La cámara está desactivada"
          texto="El teléfono ya no permite volver a preguntarlo desde la app."
        />
        <View style={estilos.card}>
          <Punto icono="keypad-outline" texto="Puedes seguir validando entradas escribiendo el código." />
          <Punto
            icono="settings-outline"
            texto="Para escanear, actívala en Ajustes → Expo Go → Cámara. Al volver, la app lo detecta sola."
          />
        </View>
        <TouchableOpacity style={[estilos.boton, estilos.botonVerde]} onPress={modoManual}>
          <Ionicons name="keypad-outline" size={20} color={colores.blanco} />
          <Text style={estilos.botonTexto}>Validar escribiendo el código</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={abrirAjustes}>
          <Ionicons name="settings-outline" size={20} color={colores.azul} />
          <Text style={estilos.botonBordeTexto}>Abrir ajustes</Text>
        </TouchableOpacity>
        {error && <Text style={estilos.error}>{error}</Text>}
      </ScrollView>
    );
  }

  // estado === 'sin_preguntar'
  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      {rechazadoRecien ? (
        <Cabecera
          icono="keypad-outline"
          color={colores.ambar}
          fondo={colores.ambarClaro}
          titulo="Sin cámara igual puedes validar"
          texto="Escribe el código impreso bajo el QR, o vuelve a intentarlo."
        />
      ) : (
        <Cabecera
          icono="camera-outline"
          color={colores.azul}
          fondo={colores.azulClaro}
          titulo="Necesitamos la cámara"
          texto="Solo para leer el código QR de cada entrada en el acceso a la Feria."
        />
      )}

      {!rechazadoRecien && (
        <View style={estilos.card}>
          <Punto icono="camera-reverse-outline" texto="No tomamos fotos ni grabamos video." />
          <Punto icono="shield-checkmark-outline" texto="La imagen no sale de tu teléfono." />
          <Punto icono="people-outline" texto="No se guardan datos de las personas, solo si la entrada ya se usó." />
          <Punto icono="keypad-outline" texto="Sin cámara puedes escribir el código a mano." />
        </View>
      )}

      <TouchableOpacity style={estilos.boton} onPress={continuar}>
        <Ionicons name="camera-outline" size={20} color={colores.blanco} />
        <Text style={estilos.botonTexto}>{rechazadoRecien ? 'Intentar de nuevo' : 'Continuar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={modoManual}>
        <Text style={estilos.botonBordeTexto}>Prefiero escribir el código</Text>
      </TouchableOpacity>
      {error && <Text style={estilos.error}>{error}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  circulo: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: '900', color: colores.texto, marginTop: 16, textAlign: 'center' },
  subtitulo: { fontSize: 15, color: colores.suave, marginTop: 6, textAlign: 'center', paddingHorizontal: 12 },
  punto: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  puntoIcono: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  puntoTexto: { flex: 1, fontSize: 15, color: colores.texto, lineHeight: 21 },
});
