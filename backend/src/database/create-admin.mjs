import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { pool } from './connection.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const MIN_PASSWORD_LENGTH = 12;
const DEFAULT_ADMIN_NAME = 'Administrador';

async function ensureInitialAdmin() {
  const [admins] = await pool.query(
    "SELECT id FROM usuarios WHERE rol = 'administrador' LIMIT 1"
  );

  if (admins.length > 0) {
    console.log('👤 Ya existe un usuario administrador; no se crea ni modifica ninguno.');
    return;
  }

  const email = (process.env.ADMIN_EMAIL || '').trim();
  const password = process.env.ADMIN_PASSWORD || '';
  const fullName = (process.env.ADMIN_NOMBRE || '').trim() || DEFAULT_ADMIN_NAME;

  if (!email || !password) {
    console.warn(
      '⚠️  No hay ningún administrador y falta ADMIN_EMAIL o ADMIN_PASSWORD. ' +
        'No se creó el administrador inicial.'
    );
    return;
  }

  if (password.toUpperCase().includes('CAMBIAR')) {
    console.warn(
      '⚠️  ADMIN_PASSWORD conserva el valor de ejemplo (contiene "CAMBIAR"). ' +
        'No se creó el administrador inicial.'
    );
    return;
  }

  if (email.toLowerCase().endsWith('.invalid')) {
    console.warn(
      '⚠️  ADMIN_EMAIL termina en ".invalid" y parece un valor de ejemplo. ' +
        'No se creó el administrador inicial.'
    );
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.warn(
      `⚠️  ADMIN_PASSWORD tiene ${password.length} caracteres; se requieren al menos ` +
        `${MIN_PASSWORD_LENGTH}. No se creó el administrador inicial.`
    );
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    console.warn('⚠️  ADMIN_EMAIL no tiene un formato válido. No se creó el administrador inicial.');
    return;
  }

  // Nunca se modifica un usuario existente, aunque su correo coincida con
  // ADMIN_EMAIL: si ya existe con otro rol, se avisa y no se toca.
  const [existing] = await pool.query(
    'SELECT id, rol FROM usuarios WHERE correo = ? LIMIT 1',
    [email]
  );

  if (existing.length > 0) {
    console.warn(
      `⚠️  ADMIN_EMAIL ya pertenece a un usuario existente (rol: ${existing[0].rol}). ` +
        'No se modificó su rol ni su contraseña.'
    );
    return;
  }

  const [nombre, ...resto] = fullName.split(/\s+/);
  const apellido = resto.join(' ') || 'Sistema';
  const hashedPassword = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol)
     VALUES (?, ?, ?, ?, 'administrador')`,
    [nombre, apellido, email, hashedPassword]
  );

  console.log(`✅ Administrador inicial creado: ${email}`);
}

ensureInitialAdmin()
  .catch((error) => {
    console.error('❌ Error creando el administrador inicial:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
