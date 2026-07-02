function getAction(req) {
  const path = (req.url || "").split("?")[0];
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

const handlers = {
  crear: require('../../handlers/calificaciones/crear'),
  listar: require('../../handlers/calificaciones/listar'),
};

module.exports = async (req, res) => {
  const action = getAction(req);
  const handler = handlers[action];
  if (!handler) {
    res.status(404).json({ message: `Ruta no encontrada: /calificaciones/${action || ''}` });
    return;
  }
  return handler(req, res);
};
