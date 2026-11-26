import React from 'react';
import { Text, View } from 'react-native';
import { colorEstado, estilos } from '../theme';

const TITULOS = {
  VALIDO: '✓ VÁLIDA',
  YA_USADO: '✕ YA USADA',
  INVALIDO: '✕ NO EXISTE',
  ERROR: '⚠ ERROR',
};

export default function Resultado({ resultado, ms }) {
  if (!resultado) return null;
  return (
    <View style={[estilos.resultado, { backgroundColor: colorEstado[resultado.estado] || colorEstado.ERROR }]}>
      <Text style={estilos.resultadoEstado}>{TITULOS[resultado.estado] || resultado.estado}</Text>
      {resultado.codigo ? <Text style={estilos.nota}>{resultado.codigo}</Text> : null}
      <Text style={estilos.resultadoMensaje}>{resultado.mensaje}</Text>
      {ms != null && <Text style={estilos.nota}>Tiempo: {ms} ms</Text>}
    </View>
  );
}
