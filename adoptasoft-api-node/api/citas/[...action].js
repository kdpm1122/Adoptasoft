function getAction(req) {
  const path = (req.url || "").split("?")[0];
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

const handlers = {
  listar: require('../../handlers/citas/listar'),
  crear: require('../../handlers/citas/crear'),
  actualizar: require('../../handlers/citas/actualizar'),
  eliminar: require('../../handlers/citas/eliminar'),
  turnos_ocupados: require('../../handlers/citas/turnos_ocupados'),
};

module.exports = async (req, res) => {
  const action = getAction(req);
  const handler = handlers[action];
  if (!handler) {
    res.status(404).json({ message: `Ruta no encontrada: /citas/${action || ''}` });
    return;
  }
  return handler(req, res);
};
