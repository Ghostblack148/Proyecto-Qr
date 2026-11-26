import { StyleSheet } from 'react-native';

export const colores = {
  fondo: '#f2f7fc',
  azul: '#0d63a5',
  azulOscuro: '#0f2740',
  turquesa: '#14b8a6',
  texto: '#334155',
  suave: '#64748b',
  borde: '#cbd5e1',
  rojo: '#dc2626',
  verde: '#16a34a',
  ambar: '#d97706',
};

// Color de fondo para cada estado de respuesta
export const colorEstado = {
  VALIDO: '#dcfce7',
  YA_USADO: '#fef3c7',
  INVALIDO: '#fee2e2',
  ERROR: '#fee2e2',
};

export const estilos = StyleSheet.create({
  pantalla: { flexGrow: 1, backgroundColor: colores.fondo, padding: 20 },
  titulo: { fontSize: 24, fontWeight: '900', color: colores.azulOscuro, marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: colores.texto, marginBottom: 6, marginTop: 8 },
  texto: { fontSize: 15, color: colores.texto, lineHeight: 22 },
  nota: { fontSize: 13, color: colores.suave, lineHeight: 19, marginTop: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: colores.borde,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: { borderColor: colores.rojo },
  error: { color: colores.rojo, fontSize: 13, marginTop: 4 },
  boton: {
    backgroundColor: colores.azul,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    minHeight: 48, // área táctil mínima
    justifyContent: 'center',
  },
  botonSecundario: { backgroundColor: colores.turquesa },
  botonBorde: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colores.azul },
  botonDeshabilitado: { opacity: 0.5 },
  botonTexto: { color: '#fff', fontWeight: '800', fontSize: 16 },
  botonBordeTexto: { color: colores.azul, fontWeight: '800', fontSize: 16 },
  resultado: { padding: 16, borderRadius: 12, marginTop: 16 },
  resultadoEstado: { fontSize: 18, fontWeight: '900', color: colores.azulOscuro },
  resultadoMensaje: { fontSize: 15, color: colores.texto, marginTop: 4 },
});
