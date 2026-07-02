// src/presentation/layouts/DashboardLayout.jsx
import { useState } from "react";

export function DashboardLayout({ subtitle, roleLabel, roleIcon, photoUrl, navItems, activeNav, onNavigate, onLogout, children }) {
  // Sidebar visible por defecto en escritorio. En móvil arranca cerrado
  // (antes ni siquiera existía la opción de abrirlo ahí).
  const [isMenuOpen, setIsMenuOpen] = useState(() => window.innerWidth >= 768);

  function handleNavigate(key) {
    onNavigate(key);
    // En pantallas chicas, cerrar el menú al elegir una opción
    if (window.innerWidth < 768) setIsMenuOpen(false);
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-warm-cream">
      <header className="flex items-center justify-between bg-gradient-to-r from-primary to-primary-dark px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            className="rounded-lg px-2 py-1 text-xl transition-colors hover:bg-white/15"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">🐾</div>
          <div>
            <p className="font-bold leading-tight">Adoptasoft</p>
            <p className="text-[10px] uppercase tracking-wide text-white/80">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            {roleIcon} {roleLabel}
          </span>
          <button
            onClick={onLogout}
            className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
          >
            ⎋ Salir
          </button>
        </div>
      </header>

      <div className="relative flex flex-1">
        {isMenuOpen && (
          <>
            {/* Fondo oscuro detrás del menú, solo en móvil, para cerrar tocando afuera */}
            <div
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-10 bg-black/30 md:hidden"
              aria-hidden="true"
            />

            <aside className="absolute inset-y-0 left-0 z-20 flex w-60 flex-col justify-between border-r border-border bg-warm-cream px-4 py-6 shadow-xl md:static md:z-auto md:shadow-none">
              <div>
                <p className="mb-3 px-2 text-xs font-semibold tracking-wide text-text-muted">NAVEGACIÓN</p>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleNavigate(item.key)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors
                        ${activeNav === item.key
                          ? "border border-primary bg-white text-primary"
                          : "text-text-dark hover:bg-white/60"
                        }`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-primary-light/30 px-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-white">
                  {photoUrl ? <img src={photoUrl} alt={roleLabel} className="h-full w-full object-cover" /> : roleIcon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-dark">{roleLabel}</p>
                  <p className="text-xs text-text-muted">Sesión activa</p>
                </div>
              </div>
            </aside>
          </>
        )}

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
