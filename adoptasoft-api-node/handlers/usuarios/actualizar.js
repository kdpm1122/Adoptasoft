const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod } = require('../../lib/response');
const { requireRole, frontendRoleToDb, dbRoleToFrontend } = require('../../lib/auth');

const MAP = { nombre: 'fullName', email: 'email', documento: 'document', telefono: 'phone' };

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'PUT')) return;

  const pool = getPool();
  if (!(await requireRole(req, res, ['admin']))) return;

  const { id } = req.query;
  if (!id) return jsonError(res, 'Falta el parámetro id.', 422);

  const body = req.body;
  const fields = [];
  const params = [];

  for (const [column, key] of Object.entries(MAP)) {
    if (body[key] !== undefined) {
      params.push(body[key]);
      fields.push(`${column} = $${params.length}`);
    }
  }

  if (body.role !== undefined) {
    const dbRole = frontendRoleToDb(body.role);
    if (!dbRole) return jsonError(res, 'Rol inválido.', 422);
    params.push(dbRole);
    fields.push(`rol = $${params.length}`);
  }

  if (fields.length === 0) return jsonError(res, 'No se enviaron campos para actualizar.', 422);

  params.push(id);
  const result = await pool.query(
    `UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = $${params.length}
     RETURNING id_usuario, nombre, email, documento, telefono, rol`,
    params
  );

  if (result.rows.length === 0) return jsonError(res, 'Usuario no encontrado.', 404);

  const u = result.rows[0];
  jsonResponse(res, {
    id: u.id_usuario,
    name: u.nombre,
    email: u.email,
    document: u.documento,
    phone: u.telefono,
    role: dbRoleToFrontend(u.rol),
    subtitle: u.email + (u.documento ? ' · ' + u.documento : ''),
  });
};
