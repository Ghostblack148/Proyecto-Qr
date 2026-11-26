import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import usePermisoCamara from '../hooks/usePermisoCamara';
import { reiniciarEntradas, resumenEntradas } from '../services/validacionService';
import { estilos } from '../theme';

export default function InicioScreen({ navigation }) {
  const { mediciones } = useApp();
  const { estado: permiso } = usePermisoCamara();
  const [resumen, setResumen] = useState(resumenEntradas());

  // Al volver a esta pantalla se actualiza el contador de entradas usadas
  useFocusEffect(useCallback(() => setResumen(resumenEntradas()), []));

  const escanear = () => {
    const inicio = Date.now(); // punto de partida de la medición de carga de cámara
    // Con permiso se va directo a la cámara; sin permiso, primero se explica para qué se pide.
    if (permiso === 'concedido') navigation.navigate('Escaner', { inicio });
    else navigation.navigate('Permiso');
  };

  const reiniciar = () => {
    reiniciarEntradas();
    setResumen(resumenEntradas());
    Alert.alert('Listo', 'Las entradas de prueba volvieron a su estado inicial.');
  };

  return (
    <ScrollView contentContainerStyle={[estilos.pantalla, { justifyContent: 'center' }]}>
      <Text style={estilos.nota}>FERIA TECNOLÓGICA UTEM 2026</Text>
      <Text style={estilos.titulo}>Validador de entradas</Text>

      <View style={estilos.card}>
        <Text style={estilos.texto}>
          Entradas usadas: {resumen.usadas} de {resumen.total}
        </Text>
        <Text style={estilos.nota}>Códigos de prueba: UTEM-2026-001 a UTEM-2026-005 (ficticios, sin datos personales).</Text>
      </View>

      <TouchableOpacity style={estilos.boton} onPress={escanear}>
        <Text style={estilos.botonTexto}>Escanear entrada</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[estilos.boton, estilos.botonSecundario]} onPress={() => navigation.navigate('Manual')}>
        <Text style={estilos.botonTexto}>Ingresar código a mano</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={() => navigation.navigate('Mediciones')}>
        <Text style={estilos.botonBordeTexto}>Ver mediciones ({mediciones.length})</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={reiniciar}>
        <Text style={estilos.botonBordeTexto}>Reiniciar entradas de prueba</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
