function getAction(req) {
  const path = (req.url || "").split("?")[0];
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

const handlers = {
  login: require('../../handlers/auth/login'),
  logout: require('../../handlers/auth/logout'),
  google: require('../../handlers/auth/google'),
  forgot_password: require('../../handlers/auth/forgot_password'),
  reset_password: require('../../handlers/auth/reset_password'),
};

module.exports = async (req, res) => {
  const action = getAction(req);
  const handler = handlers[action];
  if (!handler) {
    res.status(404).json({ message: `Ruta no encontrada: /auth/${action || ''}` });
    return;
  }
  return handler(req, res);
};
