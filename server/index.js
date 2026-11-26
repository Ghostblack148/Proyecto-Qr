const http = require('http');
const os = require('os');

const PORT = 3000;
const sesiones = {};

function leerBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function enviarJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // 1. Crear sesión (Docente)
  if (req.method === 'POST' && req.url === '/api/sesiones') {
    const { curso, duracionMinutos } = await leerBody(req);
    const minutos = Number(duracionMinutos) || 3;
    const id = `SES-${Date.now().toString(36).toUpperCase()}`;
    const ahora = Date.now();

    sesiones[id] = {
      id,
      curso: (curso || 'Clase sin nombre').trim(),
      creadoEn: ahora,
      expiraEn: ahora + minutos * 60 * 1000,
      asistentes: [],
    };

    return enviarJson(res, 201, sesiones[id]);
  }

  // 2. Consultar sesión y lista en vivo (Docente)
  if (req.method === 'GET' && req.url.startsWith('/api/sesiones/')) {
    const id = req.url.replace('/api/sesiones/', '').trim();
    const sesion = sesiones[id];
    if (!sesion) return enviarJson(res, 404, { error: 'Sesión no encontrada' });

    const segundosRestantes = Math.max(0, Math.ceil((sesion.expiraEn - Date.now()) / 1000));
    return enviarJson(res, 200, {
      ...sesion,
      activa: segundosRestantes > 0,
      segundosRestantes,
    });
  }

  // 3. Registrar asistencia (Alumno)
  if (req.method === 'POST' && req.url === '/api/asistencia') {
    const { sesionId, nombre, rut } = await leerBody(req);
    const sesion = sesiones[sesionId];

    if (!sesion) {
      return enviarJson(res, 404, { estado: 'INVALIDO', mensaje: 'El código QR no corresponde a una sesión válida.' });
    }
    if (Date.now() > sesion.expiraEn) {
      return enviarJson(res, 410, { estado: 'EXPIRADO', mensaje: 'El tiempo para marcar asistencia ya terminó.' });
    }

    const rutLimpio = (rut || '').trim().toUpperCase();
    const nombreLimpio = (nombre || '').trim();
    if (!nombreLimpio || !rutLimpio) {
      return enviarJson(res, 400, { estado: 'ERROR', mensaje: 'Debes ingresar tu nombre y RUT.' });
    }

    const yaExiste = sesion.asistentes.some((a) => a.rut === rutLimpio);
    if (yaExiste) {
      return enviarJson(res, 409, { estado: 'DUPLICADO', mensaje: `El RUT ${rutLimpio} ya registró asistencia.` });
    }

    const registro = {
      nombre: nombreLimpio,
      rut: rutLimpio,
      hora: new Date().toLocaleTimeString('es-CL', { hour12: false }),
    };
    sesion.asistentes.push(registro);

    return enviarJson(res, 201, {
      estado: 'REGISTRADO',
      mensaje: `Asistencia confirmada para ${nombreLimpio} en ${sesion.curso}.`,
      registro,
    });
  }

  enviarJson(res, 404, { error: 'Ruta no encontrada' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n=== SERVIDOR DE ASISTENCIA ACTIVO ===');
  const interfaces = os.networkInterfaces();
  Object.values(interfaces).forEach((lista) => {
    (lista || []).forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`Usa esta URL en la app: http://${iface.address}:${PORT}`);
      }
    });
  });
  console.log('=====================================\n');
});