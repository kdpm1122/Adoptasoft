const bcrypt = require('bcryptjs');
const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod, requireFields } = require('../../lib/response');
const { requireRole } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'PUT')) return;
  if (!(await requireRole(req, res, ['admin']))) return;
  if (!requireFields(req, res, ['newPassword'])) return;

  const { id } = req.query;
  if (!id) return jsonError(res, 'Falta el parámetro id.', 422);

  const { newPassword } = req.body;
  if (newPassword.length < 6) {
    return jsonError(res, 'La nueva contraseña debe tener al menos 6 caracteres.', 422);
  }

  const pool = getPool();
  const hash = bcrypt.hashSync(newPassword, 10);
  const result = await pool.query(
    'UPDATE usuarios SET password = $1 WHERE id_usuario = $2 RETURNING id_usuario',
    [hash, id]
  );

  if (result.rows.length === 0) return jsonError(res, 'Usuario no encontrado.', 404);

  jsonResponse(res, { message: 'Contraseña restablecida correctamente.' });
};
