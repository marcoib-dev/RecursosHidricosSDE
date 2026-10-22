// Configuración compartida de JWT.
// Se usa desde server.js (CommonJS) y desde el backend modular (ESM)
// para que todos los jwt.sign / jwt.verify usen exactamente el mismo secreto.

const LEGACY_JWT_SECRET = 'recursos-hidricos-sde-secret';
const MIN_JWT_SECRET_LENGTH = 32;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';
  const isLegacy = secret === LEGACY_JWT_SECRET;
  const isTooShort = Boolean(secret) && secret.length < MIN_JWT_SECRET_LENGTH;

  if (isProduction) {
    if (!secret) {
      fail(
        'JWT_SECRET es obligatorio en producción. Defina una clave aleatoria de al menos ' +
          `${MIN_JWT_SECRET_LENGTH} caracteres (por ejemplo: openssl rand -hex 64).`
      );
    }
    if (isLegacy) {
      fail(
        'JWT_SECRET usa el valor por defecto antiguo. Genere una clave nueva y única antes de ' +
          'arrancar en producción.'
      );
    }
    if (isTooShort) {
      fail(
        `JWT_SECRET debe tener al menos ${MIN_JWT_SECRET_LENGTH} caracteres en producción ` +
          `(actual: ${secret.length}).`
      );
    }
    return secret;
  }

  if (!secret) {
    console.warn(
      '⚠️  JWT_SECRET no está definido. Usando el secreto de desarrollo inseguro. ' +
        'Defina uno antes de desplegar en producción.'
    );
    return LEGACY_JWT_SECRET;
  }

  if (isLegacy || isTooShort) {
    console.warn(
      '⚠️  JWT_SECRET es débil (valor por defecto o menos de ' +
        `${MIN_JWT_SECRET_LENGTH} caracteres). En producción el backend no arrancará así.`
    );
  }

  return secret;
}

module.exports = {
  getJwtSecret,
  LEGACY_JWT_SECRET,
  MIN_JWT_SECRET_LENGTH,
};
