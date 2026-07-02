// src/App.jsx
import { useState } from "react";
import { LoginPage } from "./presentation/pages/LoginPage";
import { VetDashboardPage } from "./presentation/pages/VetDashboardPage";
import { AdminDashboardPage } from "./presentation/pages/AdminDashboardPage";
import { OwnerDashboardPage } from "./presentation/pages/OwnerDashboardPage";
import { ROLES } from "./domain/entities/User";
import { authRepository } from "./infrastructure/repositories/authRepository";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  function handleLoginSuccess(user) { setCurrentUser(user); }

  function handleLogout() {
    authRepository.logout();
    setCurrentUser(null);
  }

  function handlePhotoChange(photoUrl) {
    setCurrentUser((prev) => (prev ? { ...prev, photoUrl } : prev));
  }

  if (!currentUser) return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  if (currentUser.role === ROLES.VET) return <VetDashboardPage doctorName={currentUser.name} currentUser={currentUser} onLogout={handleLogout} onPhotoChange={handlePhotoChange} />;
  if (currentUser.role === ROLES.ADMIN) return <AdminDashboardPage currentUser={currentUser} onLogout={handleLogout} onPhotoChange={handlePhotoChange} />;
  return <OwnerDashboardPage currentUser={currentUser} onLogout={handleLogout} onPhotoChange={handlePhotoChange} />;
}

export default App;
