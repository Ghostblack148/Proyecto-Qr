import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { estilos } from '../theme';

export default function InicioScreen({ navigation }) {
  const { serverUrl, setServerUrl, mediciones } = useApp();

  return (
    <ScrollView contentContainerStyle={[estilos.pantalla, { justifyContent: 'center' }]}>
      <Text style={estilos.titulo}>Control de Asistencia QR</Text>

      <View style={estilos.card}>
        <Text style={estilos.label}>Dirección del servidor (aparece en la terminal)</Text>
        <TextInput
          style={estilos.input}
          defaultValue={serverUrl}
          onChangeText={setServerUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.X.X:3000"
        />
      </View>

      <TouchableOpacity style={estilos.boton} onPress={() => navigation.navigate('Docente')}>
        <Text style={estilos.botonTexto}>Soy docente: generar QR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[estilos.boton, estilos.botonSecundario]}
        onPress={() => navigation.navigate('Alumno')}
      >
        <Text style={estilos.botonTexto}>Soy alumno: marcar asistencia</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[estilos.boton, estilos.botonBorde]} onPress={() => navigation.navigate('Mediciones')}>
        <Text style={estilos.botonBordeTexto}>Ver mediciones ({mediciones.length})</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
