import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import usePermisoCamara from '../hooks/usePermisoCamara';
import { reiniciarEntradas, resumenEntradas } from '../services/validacionService';
import Franja from '../components/Franja';
import { colores, estilos, sombra } from '../theme';

function Accion({ icono, titulo, detalle, color, onPress }) {
  return (
    <TouchableOpacity style={[estilos.card, s.accion]} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.iconoAccion, { backgroundColor: color }]}>
        <Ionicons name={icono} size={26} color={colores.blanco} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.accionTitulo}>{titulo}</Text>
        <Text style={s.accionDetalle}>{detalle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colores.suave} />
    </TouchableOpacity>
  );
}

export default function InicioScreen({ navigation }) {
  const insets = useSafeAreaInsets();
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
    Alert.alert('Entradas reiniciadas', 'Las entradas de prueba volvieron a su estado inicial.');
  };

  const disponibles = resumen.total - resumen.usadas;

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={{ paddingBottom: 32 }}>
      <LinearGradient
        colors={[colores.azulProfundo, colores.azul, '#3E7C6A', colores.verde]}
        locations={[0, 0.5, 0.82, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.hero, { paddingTop: insets.top + 24 }]}
      >
        <Franja />
        <Text style={s.evento}>FERIA TECNOLÓGICA UTEM 2026</Text>
        <Text style={s.heroTitulo}>Validador{'\n'}de entradas</Text>
        <Text style={s.heroSub}>Control de acceso con código QR</Text>

        <View style={s.stats}>
          <View style={s.stat}>
            <Text style={s.statNumero}>{disponibles}</Text>
            <Text style={s.statLabel}>Disponibles</Text>
          </View>
          <View style={s.separador} />
          <View style={s.stat}>
            <Text style={s.statNumero}>{resumen.usadas}</Text>
            <Text style={s.statLabel}>Usadas</Text>
          </View>
          <View style={s.separador} />
          <View style={s.stat}>
            <Text style={s.statNumero}>{resumen.total}</Text>
            <Text style={s.statLabel}>Total</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={s.cuerpo}>
        <TouchableOpacity style={s.principal} onPress={escanear} activeOpacity={0.85}>
          <LinearGradient
            colors={[colores.azul, colores.azulOscuro]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.principalFondo}
          >
            <View style={s.principalIcono}>
              <Ionicons name="qr-code-outline" size={34} color={colores.azul} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.principalTitulo}>Escanear entrada</Text>
              <Text style={s.principalDetalle}>Apunta la cámara al QR</Text>
            </View>
            <Ionicons name="scan-outline" size={28} color={colores.verde} />
          </LinearGradient>
        </TouchableOpacity>

        <Accion
          icono="keypad-outline"
          titulo="Ingresar código a mano"
          detalle="Funciona sin cámara y sin conexión"
          color={colores.verdeOscuro}
          onPress={() => navigation.navigate('Manual')}
        />
        <Accion
          icono="stats-chart-outline"
          titulo="Mediciones"
          detalle={`${mediciones.length} registradas`}
          color={colores.azul}
          onPress={() => navigation.navigate('Mediciones')}
        />

        <TouchableOpacity style={s.reiniciar} onPress={reiniciar}>
          <Ionicons name="refresh-outline" size={18} color={colores.suave} />
          <Text style={s.reiniciarTexto}>Reiniciar entradas de prueba</Text>
        </TouchableOpacity>

        <View style={s.privacidad}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colores.verdeOscuro} />
          <Text style={s.privacidadTexto}>Entradas ficticias. No se guardan fotos ni datos personales.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 72, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  evento: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginTop: 18 },
  heroTitulo: { color: colores.blanco, fontSize: 36, fontWeight: '900', letterSpacing: -1, marginTop: 6, lineHeight: 40 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 8 },
  stats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  stat: { flex: 1, alignItems: 'center' },
  statNumero: { color: colores.blanco, fontSize: 26, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  separador: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  cuerpo: { paddingHorizontal: 20, marginTop: -44 },
  principal: { borderRadius: 22, marginBottom: 16, ...sombra },
  principalFondo: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16, borderRadius: 22 },
  principalIcono: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colores.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  principalTitulo: { color: colores.blanco, fontSize: 20, fontWeight: '900' },
  principalDetalle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  accion: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  iconoAccion: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  accionTitulo: { fontSize: 16, fontWeight: '800', color: colores.texto },
  accionDetalle: { fontSize: 13, color: colores.suave, marginTop: 2 },
  reiniciar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, minHeight: 48 },
  reiniciarTexto: { color: colores.suave, fontWeight: '700', fontSize: 14 },
  privacidad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
  privacidadTexto: { color: colores.suave, fontSize: 12, flexShrink: 1, textAlign: 'center' },
});
