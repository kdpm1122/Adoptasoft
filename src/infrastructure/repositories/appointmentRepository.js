// src/infrastructure/repositories/appointmentRepository.js
import { httpClient } from "../api/httpClient";

export const appointmentRepository = {
  list: (petId) => {
    const query = petId ? `?mascota=${petId}` : "";
    return httpClient.get(`/citas/listar${query}`).then((data) => data.appointments);
  },
  create: (payload) => httpClient.post("/citas/crear", payload),
  update: (id, payload) => httpClient.put(`/citas/actualizar?id=${id}`, payload),
  remove: (id) => httpClient.delete(`/citas/eliminar?id=${id}`),
  getTakenSlots: (vetId, date) => httpClient.get(`/citas/turnos_ocupados?veterinario=${vetId}&fecha=${date}`).then((data) => data.takenSlots),
};
