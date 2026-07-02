const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, jsonError, requireMethod, requireFields } = require('../../lib/response');
const { requireRole } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;

  const pool = getPool();
  const current = await requireRole(req, res, ['owner']);
  if (!current) return;
  if (!requireFields(req, res, ['citaId', 'estrellas'])) return;

  const { citaId, estrellas, comentario } = req.body;
  const stars = parseInt(estrellas);
  if (isNaN(stars) || stars < 1 || stars > 5) {
    return jsonError(res, 'La calificación debe ser un número entre 1 y 5.', 422);
  }

  const citaResult = await pool.query(
    `SELECT c.id_cita, c.estado, c.id_veterinario, m.id_propietario
     FROM citas c JOIN mascotas m ON m.id_mascota = c.id_mascota
     WHERE c.id_cita = $1`,
    [citaId]
  );
  const cita = citaResult.rows[0];

  if (!cita) return jsonError(res, 'Cita no encontrada.', 404);
  if (parseInt(cita.id_propietario) !== parseInt(current.id_usuario)) {
    return jsonError(res, 'Esa cita no pertenece a una de tus mascotas.', 403);
  }
  if (cita.estado !== 'Atendida') {
    return jsonError(res, 'Solo puedes calificar citas ya atendidas.', 422);
  }
  if (!cita.id_veterinario) {
    return jsonError(res, 'Esta cita no tiene veterinario asignado.', 422);
  }

  try {
    const result = await pool.query(
      `INSERT INTO calificaciones (id_cita, id_veterinario, id_dueno, estrellas, comentario)
       VALUES ($1, $2, $3, $4, $5) RETURNING id_calificacion, fecha`,
      [citaId, cita.id_veterinario, current.id_usuario, stars, comentario || null]
    );
    jsonResponse(res, {
      id: result.rows[0].id_calificacion,
      citaId: parseInt(citaId),
      estrellas: stars,
      comentario: comentario || null,
      fecha: result.rows[0].fecha,
    }, 201);
  } catch (e) {
    if (e.code === '23505') {
      return jsonError(res, 'Esta cita ya fue calificada.', 409);
    }
    return jsonError(res, 'No se pudo registrar la calificación: ' + e.message, 500);
  }
};
