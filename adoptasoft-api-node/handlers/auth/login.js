const bcrypt = require('bcryptjs');
const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod, requireFields } = require('../../lib/response');
const { createSession, dbRoleToFrontend } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireFields(req, res, ['email', 'password'])) return;

  const { email, password, role } = req.body;
  const pool = getPool();
  const result = await pool.query(
    'SELECT id_usuario, nombre, email, password, rol, foto_url FROM usuarios WHERE email = $1',
    [email]
  );
  const usuario = result.rows[0];

  if (!usuario || !bcrypt.compareSync(password, usuario.password)) {
    return jsonError(res, 'Correo o contraseña incorrectos.', 401);
  }
  if (role && dbRoleToFrontend(usuario.rol) !== role) {
    return jsonError(res, 'El perfil seleccionado no coincide con este usuario.', 401);
  }

  const token = await createSession(usuario.id_usuario);

  jsonResponse(res, {
    token,
    user: {
      id: usuario.id_usuario,
      name: usuario.nombre,
      email: usuario.email,
      role: dbRoleToFrontend(usuario.rol),
      photoUrl: usuario.foto_url,
    },
  });
};
