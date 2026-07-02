const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod } = require('../../lib/response');
const { requireAuth } = require('../../lib/auth');

const INACTIVE_STATUSES = ['Rechazada', 'Cancelada'];

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  const pool = getPool();
  const current = await requireAuth(req, res);
  if (!current) return;

  const { veterinario, fecha } = req.query;
  if (!veterinario || !fecha) {
    return jsonError(res, 'Faltan los parámetros veterinario y fecha.', 422);
  }

  const result = await pool.query(
    `SELECT hora, estado FROM citas WHERE id_veterinario = $1 AND fecha = $2`,
    [veterinario, fecha]
  );

  const takenSlots = result.rows
    .filter((r) => !INACTIVE_STATUSES.includes(r.estado))
    .map((r) => String(r.hora).slice(0, 5));

  jsonResponse(res, { takenSlots });
};
