const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod, requireFields } = require('../../lib/response');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'PUT')) return;

  const pool = getPool();
  const current = await requireAuth(req, res);
  if (!current) return;
  if (!requireFields(req, res, ['photoUrl'])) return;

  const result = await pool.query(
    'UPDATE usuarios SET foto_url = $1 WHERE id_usuario = $2 RETURNING id_usuario, foto_url',
    [req.body.photoUrl, current.id_usuario]
  );

  const u = result.rows[0];
  jsonResponse(res, { id: u.id_usuario, photoUrl: u.foto_url });
};
