// Capa de servicios: es el ÚNICO archivo de la app que usa fetch.
// Las pantallas llaman a estas funciones y nunca hablan directo con el servidor.

const TIEMPO_MAXIMO_MS = 8000;

export class ErrorServicio extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.estado = estado; // INVALIDO, EXPIRADO, VENCIDO, DUPLICADO, ERROR, SIN_CONEXION
  }
}

async function pedir(serverUrl, ruta, opciones = {}) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  let res;
  try {
    res = await fetch(`${serverUrl}${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
      signal: controlador.signal,
    });
  } catch (e) {
    throw new ErrorServicio(
      'SIN_CONEXION',
      `No se pudo conectar con ${serverUrl}. Revisa que el servidor esté encendido y que estés en el mismo Wi-Fi.`
    );
  } finally {
    clearTimeout(temporizador);
  }

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // respuesta sin JSON: se maneja abajo con res.ok
  }

  if (!res.ok) {
    throw new ErrorServicio(data?.estado || 'ERROR', data?.mensaje || `El servidor respondió con error ${res.status}.`);
  }
  return data;
}

export function crearSesion(serverUrl, curso, duracionMinutos) {
  return pedir(serverUrl, '/api/sesiones', {
    method: 'POST',
    body: JSON.stringify({ curso, duracionMinutos }),
  });
}

export function obtenerSesion(serverUrl, sesionId, claveDocente) {
  return pedir(serverUrl, `/api/sesiones/${sesionId}`, {
    headers: { 'X-Clave-Docente': claveDocente },
  });
}

export function marcarAsistencia(serverUrl, { sesionId, token, nombre, rut }) {
  return pedir(serverUrl, '/api/asistencia', {
    method: 'POST',
    body: JSON.stringify({ sesionId, token, nombre, rut }),
  });
}

// Interpreta lo que viene del QR ("ASISTENCIA|AB12|XY34") o lo que se escribe a mano ("AB12-XY34").
export function leerCodigo(texto) {
  const limpio = String(texto || '').trim().toUpperCase();
  const qr = limpio.match(/^ASISTENCIA\|([A-Z0-9]{4})\|([A-Z0-9]{4})$/);
  if (qr) return { sesionId: qr[1], token: qr[2] };
  const manual = limpio.replace(/\s/g, '').match(/^([A-Z0-9]{4})-?([A-Z0-9]{4})$/);
  if (manual) return { sesionId: manual[1], token: manual[2] };
  return null;
}
