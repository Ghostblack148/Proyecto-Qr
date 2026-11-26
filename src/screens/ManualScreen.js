// Ruta alternativa sin cámara: la app sigue siendo útil aunque se rechace el permiso.
import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatoValido, validarEntrada } from '../services/validacionService';
import Resultado from '../components/Resultado';
import { colores, estilos } from '../theme';

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
        <View style={s.cabecera}>
          <View style={s.icono}>
            <Ionicons name="ticket-outline" size={26} color={colores.verdeOscuro} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.titulo}>Código de la entrada</Text>
            <Text style={estilos.nota}>Está impreso bajo el QR</Text>
          </View>
        </View>

        <TextInput
          style={[estilos.input, error && estilos.inputError]}
          value={codigo}
          onChangeText={alEscribir}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={13}
          placeholder="UTEM-2026-001"
          placeholderTextColor={colores.borde}
          onSubmitEditing={validar}
          returnKeyType="done"
        />
        {error && <Text style={estilos.error}>{error}</Text>}

        <TouchableOpacity
          style={[estilos.boton, estilos.botonVerde, validando && estilos.botonDeshabilitado]}
          onPress={validar}
          disabled={validando}
        >
          {validando ? (
            <ActivityIndicator color={colores.blanco} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colores.blanco} />
              <Text style={estilos.botonTexto}>Validar entrada</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={s.chips}>
          <View style={s.chip}>
            <Ionicons name="camera-reverse-outline" size={14} color={colores.azul} />
            <Text style={s.chipTexto}>Sin cámara</Text>
          </View>
          <View style={s.chip}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colores.azul} />
            <Text style={s.chipTexto}>Sin conexión</Text>
          </View>
        </View>
      </View>

      <Resultado resultado={resultado} ms={ms} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  icono: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontSize: 18, fontWeight: '800', color: colores.texto },
  chips: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colores.azulClaro,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  chipTexto: { color: colores.azul, fontSize: 12, fontWeight: '700' },
});
