const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, requireMethod } = require('../../lib/response');
const { requireAuth } = require('../../lib/auth');

function timeToScheduleLabel(time) {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const suffix = hour >= 12 ? 'p.m.' : 'a.m.';
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${m} ${suffix}`;
}

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  const pool = getPool();
  const current = await requireAuth(req, res);
  if (!current) return;

  const result = await pool.query(
    `SELECT u.id_usuario, u.nombre, vp.especialidad, vp.clinica, vp.registro_medico,
            vp.horario_inicio, vp.horario_fin, vp.estado,
            (SELECT ROUND(AVG(estrellas)::numeric, 1) FROM calificaciones WHERE id_veterinario = u.id_usuario) AS promedio,
            (SELECT COUNT(*) FROM calificaciones WHERE id_veterinario = u.id_usuario) AS total_calificaciones
     FROM usuarios u
     JOIN veterinarios_perfil vp ON vp.id_usuario = u.id_usuario
     WHERE u.rol = 'vet'
     ORDER BY u.nombre`
  );

  const vets = result.rows.map((v) => ({
    id: v.id_usuario,
    name: v.nombre,
    specialty: v.especialidad,
    clinic: v.clinica,
    medicalLicense: v.registro_medico,
    scheduleStart: timeToScheduleLabel(v.horario_inicio),
    scheduleEnd: timeToScheduleLabel(v.horario_fin),
    status: v.estado,
    rating: v.promedio !== null ? parseFloat(v.promedio) : null,
    ratingCount: parseInt(v.total_calificaciones),
  }));

  jsonResponse(res, { vets });
};
