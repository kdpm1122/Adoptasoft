// src/domain/entities/User.js

export const ROLES = Object.freeze({
  OWNER: "dueño",
  VET: "veterinario",
  ADMIN: "admin",
});

export class User {
  constructor({ id, email, role, name, photoUrl }) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.name = name;
    this.photoUrl = photoUrl;
  }

  isOwner() {
    return this.role === ROLES.OWNER;
  }

  isVet() {
    return this.role === ROLES.VET;
  }

  isAdmin() {
    return this.role === ROLES.ADMIN;
  }

  static isValidRole(role) {
    return Object.values(ROLES).includes(role);
  }
}
