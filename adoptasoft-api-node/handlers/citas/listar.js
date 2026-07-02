const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, requireMethod } = require('../../lib/response');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  const pool = getPool();
  const current = await requireAuth(req, res);
  if (!current) return;

  let sql = `SELECT c.id_cita, c.fecha, c.hora, c.tipo, c.motivo, c.estado,
                    c.id_mascota, m.nombre AS mascota_nombre, m.id_propietario,
                    c.id_veterinario, v.nombre AS veterinario_nombre,
                    cal.estrellas AS calificacion_estrellas
             FROM citas c
             JOIN mascotas m ON m.id_mascota = c.id_mascota
             LEFT JOIN usuarios v ON v.id_usuario = c.id_veterinario
             LEFT JOIN calificaciones cal ON cal.id_cita = c.id_cita`;
  const where = [];
  const params = [];

  if (current.rol === 'owner') {
    params.push(current.id_usuario);
    where.push(`m.id_propietario = $${params.length}`);
  } else if (current.rol === 'vet') {
    params.push(current.id_usuario);
    where.push(`c.id_veterinario = $${params.length}`);
  } else if (req.query.mascota) {
    params.push(req.query.mascota);
    where.push(`c.id_mascota = $${params.length}`);
  }

  if (where.length > 0) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY c.fecha, c.hora';

  const result = await pool.query(sql, params);
  const appointments = result.rows.map((c) => ({
    id: c.id_cita,
    date: c.fecha,
    time: String(c.hora).slice(0, 5),
    type: c.tipo,
    reason: c.motivo,
    status: c.estado,
    petId: c.id_mascota,
    petName: c.mascota_nombre,
    ownerId: c.id_propietario,
    vetId: c.id_veterinario,
    vetName: c.veterinario_nombre,
    rating: c.calificacion_estrellas,
  }));

  jsonResponse(res, { appointments });
};
