// src/infrastructure/repositories/userRepository.js
import { httpClient } from "../api/httpClient";

export const userRepository = {
  list: () => httpClient.get("/usuarios/listar").then((data) => data.users),
  create: (payload) => httpClient.post("/usuarios/crear", payload),
  remove: (id) => httpClient.delete(`/usuarios/eliminar?id=${id}`),
  update: (id, payload) => httpClient.put(`/usuarios/actualizar?id=${id}`, payload),
  adminResetPassword: (id, newPassword) => httpClient.put(`/usuarios/admin_reset_password?id=${id}`, { newPassword }),
  changePassword: (payload) => httpClient.post("/usuarios/cambiar_password", payload),
  updatePhoto: (photoUrl) => httpClient.put("/usuarios/actualizar_foto", { photoUrl }),
};
