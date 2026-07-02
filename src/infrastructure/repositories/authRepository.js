// src/infrastructure/repositories/authRepository.js
import { httpClient } from "../api/httpClient";
import { User } from "../../domain/entities/User";

// Modo mock: mientras no exista backend, simula el login localmente.
// Se activa automáticamente si no hay VITE_API_URL definida, o forzando VITE_USE_MOCK_AUTH=true
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === "true" || !import.meta.env.VITE_API_URL;

function mockLogin({ email, role }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        new User({
          id: "mock-" + Date.now(),
          email,
          role,
          name: email?.split("@")[0] || "Usuario",
        })
      );
    }, 400); // simula latencia de red
  });
}

export const authRepository = {
  async login({ email, password, role }) {
    if (USE_MOCK) {
      console.warn("[authRepository] Usando login MOCK — no hay backend conectado todavía.");
      return mockLogin({ email, role });
    }

    const data = await httpClient.post("/auth/login", { email, password, role });
    localStorage.setItem("adoptasoft_token", data.token);
    return new User(data.user);
  },

  async register({ fullName, email, password, phone, document }) {
    const data = await httpClient.post("/usuarios/registrar", { fullName, email, password, phone, document });
    localStorage.setItem("adoptasoft_token", data.token);
    return new User(data.user);
  },

  async loginWithGoogle(credential) {
    if (USE_MOCK) {
      console.warn("[authRepository] Usando login con Google MOCK — no hay backend conectado todavía.");
      return mockLogin({ email: "google-user@adoptasoft.com", role: "dueño" });
    }

    const data = await httpClient.post("/auth/google", { credential });
    localStorage.setItem("adoptasoft_token", data.token);
    return new User(data.user);
  },

  async logout() {
    if (!USE_MOCK) {
      await httpClient.post("/auth/logout").catch(() => {});
    }
    localStorage.removeItem("adoptasoft_token");
  },
};
