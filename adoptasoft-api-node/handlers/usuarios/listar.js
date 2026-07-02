const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, requireMethod } = require('../../lib/response');
const { requireRole, dbRoleToFrontend } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  const pool = getPool();
  if (!(await requireRole(req, res, ['admin']))) return;

  const result = await pool.query(
    'SELECT id_usuario, nombre, email, documento, telefono, rol, fecha_registro, foto_url FROM usuarios ORDER BY fecha_registro DESC'
  );

  const users = result.rows.map((u) => ({
    id: u.id_usuario,
    name: u.nombre,
    email: u.email,
    document: u.documento,
    phone: u.telefono,
    role: dbRoleToFrontend(u.rol),
    subtitle: u.email + (u.documento ? ' · ' + u.documento : ''),
    registeredAt: u.fecha_registro,
    photoUrl: u.foto_url,
  }));

  jsonResponse(res, { users });
};
