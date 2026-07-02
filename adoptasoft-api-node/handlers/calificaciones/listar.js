const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod } = require('../../lib/response');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  const pool = getPool();
  const current = await requireAuth(req, res);
  if (!current) return;

  let vetId = req.query.veterinario;
  if (current.rol === 'vet') {
    vetId = current.id_usuario;
  } else if (!vetId) {
    return jsonError(res, 'Falta el parámetro veterinario (id).', 422);
  }

  const result = await pool.query(
    `SELECT cal.id_calificacion, cal.estrellas, cal.comentario, cal.fecha, u.nombre AS dueno_nombre
     FROM calificaciones cal
     JOIN usuarios u ON u.id_usuario = cal.id_dueno
     WHERE cal.id_veterinario = $1
     ORDER BY cal.fecha DESC`,
    [vetId]
  );

  const reviews = result.rows.map((r) => ({
    id: r.id_calificacion,
    stars: r.estrellas,
    comment: r.comentario,
    date: r.fecha,
    ownerName: r.dueno_nombre,
  }));

  jsonResponse(res, { reviews });
};
