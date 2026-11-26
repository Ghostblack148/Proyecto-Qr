// Ruta alternativa sin cámara: la app sigue siendo útil aunque se rechace el permiso.
import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatoValido, validarEntrada } from '../services/validacionService';
import Resultado from '../components/Resultado';
import { estilos } from '../theme';

export default function ManualScreen() {
  const { agregarMedicion } = useApp();
  const [codigo, setCodigo] = useState('UTEM-2026-');
  const [error, setError] = useState(null);
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [ms, setMs] = useState(null);
  const inicio = useRef(null); // Medición 3: desde la primera tecla hasta el resultado

  const alEscribir = (texto) => {
    if (!inicio.current) inicio.current = Date.now();
    setCodigo(texto.toUpperCase());
    setError(null);
  };

  const validar = async () => {
    if (!formatoValido(codigo)) {
      setError('El código debe tener el formato UTEM-2026-001.');
      return;
    }
    setValidando(true);
    const r = await validarEntrada(codigo);
    const t = inicio.current ? Date.now() - inicio.current : null;
    if (t != null) agregarMedicion('manual', t);
    setMs(t);
    setResultado(r);
    setValidando(false);
    setCodigo('UTEM-2026-');
    inicio.current = null;
  };

  return (
    <ScrollView contentContainerStyle={estilos.pantalla} keyboardShouldPersistTaps="handled">
      <View style={estilos.card}>
        <Text style={estilos.label}>Código impreso bajo el QR de la entrada</Text>
        <TextInput
          style={[estilos.input, error && estilos.inputError]}
          value={codigo}
          onChangeText={alEscribir}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={13}
          placeholder="UTEM-2026-001"
          onSubmitEditing={validar}
          returnKeyType="done"
        />
        {error && <Text style={estilos.error}>{error}</Text>}
        <TouchableOpacity
          style={[estilos.boton, validando && estilos.botonDeshabilitado]}
          onPress={validar}
          disabled={validando}
        >
          {validando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>Validar entrada</Text>}
        </TouchableOpacity>
        <Text style={estilos.nota}>Funciona sin cámara y sin conexión.</Text>
      </View>

      <Resultado resultado={resultado} ms={ms} />
    </ScrollView>
  );
}
