// src/App.jsx
import { useState } from "react";
import { LoginPage } from "./presentation/pages/LoginPage";
import { VetDashboardPage } from "./presentation/pages/VetDashboardPage";
import { AdminDashboardPage } from "./presentation/pages/AdminDashboardPage";
import { OwnerDashboardPage } from "./presentation/pages/OwnerDashboardPage";
import { ResetPasswordForm } from "./presentation/components/forms/ResetPasswordForm";
import { ROLES } from "./domain/entities/User";
import { authRepository } from "./infrastructure/repositories/authRepository";

function getResetTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("resetToken");
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [resetToken, setResetToken] = useState(getResetTokenFromUrl);

  function handleLoginSuccess(user) { setCurrentUser(user); }

  function handleLogout() {
    authRepository.logout();
    setCurrentUser(null);
  }

  function handlePhotoChange(photoUrl) {
    setCurrentUser((prev) => (prev ? { ...prev, photoUrl } : prev));
  }

  function handleResetDone() {
    setResetToken(null);
    window.history.replaceState({}, "", window.location.pathname);
  }

  if (resetToken) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-warm-bg px-6">
        <div className="w-full max-w-md">
          <ResetPasswordForm token={resetToken} onDone={handleResetDone} />
        </div>
      </div>
    );
  }

  if (!currentUser) return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  if (currentUser.role === ROLES.VET) return <VetDashboardPage doctorName={currentUser.name} currentUser={currentUser} onLogout={handleLogout} onPhotoChange={handlePhotoChange} />;
  if (currentUser.role === ROLES.ADMIN) return <AdminDashboardPage currentUser={currentUser} onLogout={handleLogout} onPhotoChange={handlePhotoChange} />;
  return <OwnerDashboardPage currentUser={currentUser} onLogout={handleLogout} onPhotoChange={handlePhotoChange} />;
}

export default App;
