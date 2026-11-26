import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import InicioScreen from './src/screens/InicioScreen';
import PermisoScreen from './src/screens/PermisoScreen';
import EscanerScreen from './src/screens/EscanerScreen';
import ManualScreen from './src/screens/ManualScreen';
import MedicionesScreen from './src/screens/MedicionesScreen';
import { colores } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Inicio"
            screenOptions={{
              headerStyle: { backgroundColor: colores.azulOscuro },
              headerTintColor: colores.blanco,
              headerTitleStyle: { fontWeight: '800' },
              headerBackTitle: 'Volver',
              contentStyle: { backgroundColor: colores.fondo },
            }}
          >
            <Stack.Screen name="Inicio" component={InicioScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Permiso" component={PermisoScreen} options={{ title: 'Permiso de cámara' }} />
            <Stack.Screen name="Escaner" component={EscanerScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Manual" component={ManualScreen} options={{ title: 'Ingreso manual' }} />
            <Stack.Screen name="Mediciones" component={MedicionesScreen} options={{ title: 'Mediciones' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
