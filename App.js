import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/context/AppContext';
import InicioScreen from './src/screens/InicioScreen';
import DocenteScreen from './src/screens/DocenteScreen';
import AlumnoScreen from './src/screens/AlumnoScreen';
import PermisoScreen from './src/screens/PermisoScreen';
import EscanerScreen from './src/screens/EscanerScreen';
import MedicionesScreen from './src/screens/MedicionesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="Inicio"
          screenOptions={{ headerTintColor: '#0d63a5', headerBackTitle: 'Volver' }}
        >
          <Stack.Screen name="Inicio" component={InicioScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Docente" component={DocenteScreen} options={{ title: 'Panel docente' }} />
          <Stack.Screen name="Alumno" component={AlumnoScreen} options={{ title: 'Marcar asistencia' }} />
          <Stack.Screen name="Permiso" component={PermisoScreen} options={{ title: 'Permiso de cámara' }} />
          <Stack.Screen name="Escaner" component={EscanerScreen} options={{ title: 'Escanear QR', headerShown: false }} />
          <Stack.Screen name="Mediciones" component={MedicionesScreen} options={{ title: 'Mediciones' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
