// Franja azul y roja, guiño a la identidad visual institucional
import React from 'react';
import { View } from 'react-native';
import { colores } from '../theme';

export default function Franja({ alto = 5, ancho = 120 }) {
  return (
    <View style={{ flexDirection: 'row', width: ancho, height: alto, borderRadius: alto, overflow: 'hidden' }}>
      <View style={{ flex: 1, backgroundColor: colores.azul }} />
      <View style={{ flex: 1, backgroundColor: colores.rojo }} />
    </View>
  );
}
