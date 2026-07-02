// src/infrastructure/repositories/authRepository.js
import { httpClient } from "../api/httpClient";
import { User } from "../../domain/entities/User";

// Modo mock: mientras no exista backend, simula el login localmente.
// Se activa automáticamente si no hay VITE_API_URL definida, o forzando VITE_USE_MOCK_AUTH=true
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === "true" || !import.meta.env.VITE_API_URL;

const USER_KEY = "adoptasoft_user";

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? new User(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

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
      const user = await mockLogin({ email, role });
      saveUser(user);
      return user;
    }

    const data = await httpClient.post("/auth/login", { email, password, role });
    localStorage.setItem("adoptasoft_token", data.token);
    const user = new User(data.user);
    saveUser(user);
    return user;
  },

  async register({ fullName, email, password, phone, document }) {
    const data = await httpClient.post("/usuarios/registrar", { fullName, email, password, phone, document });
    localStorage.setItem("adoptasoft_token", data.token);
    const user = new User(data.user);
    saveUser(user);
    return user;
  },

  async loginWithGoogle(credential) {
    if (USE_MOCK) {
      console.warn("[authRepository] Usando login con Google MOCK — no hay backend conectado todavía.");
      const user = await mockLogin({ email: "google-user@adoptasoft.com", role: "dueño" });
      saveUser(user);
      return user;
    }

    const data = await httpClient.post("/auth/google", { credential });
    localStorage.setItem("adoptasoft_token", data.token);
    const user = new User(data.user);
    saveUser(user);
    return user;
  },

  async logout() {
    if (!USE_MOCK) {
      await httpClient.post("/auth/logout").catch(() => {});
    }
    localStorage.removeItem("adoptasoft_token");
    localStorage.removeItem(USER_KEY);
  },

  getStoredUser,
  saveUser,
};
