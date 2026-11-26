// Validación de RUT chileno con dígito verificador (módulo 11).
// Se usa en la app (antes de enviar) y en el servidor (para no confiar en el cliente).
// Está escrito en CommonJS para que Node y la app compartan el mismo archivo.

function limpiarRut(rut) {
  return String(rut || '')
    .replace(/[^0-9kK]/g, '')
    .toUpperCase();
}

function calcularDv(cuerpo) {
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

function validarRut(rut) {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d{6,8}$/.test(cuerpo)) return false;
  return calcularDv(cuerpo) === dv;
}

function formatearRut(rut) {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return limpio;
  const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpo}-${limpio.slice(-1)}`;
}

module.exports = { limpiarRut, calcularDv, validarRut, formatearRut };
