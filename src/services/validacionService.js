// Servicio único de validación de entradas. Es la única pieza que decide si una entrada
// sirve; las pantallas solo muestran el resultado.
//
// Minimización (Ley 21.719): las entradas son códigos ficticios sin datos personales.
// No se guarda quién entró, ni fotos, ni video: solo si el código ya se usó.
// Todo vive en memoria y se borra al cerrar la app.

export const ESTADOS = {
  VALIDO: 'VALIDO',
  YA_USADO: 'YA_USADO',
  INVALIDO: 'INVALIDO',
  ERROR: 'ERROR',
};

const CODIGOS_INICIALES = {
  'UTEM-2026-001': false, // false = disponible
  'UTEM-2026-002': false,
  'UTEM-2026-003': true, // ya usado desde el inicio, para probar YA_USADO
  'UTEM-2026-004': false,
  'UTEM-2026-005': false,
};

let usados = { ...CODIGOS_INICIALES };

const FORMATO = /^UTEM-\d{4}-\d{3}$/;

export function normalizar(texto) {
  return String(texto || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function formatoValido(texto) {
  return FORMATO.test(normalizar(texto)) || normalizar(texto) === 'ERROR-TEST';
}

// Es async a propósito: si mañana la validación pasa a un servidor, las pantallas no cambian.
export async function validarEntrada(texto) {
  const codigo = normalizar(texto);
  try {
    if (codigo === 'ERROR-TEST') {
      throw new Error('Falla simulada del servicio de validación.');
    }
    if (!(codigo in usados)) {
      return { estado: ESTADOS.INVALIDO, codigo, mensaje: 'Esta entrada no existe. No permitir el ingreso.' };
    }
    if (usados[codigo]) {
      return { estado: ESTADOS.YA_USADO, codigo, mensaje: 'Esta entrada ya se usó. No permitir el ingreso.' };
    }
    // Inmutable: se crea un objeto nuevo en vez de modificar el anterior
    usados = { ...usados, [codigo]: true };
    return { estado: ESTADOS.VALIDO, codigo, mensaje: 'Entrada válida. Puede ingresar.' };
  } catch (e) {
    return { estado: ESTADOS.ERROR, codigo, mensaje: e.message };
  }
}

export function reiniciarEntradas() {
  usados = { ...CODIGOS_INICIALES };
}

export function resumenEntradas() {
  const lista = Object.entries(usados);
  return { total: lista.length, usadas: lista.filter(([, u]) => u).length };
}
