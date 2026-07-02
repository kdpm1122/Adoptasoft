const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod } = require('../../lib/response');
const { requireAuth } = require('../../lib/auth');

const MAP = { nombre: 'name', especie: 'species', raza: 'breed', edad: 'age', peso: 'weight', sexo: 'sex', estado: 'status', foto_url: 'photoUrl' };

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'PUT')) return;

  const pool = getPool();
  const current = await requireAuth(req, res);
  if (!current) return;

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
  if (fields.length === 0) return jsonError(res, 'No se enviaron campos para actualizar.', 422);

  params.push(id);
  await pool.query(`UPDATE mascotas SET ${fields.join(', ')} WHERE id_mascota = $${params.length}`, params);

  jsonResponse(res, { message: 'Mascota actualizada.' });
};
