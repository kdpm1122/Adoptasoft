const bcrypt = require('bcryptjs');
const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod, requireFields } = require('../../lib/response');
const { createSession, dbRoleToFrontend } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireFields(req, res, ['fullName', 'email', 'password'])) return;

  const pool = getPool();
  const body = req.body;

  const existing = await pool.query('SELECT id_usuario FROM usuarios WHERE email = $1', [body.email]);
  if (existing.rows.length > 0) return jsonError(res, 'Ya existe un usuario con ese correo.', 409);
  if (body.password.length < 6) return jsonError(res, 'La contraseña debe tener al menos 6 caracteres.', 422);

  const hash = bcrypt.hashSync(body.password, 10);
  const result = await pool.query(
    `INSERT INTO usuarios (nombre, email, documento, telefono, password, rol)
     VALUES ($1, $2, $3, $4, $5, 'owner') RETURNING id_usuario, nombre, email, rol`,
    [body.fullName, body.email, body.document || null, body.phone || null, hash]
  );

  const usuario = result.rows[0];
  const token = await createSession(usuario.id_usuario);

  jsonResponse(res, {
    token,
    user: {
      id: usuario.id_usuario,
      name: usuario.nombre,
      email: usuario.email,
      role: dbRoleToFrontend(usuario.rol),
    },
  }, 201);
};
