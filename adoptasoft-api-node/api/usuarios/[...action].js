function getAction(req) {
  const path = (req.url || "").split("?")[0];
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

const handlers = {
  listar: require('../../handlers/usuarios/listar'),
  crear: require('../../handlers/usuarios/crear'),
  eliminar: require('../../handlers/usuarios/eliminar'),
  actualizar: require('../../handlers/usuarios/actualizar'),
  cambiar_password: require('../../handlers/usuarios/cambiar_password'),
  registrar: require('../../handlers/usuarios/registrar'),
};

module.exports = async (req, res) => {
  const action = getAction(req);
  const handler = handlers[action];
  if (!handler) {
    res.status(404).json({ message: `Ruta no encontrada: /usuarios/${action || ''}` });
    return;
  }
  return handler(req, res);
};
