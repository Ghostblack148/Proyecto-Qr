import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import usePermisoCamara from '../hooks/usePermisoCamara';
import { leerCodigo, marcarAsistencia } from '../services/asistenciaService';
import { formatearRut, validarRut } from '../utils/rut';
import { colorEstado, estilos } from '../theme';

export default function AlumnoScreen({ navigation, route }) {
  const { serverUrl } = useApp();
  const { estado: permiso } = usePermisoCamara();
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState({});

  // Resultado que devuelve la pantalla del escáner
  const resultadoEscaner = route.params?.resultado;
  useEffect(() => {
    if (resultadoEscaner) setResultado(resultadoEscaner);
  }, [resultadoEscaner]);

  const validarDatos = () => {
    const nuevos = {};
    if (nombre.trim().length < 3) nuevos.nombre = 'Escribe tu nombre completo.';
    if (!validarRut(rut)) nuevos.rut = 'RUT no válido. Revisa el dígito verificador.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const irAEscanear = () => {
    setResultado(null);
    if (!validarDatos()) return;
    const datos = { nombre: nombre.trim(), rut };
    // Si ya hay permiso se va directo a la cámara; si no, primero se explica para qué se pide.
    if (permiso === 'concedido') {
      navigation.navigate('Escaner', { ...datos, inicio: Date.now() });
    } else {
      navigation.navigate('Permiso', datos);
    }
  };

  const enviarCodigoManual = async () => {
    setResultado(null);
    if (!validarDatos()) return;
    const leido = leerCodigo(codigo);
    if (!leido) {
      setErrores({ codigo: 'El código tiene 8 caracteres, por ejemplo AB12-XY34.' });
      return;
    }
    setEnviando(true);
    try {
      const data = await marcarAsistencia(serverUrl, { ...leido, nombre: nombre.trim(), rut });
      setResultado({ estado: data.estado, mensaje: data.mensaje });
      setCodigo('');
    } catch (e) {
      setResultado({ estado: e.estado || 'ERROR', mensaje: e.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={estilos.pantalla} keyboardShouldPersistTaps="handled">
      <View style={estilos.card}>
        <Text style={estilos.label}>Nombre completo</Text>
        <TextInput
          style={[estilos.input, errores.nombre && estilos.inputError]}
          placeholder="Ej. Esteban Pérez"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />
        {errores.nombre && <Text style={estilos.error}>{errores.nombre}</Text>}

        <Text style={estilos.label}>RUT</Text>
        <TextInput
          style={[estilos.input, errores.rut && estilos.inputError]}
          placeholder="Ej. 20.123.456-7"
          value={rut}
          onChangeText={setRut}
          onBlur={() => setRut((r) => formatearRut(r))}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        {errores.rut && <Text style={estilos.error}>{errores.rut}</Text>}
        <Text style={estilos.nota}>
          Solo se guarda tu nombre, RUT y la hora, para el registro de esta clase. No se guardan fotos ni video.
        </Text>
      </View>

      <TouchableOpacity style={estilos.boton} onPress={irAEscanear}>
        <Text style={estilos.botonTexto}>Escanear QR del docente</Text>
      </TouchableOpacity>

      <View style={[estilos.card, { marginTop: 20 }]}>
        <Text style={estilos.label}>¿Sin cámara? Escribe el código que aparece bajo el QR</Text>
        <TextInput
          style={[estilos.input, errores.codigo && estilos.inputError]}
          placeholder="AB12-XY34"
          value={codigo}
          onChangeText={setCodigo}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={9}
        />
        {errores.codigo && <Text style={estilos.error}>{errores.codigo}</Text>}
        <TouchableOpacity
          style={[estilos.boton, estilos.botonSecundario, enviando && estilos.botonDeshabilitado]}
          onPress={enviarCodigoManual}
          disabled={enviando}
        >
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>Marcar con código</Text>}
        </TouchableOpacity>
      </View>

      {resultado && (
        <View style={[estilos.resultado, { backgroundColor: colorEstado[resultado.estado] || colorEstado.ERROR }]}>
          <Text style={estilos.resultadoEstado}>{resultado.estado}</Text>
          <Text style={estilos.resultadoMensaje}>{resultado.mensaje}</Text>
          {resultado.ms != null && <Text style={estilos.nota}>Tiempo de registro: {resultado.ms} ms</Text>}
        </View>
      )}
    </ScrollView>
  );
}
