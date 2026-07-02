const bcrypt = require('bcryptjs');
const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod, requireFields } = require('../../lib/response');
const { requireRole } = require('../../lib/auth');

function parseScheduleLabel(label) {
  const trimmed = (label || '').trim();
  let match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)$/i);
  if (match) {
    let hour = parseInt(match[1]);
    const isPM = match[3].toLowerCase().startsWith('p');
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${match[2]}:00`;
  }
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.length === 5 ? trimmed + ':00' : trimmed;
  }
  return '08:00:00';
}

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;

  const pool = getPool();
  const current = await requireRole(req, res, ['admin']);
  if (!current) return;
  if (!requireFields(req, res, ['name', 'email', 'specialty', 'clinic', 'password'])) return;

  const body = req.body;
  if (body.password.length < 6) return jsonError(res, 'La contraseña debe tener al menos 6 caracteres.', 422);

  const existing = await pool.query('SELECT id_usuario FROM usuarios WHERE email = $1', [body.email]);
  if (existing.rows.length > 0) return jsonError(res, 'Ya existe un usuario con ese correo.', 409);

  const client = await pool.connect();
  let idUsuario;
  try {
    await client.query('BEGIN');
    const hashedPassword = bcrypt.hashSync(body.password, 10);

    const userResult = await client.query(
      `INSERT INTO usuarios (nombre, email, telefono, password, rol)
       VALUES ($1, $2, $3, $4, 'vet') RETURNING id_usuario`,
      [body.name, body.email, body.phone || null, hashedPassword]
    );
    idUsuario = userResult.rows[0].id_usuario;

    await client.query(
      `INSERT INTO veterinarios_perfil (id_usuario, especialidad, clinica, registro_medico, horario_inicio, horario_fin)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [idUsuario, body.specialty, body.clinic, body.medicalLicense || null,
       parseScheduleLabel(body.scheduleStart || '8:00 a.m.'), parseScheduleLabel(body.scheduleEnd || '5:00 p.m.')]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    return jsonError(res, 'No se pudo crear el veterinario: ' + e.message, 500);
  } finally {
    client.release();
  }

  jsonResponse(res, {
    id: idUsuario,
    name: body.name,
    specialty: body.specialty,
    clinic: body.clinic,
    medicalLicense: body.medicalLicense || null,
    scheduleStart: body.scheduleStart || '8:00 a.m.',
    scheduleEnd: body.scheduleEnd || '5:00 p.m.',
    status: 'Activo',
  }, 201);
};
