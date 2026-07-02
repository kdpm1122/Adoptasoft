// src/infrastructure/repositories/ratingRepository.js
import { httpClient } from "../api/httpClient";

export const ratingRepository = {
  create: (citaId, estrellas, comentario) =>
    httpClient.post("/calificaciones/crear", { citaId, estrellas, comentario }),
  list: (vetId) =>
    httpClient.get(`/calificaciones/listar?veterinario=${vetId}`).then((data) => data.reviews),
};
