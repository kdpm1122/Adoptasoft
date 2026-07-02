const { OAuth2Client } = require('google-auth-library');
const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod, requireFields } = require('../../lib/response');
const { createSession, dbRoleToFrontend } = require('../../lib/auth');

const GOOGLE_CLIENT_ID = '840053752885-ume640ihe181dnmj473vnbq8c0egks6o.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireFields(req, res, ['credential'])) return;

  const pool = getPool();

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    return jsonError(res, 'Token de Google inválido.', 401);
  }

  const { email, name } = payload;
  if (!email) return jsonError(res, 'Google no devolvió un correo válido.', 422);

  let result = await pool.query('SELECT id_usuario, nombre, email, rol FROM usuarios WHERE email = $1', [email]);
  let usuario = result.rows[0];

  if (!usuario) {
    const insertResult = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, 'owner') RETURNING id_usuario, nombre, email, rol`,
      [name || email.split('@')[0], email, 'google-oauth-no-password']
    );
    usuario = insertResult.rows[0];
  }

  const token = await createSession(usuario.id_usuario);

  jsonResponse(res, {
    token,
    user: {
      id: usuario.id_usuario,
      name: usuario.nombre,
      email: usuario.email,
      role: dbRoleToFrontend(usuario.rol),
    },
  });
};
