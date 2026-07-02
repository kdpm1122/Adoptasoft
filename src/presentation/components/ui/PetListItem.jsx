// src/presentation/components/ui/PetListItem.jsx
import { useRef, useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { resizeImageToBase64 } from "../../../shared/utils/imageResize";

const SPECIES_ICON = { Perro: "🐶", Gato: "🐱", Ave: "🐦", Roedor: "🐹", Reptil: "🦎", Otro: "🐾" };

export function PetListItem({ pet, onUploadPhoto }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file || !onUploadPhoto) return;
    setIsUploading(true);
    setError(null);
    try {
      const base64 = await resizeImageToBase64(file);
      await onUploadPhoto(pet.id, base64);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => onUploadPhoto && setMenuOpen((v) => !v)}
            disabled={isUploading}
            className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-warm-cream text-xl
              ${onUploadPhoto ? "cursor-pointer hover:ring-2 hover:ring-primary-light" : ""}`}
          >
            {pet.photoUrl ? (
              <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
            ) : (
              SPECIES_ICON[pet.species] || "🐾"
            )}
            {isUploading && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] text-white">
                ...
              </span>
            )}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
                {pet.photoUrl && (
                  <button
                    type="button"
                    onClick={() => { setLightboxOpen(true); setMenuOpen(false); }}
                    className="block w-full px-3 py-2 text-left text-xs text-text-dark hover:bg-warm-cream"
                  >
                    👁️ Ver foto
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { fileInputRef.current?.click(); setMenuOpen(false); }}
                  className="block w-full px-3 py-2 text-left text-xs text-text-dark hover:bg-warm-cream"
                >
                  📷 Cambiar foto
                </button>
              </div>
            </>
          )}
        </div>

        {onUploadPhoto && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        )}
        <div>
          <p className="font-semibold text-text-dark">{pet.name}</p>
          <p className="text-xs text-text-muted">{pet.summaryLine ? pet.summaryLine() : `${pet.breed}`}</p>
          {error && <p className="text-[10px] text-red-500">{error}</p>}
        </div>
      </div>
      <StatusBadge status={pet.status} />

      {lightboxOpen && pet.photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-6 top-6 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-text-dark"
          >
            ✕ Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
