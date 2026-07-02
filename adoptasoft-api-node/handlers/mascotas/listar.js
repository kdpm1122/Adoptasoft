const { getPool } = require('../../lib/db');
const { handleOptions, jsonResponse, requireMethod } = require('../../lib/response');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  const pool = getPool();
  const current = await requireAuth(req, res);
  if (!current) return;

  let sql = `SELECT m.id_mascota, m.nombre, m.especie, m.raza, m.edad, m.peso, m.sexo, m.estado, m.foto_url,
                    m.id_propietario, u.nombre AS propietario_nombre, u.foto_url AS propietario_foto
             FROM mascotas m
             JOIN usuarios u ON u.id_usuario = m.id_propietario`;
  const params = [];

  if (current.rol === 'owner') {
    params.push(current.id_usuario);
    sql += ` WHERE m.id_propietario = $${params.length}`;
  } else if (req.query.propietario) {
    params.push(req.query.propietario);
    sql += ` WHERE m.id_propietario = $${params.length}`;
  }
  sql += ' ORDER BY m.nombre';

  const result = await pool.query(sql, params);
  const pets = result.rows.map((m) => ({
    id: m.id_mascota,
    name: m.nombre,
    species: m.especie,
    breed: m.raza,
    age: m.edad,
    weight: m.peso !== null ? parseFloat(m.peso) : null,
    sex: m.sexo,
    status: m.estado,
    photoUrl: m.foto_url,
    ownerId: m.id_propietario,
    ownerName: m.propietario_nombre,
    ownerPhotoUrl: m.propietario_foto,
  }));

  jsonResponse(res, { pets });
};
