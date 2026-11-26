// Servidor local de asistencia (Node.js puro, sin dependencias).
// Ejecutar con: node server/index.js
//
// Medidas de seguridad:
// 1. El QR cambia cada VENTANA_TOKEN_MS: una foto del código deja de servir en segundos.
// 2. El token se calcula con un secreto que solo conoce el servidor (HMAC), así que
//    no se puede adivinar el siguiente.
// 3. Solo el docente (con su claveDocente) puede ver el token vigente y la lista.
// 4. El RUT se valida con su dígito verificador y no se repite en la misma sesión.
// 5. Minimización (Ley 21.719): se guarda solo nombre, RUT y hora, en memoria,
//    y todo se borra al apagar el servidor.

const http = require('http');
const os = require('os');
const crypto = require('crypto');
const { validarRut, limpiarRut, formatearRut } = require('../src/utils/rut');

const PORT = 3000;
const VENTANA_TOKEN_MS = 20 * 1000; // el QR cambia cada 20 segundos
const MAX_DURACION_MIN = 60;

const sesiones = {};

function idAleatorio(largo) {
  // Sin letras que se confunden al escribir a mano (0/O, 1/I)
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(largo);
  let id = '';
  for (let i = 0; i < largo; i++) id += alfabeto[bytes[i] % alfabeto.length];
  return id;
}

function tokenEnVentana(sesion, ventana) {
  const hmac = crypto.createHmac('sha256', sesion.secreto).update(`${sesion.id}:${ventana}`).digest();
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 4; i++) token += alfabeto[hmac[i] % alfabeto.length];
  return token;
}

function ventanaActual() {
  return Math.floor(Date.now() / VENTANA_TOKEN_MS);
}

function tokenValido(sesion, token) {
  const v = ventanaActual();
  // Se acepta también la ventana anterior, para quien escaneó justo en el cambio.
  return token === tokenEnVentana(sesion, v) || token === tokenEnVentana(sesion, v - 1);
}

function leerBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 10000) reject(new Error('Cuerpo demasiado grande'));
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function enviarJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Clave-Docente',
  });
  res.end(JSON.stringify(payload));
}

function vistaDocente(sesion) {
  const segundosRestantes = Math.max(0, Math.ceil((sesion.expiraEn - Date.now()) / 1000));
  const v = ventanaActual();
  const token = tokenEnVentana(sesion, v);
  const msHastaCambio = (v + 1) * VENTANA_TOKEN_MS - Date.now();
  return {
    id: sesion.id,
    curso: sesion.curso,
    creadoEn: sesion.creadoEn,
    expiraEn: sesion.expiraEn,
    activa: segundosRestantes > 0,
    segundosRestantes,
    token,
    codigo: `${sesion.id}-${token}`, // lo que el alumno escribe a mano si no tiene cámara
    qr: `ASISTENCIA|${sesion.id}|${token}`,
    segundosHastaCambio: Math.ceil(msHastaCambio / 1000),
    asistentes: sesion.asistentes,
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return enviarJson(res, 204, {});

  let body = {};
  if (req.method === 'POST') {
    try {
      body = await leerBody(req);
    } catch (e) {
      return enviarJson(res, 400, { estado: 'ERROR', mensaje: 'Solicitud mal formada.' });
    }
  }

  // 1. Crear sesión (Docente)
  if (req.method === 'POST' && req.url === '/api/sesiones') {
    const minutos = Math.min(MAX_DURACION_MIN, Math.max(1, Number(body.duracionMinutos) || 3));
    let id;
    do id = idAleatorio(4); while (sesiones[id]);
    const ahora = Date.now();

    sesiones[id] = {
      id,
      curso: String(body.curso || 'Clase sin nombre').trim().slice(0, 80),
      creadoEn: ahora,
      expiraEn: ahora + minutos * 60 * 1000,
      secreto: crypto.randomBytes(32),
      claveDocente: crypto.randomBytes(16).toString('hex'),
      asistentes: [],
    };

    return enviarJson(res, 201, {
      ...vistaDocente(sesiones[id]),
      claveDocente: sesiones[id].claveDocente, // solo se entrega una vez, al docente
    });
  }

  // 2. Consultar sesión, QR vigente y lista en vivo (solo Docente)
  if (req.method === 'GET' && req.url.startsWith('/api/sesiones/')) {
    const id = req.url.replace('/api/sesiones/', '').trim().toUpperCase();
    const sesion = sesiones[id];
    if (!sesion) return enviarJson(res, 404, { estado: 'ERROR', mensaje: 'Sesión no encontrada.' });
    if (req.headers['x-clave-docente'] !== sesion.claveDocente) {
      return enviarJson(res, 403, { estado: 'ERROR', mensaje: 'Solo el docente puede ver esta sesión.' });
    }
    return enviarJson(res, 200, vistaDocente(sesion));
  }

  // 3. Registrar asistencia (Alumno)
  if (req.method === 'POST' && req.url === '/api/asistencia') {
    const sesionId = String(body.sesionId || '').trim().toUpperCase();
    const token = String(body.token || '').trim().toUpperCase();
    const nombre = String(body.nombre || '').trim().slice(0, 80);
    const rut = limpiarRut(body.rut);
    const sesion = sesiones[sesionId];

    if (!sesion) {
      return enviarJson(res, 404, { estado: 'INVALIDO', mensaje: 'El código no corresponde a una sesión válida.' });
    }
    if (Date.now() > sesion.expiraEn) {
      return enviarJson(res, 410, { estado: 'EXPIRADO', mensaje: 'El tiempo para marcar asistencia ya terminó.' });
    }
    if (!tokenValido(sesion, token)) {
      return enviarJson(res, 403, {
        estado: 'VENCIDO',
        mensaje: 'Ese código QR ya cambió. Escanea el que está ahora en la pantalla del docente.',
      });
    }
    if (nombre.length < 3) {
      return enviarJson(res, 400, { estado: 'ERROR', mensaje: 'Ingresa tu nombre completo.' });
    }
    if (!validarRut(rut)) {
      return enviarJson(res, 400, { estado: 'ERROR', mensaje: 'El RUT no es válido (revisa el dígito verificador).' });
    }
    if (sesion.asistentes.some((a) => limpiarRut(a.rut) === rut)) {
      return enviarJson(res, 409, { estado: 'DUPLICADO', mensaje: `El RUT ${formatearRut(rut)} ya registró asistencia.` });
    }

    const registro = {
      nombre,
      rut: formatearRut(rut),
      hora: new Date().toLocaleTimeString('es-CL', { hour12: false }),
    };
    sesion.asistentes.push(registro);

    return enviarJson(res, 201, {
      estado: 'REGISTRADO',
      mensaje: `Asistencia confirmada para ${nombre} en ${sesion.curso}.`,
      registro,
    });
  }

  enviarJson(res, 404, { estado: 'ERROR', mensaje: 'Ruta no encontrada.' });
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log('\n=== SERVIDOR DE ASISTENCIA ACTIVO ===');
    Object.values(os.networkInterfaces()).forEach((lista) => {
      (lista || []).forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`Usa esta URL en la app: http://${iface.address}:${PORT}`);
        }
      });
    });
    console.log('=====================================\n');
  });
}

module.exports = { server, tokenEnVentana, VENTANA_TOKEN_MS };
