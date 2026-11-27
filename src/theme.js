import { StyleSheet } from 'react-native';

// Paleta inspirada en la identidad visual UTEM
export const colores = {
  azul: '#1E4A9E', // azul institucional
  azulOscuro: '#122B63',
  azulProfundo: '#0B1E4A',
  azulClaro: '#E7EEF9',
  verde: '#7AB648', // verde del escudo
  verdeOscuro: '#4F8A2E',
  verdeClaro: '#EAF5E0',
  rojo: '#D2483F', // franja roja
  rojoClaro: '#FDECEA',
  ambar: '#E39B1B',
  ambarClaro: '#FFF4DE',
  fondo: '#EEF2F8',
  blanco: '#FFFFFF',
  texto: '#16264A',
  suave: '#5D6B87',
  borde: '#D5DDEB',
};

export const fuente = {
  titulo: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
};

// Cómo se ve cada resultado de validación
export const estiloEstado = {
  VALIDO: { fondo: colores.verdeClaro, color: colores.verdeOscuro, icono: 'checkmark-circle', titulo: 'Entrada válida' },
  YA_USADO: { fondo: colores.ambarClaro, color: '#A36800', icono: 'alert-circle', titulo: 'Ya fue usada' },
  INVALIDO: { fondo: colores.rojoClaro, color: colores.rojo, icono: 'close-circle', titulo: 'No existe' },
  ERROR: { fondo: colores.rojoClaro, color: colores.rojo, icono: 'alert-circle', titulo: 'Error' },
};

export const sombra = {
  shadowColor: '#0B1E4A',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export const estilos = StyleSheet.create({
  pantalla: { flexGrow: 1, backgroundColor: colores.fondo, padding: 20 },
  titulo: { ...fuente.titulo, color: colores.texto, marginBottom: 12 },
  card: { backgroundColor: colores.blanco, padding: 18, borderRadius: 18, marginBottom: 16, ...sombra },
  label: { fontSize: 13, fontWeight: '700', color: colores.suave, marginBottom: 8, marginTop: 4, letterSpacing: 0.3 },
  texto: { fontSize: 15, color: colores.texto, lineHeight: 22 },
  nota: { fontSize: 13, color: colores.suave, lineHeight: 19, marginTop: 6 },
  input: {
    borderWidth: 2,
    borderColor: colores.borde,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colores.texto,
    backgroundColor: colores.fondo,
    textAlign: 'center',
  },
  inputError: { borderColor: colores.rojo },
  error: { color: colores.rojo, fontSize: 13, marginTop: 6, fontWeight: '600' },
  boton: {
    backgroundColor: colores.azul,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    minHeight: 52, // área táctil cómoda
  },
  botonVerde: { backgroundColor: colores.verdeOscuro },
  botonBorde: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colores.azul },
  botonDeshabilitado: { opacity: 0.5 },
  botonTexto: { color: colores.blanco, fontWeight: '800', fontSize: 16 },
  botonBordeTexto: { color: colores.azul, fontWeight: '800', fontSize: 16 },
  sombra,
});
