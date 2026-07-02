// src/presentation/layouts/DashboardLayout.jsx
import { useState } from "react";

export function DashboardLayout({ subtitle, roleLabel, roleIcon, photoUrl, navItems, activeNav, onNavigate, onLogout, children }) {
  // Sidebar visible por defecto en escritorio. En móvil arranca cerrado.
  const [isMenuOpen, setIsMenuOpen] = useState(() => window.innerWidth >= 768);

  function handleNavigate(key) {
    onNavigate(key);
    if (window.innerWidth < 768) setIsMenuOpen(false);
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-warm-cream">
      <header className="relative z-30 flex items-center justify-between bg-gradient-to-r from-primary to-primary-dark px-6 py-4 text-white shadow-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            className="rounded-lg px-2 py-1 text-xl transition-colors active:scale-95"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg shadow-sm">🐾</div>
          <div>
            <p className="font-bold leading-tight">Adoptasoft</p>
            <p className="text-[10px] uppercase tracking-wide text-white/80">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold shadow-sm">
            {roleIcon} {roleLabel}
          </span>
          <button
            onClick={onLogout}
            className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold transition-colors hover:bg-white/25 active:scale-95"
          >
            ⎋ Salir
          </button>
        </div>
      </header>

      <div className="relative flex flex-1">
        {/* Fondo oscuro detrás del menú en móvil, con fundido */}
        <div
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 z-10 bg-black/30 transition-opacity duration-300 md:hidden
            ${isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        />

        {/* Sidebar: siempre montado, se desliza dentro/fuera con transform */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 flex w-60 flex-col justify-between border-r border-border bg-warm-cream px-4 py-6 shadow-xl transition-transform duration-300 ease-out
            md:static md:z-auto md:shadow-card md:transition-none
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <div>
            <p className="mb-3 px-2 text-xs font-semibold tracking-wide text-text-muted">NAVEGACIÓN</p>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavigate(item.key)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200 ease-out active:scale-[0.97]
                      ${activeNav === item.key
                        ? "border border-primary bg-white text-primary shadow-sm"
                        : "text-text-dark hover:bg-white/60 hover:translate-x-0.5"
                      }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.25} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-primary-light/30 px-3 py-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-white shadow-sm">
              {photoUrl ? <img src={photoUrl} alt={roleLabel} className="h-full w-full object-cover" /> : roleIcon}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">{roleLabel}</p>
              <p className="text-xs text-text-muted">Sesión activa</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-6 py-8">
          <div key={activeNav} className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
