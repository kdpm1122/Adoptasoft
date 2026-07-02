// src/infrastructure/repositories/ratingRepository.js
import { httpClient } from "../api/httpClient";

export const ratingRepository = {
  create: (citaId, estrellas, comentario) =>
    httpClient.post("/calificaciones/crear", { citaId, estrellas, comentario }),
};
