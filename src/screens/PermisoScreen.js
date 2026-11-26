// Pantalla de explicación propia ANTES del diálogo del sistema.
// Cubre los tres caminos: concedido, denegado (se puede reintentar) y rechazo definitivo (Ajustes).
// En todos los casos la app sigue siendo útil: se puede validar escribiendo el código.
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import usePermisoCamara from '../hooks/usePermisoCamara';
import { estilos } from '../theme';

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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (estado === 'bloqueado') {
    return (
      <ScrollView contentContainerStyle={estilos.pantalla}>
        <Text style={estilos.titulo}>La cámara está desactivada</Text>
        <View style={estilos.card}>
          <Text style={estilos.texto}>
            Rechazaste el acceso a la cámara y el teléfono ya no deja volver a preguntarlo desde la app.
          </Text>
          <Text style={[estilos.texto, { marginTop: 8 }]}>
            Puedes seguir validando entradas escribiendo el código. Si quieres escanear, actívala en Ajustes → Expo Go →
            Cámara; al volver, la app lo detecta sola.
          </Text>
        </View>
        <TouchableOpacity style={estilos.boton} onPress={modoManual}>
          <Text style={estilos.botonTexto}>Validar escribiendo el código</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={abrirAjustes}>
          <Text style={estilos.botonBordeTexto}>Abrir ajustes</Text>
        </TouchableOpacity>
        {error && <Text style={estilos.error}>{error}</Text>}
      </ScrollView>
    );
  }

  // estado === 'sin_preguntar'
  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.titulo}>{rechazadoRecien ? 'Sin cámara igual puedes validar' : 'Necesitamos la cámara'}</Text>
      <View style={estilos.card}>
        {rechazadoRecien ? (
          <Text style={estilos.texto}>
            No diste acceso a la cámara. Puedes validar las entradas escribiendo el código impreso bajo el QR, o
            intentarlo de nuevo.
          </Text>
        ) : (
          <>
            <Text style={estilos.texto}>
              Usamos la cámara solo para leer el código QR de cada entrada en el acceso a la Feria.
            </Text>
            <Text style={[estilos.texto, { marginTop: 8 }]}>
              • No tomamos fotos ni grabamos video.{'\n'}• La imagen no sale de tu teléfono.{'\n'}• No se guardan datos de
              las personas, solo si la entrada ya se usó.{'\n'}• Sin cámara puedes escribir el código a mano.
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity style={estilos.boton} onPress={continuar}>
        <Text style={estilos.botonTexto}>{rechazadoRecien ? 'Intentar de nuevo' : 'Continuar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={modoManual}>
        <Text style={estilos.botonBordeTexto}>Prefiero escribir el código</Text>
      </TouchableOpacity>
      {error && <Text style={estilos.error}>{error}</Text>}
    </ScrollView>
  );
}
