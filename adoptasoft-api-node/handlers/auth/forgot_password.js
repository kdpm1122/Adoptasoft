const crypto = require('crypto');
const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod, requireFields } = require('../../lib/response');
const { sendPasswordResetEmail } = require('../../lib/email');

const TOKEN_LIFETIME_HOURS = 1;

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireFields(req, res, ['email'])) return;

  const pool = getPool();
  const { email } = req.body;

  const result = await pool.query('SELECT id_usuario, nombre FROM usuarios WHERE email = $1', [email]);
  const usuario = result.rows[0];

  // No revelamos si el correo existe o no (buena práctica de seguridad).
  if (!usuario) {
    return jsonResponse(res, { message: 'Si el correo existe, te enviamos instrucciones para recuperar tu contraseña.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + TOKEN_LIFETIME_HOURS * 3600 * 1000);

  await pool.query(
    'INSERT INTO password_resets (id_usuario, token, expira_en) VALUES ($1, $2, $3)',
    [usuario.id_usuario, token, expira]
  );

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/?resetToken=${token}`;

  try {
    await sendPasswordResetEmail(email, resetLink);
  } catch (err) {
    console.error('Error enviando correo de recuperación:', err.message);
    return jsonError(res, 'No se pudo enviar el correo. Intenta más tarde.', 500);
  }

  jsonResponse(res, { message: 'Si el correo existe, te enviamos instrucciones para recuperar tu contraseña.' });
};
