// Pantalla de explicación propia ANTES del diálogo del sistema.
// Cubre los tres caminos: concedido, denegado (se puede reintentar) y rechazo definitivo (Ajustes).
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import usePermisoCamara from '../hooks/usePermisoCamara';
import { estilos } from '../theme';

export default function PermisoScreen({ navigation, route }) {
  const { nombre, rut } = route.params;
  const { estado, rechazadoRecien, error, solicitar, abrirAjustes } = usePermisoCamara();
  const inicioRef = useRef(null);

  // Si el permiso queda concedido (al tocar Permitir, o al volver desde Ajustes), se pasa a la cámara.
  useEffect(() => {
    if (estado === 'concedido') {
      navigation.replace('Escaner', { nombre, rut, inicio: inicioRef.current ?? Date.now() });
    }
  }, [estado, navigation, nombre, rut]);

  const continuar = async () => {
    inicioRef.current = Date.now(); // punto de partida de la medición de carga de cámara
    await solicitar();
  };

  const usarCodigo = () => navigation.goBack();

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
            Si quieres escanear, actívala en Ajustes → Expo Go → Cámara. Cuando vuelvas, la app lo detecta sola.
          </Text>
        </View>
        <TouchableOpacity style={estilos.boton} onPress={abrirAjustes}>
          <Text style={estilos.botonTexto}>Abrir ajustes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[estilos.boton, estilos.botonSecundario]} onPress={usarCodigo}>
          <Text style={estilos.botonTexto}>Escribir el código a mano</Text>
        </TouchableOpacity>
        {error && <Text style={estilos.error}>{error}</Text>}
      </ScrollView>
    );
  }

  // estado === 'sin_preguntar'
  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.titulo}>{rechazadoRecien ? 'Sin cámara igual puedes marcar' : 'Necesitamos la cámara'}</Text>
      <View style={estilos.card}>
        {rechazadoRecien ? (
          <Text style={estilos.texto}>
            No diste acceso a la cámara. Puedes marcar asistencia escribiendo el código que aparece bajo el QR, o
            intentarlo de nuevo.
          </Text>
        ) : (
          <>
            <Text style={estilos.texto}>
              Usamos la cámara solo para leer el código QR que muestra tu profesor y registrar tu asistencia.
            </Text>
            <Text style={[estilos.texto, { marginTop: 8 }]}>
              • No tomamos fotos ni grabamos video.{'\n'}• La imagen no sale de tu teléfono.{'\n'}• Si prefieres no dar
              acceso, puedes escribir el código a mano.
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity style={estilos.boton} onPress={continuar}>
        <Text style={estilos.botonTexto}>{rechazadoRecien ? 'Intentar de nuevo' : 'Continuar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={usarCodigo}>
        <Text style={estilos.botonBordeTexto}>Prefiero escribir el código</Text>
      </TouchableOpacity>
      {error && <Text style={estilos.error}>{error}</Text>}
    </ScrollView>
  );
}
