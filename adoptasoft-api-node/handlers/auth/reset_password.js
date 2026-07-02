const bcrypt = require('bcryptjs');
const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod, requireFields } = require('../../lib/response');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireFields(req, res, ['token', 'newPassword'])) return;

  const { token, newPassword } = req.body;
  if (newPassword.length < 6) {
    return jsonError(res, 'La nueva contraseña debe tener al menos 6 caracteres.', 422);
  }

  const pool = getPool();
  const result = await pool.query(
    'SELECT id_usuario FROM password_resets WHERE token = $1 AND usado = FALSE AND expira_en > NOW()',
    [token]
  );
  const reset = result.rows[0];

  if (!reset) {
    return jsonError(res, 'El enlace es inválido o ya expiró. Solicita uno nuevo.', 400);
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  await pool.query('UPDATE usuarios SET password = $1 WHERE id_usuario = $2', [hash, reset.id_usuario]);
  await pool.query('UPDATE password_resets SET usado = TRUE WHERE token = $1', [token]);

  jsonResponse(res, { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
};
