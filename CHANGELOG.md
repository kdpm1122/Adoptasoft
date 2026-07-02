# Changelog — Adoptasoft

Registro de cambios importantes del proyecto, en orden cronológico.
Formato: **Problema → Causa raíz → Solución → Archivos tocados**

---

## 1. Foto de perfil no se guardaba al ingresar con Google

**Síntoma:** Al subir una foto de perfil, cerrar sesión y volver a entrar con
"Iniciar sesión con Google", la foto no aparecía (quedaba el ícono genérico).
Con email/contraseña sí funcionaba bien.

**Causa raíz:** El backend tiene dos endpoints de login distintos:
- `/auth/login` (email/contraseña) — sí pedía y devolvía `foto_url`.
- `/auth/google` — el `SELECT` a la base de datos no incluía `foto_url`, y la
  respuesta al frontend tampoco la enviaba. La foto sí se guardaba bien en
  Neon (columna `foto_url` en la tabla `usuarios`), pero el login de Google
  nunca la devolvía de vuelta al frontend.

**Solución:** Se agregó `foto_url` al `SELECT`, al `RETURNING` del `INSERT`,
y se agregó `photoUrl: usuario.foto_url` al objeto `user` de la respuesta.

**Archivo:** `adoptasoft-api-node/handlers/auth/google.js`

---

## 2. Rediseño visual — sombras y elevación (capa 1)

**Objetivo:** Que la interfaz "tuviera vida" sin tocar la paleta de colores
existente (naranja/crema).

**Cambios:**
- Se agregaron tokens de sombra personalizados en Tailwind: `shadow-soft`,
  `shadow-soft-lg`, `shadow-card`, `shadow-card-hover`, `shadow-header`.
- Tarjetas (`StatCard`, `QuickAccessCard`, `PetListItem`, `PatientListItem`,
  `VetListItem`, `UserListItem`, `MedicalRecordItem`, `RoleCard`) ganaron
  elevación sutil (`hover:-translate-y-*` + sombra) al pasar el mouse.
- Botones (`Button.jsx`) ganaron brillo/elevación al interactuar.
- El encabezado (`DashboardLayout`) ganó sombra con tinte del color primario.

**Archivos:** `tailwind.config.js` + varios componentes en
`src/presentation/components/ui/` y `src/presentation/layouts/DashboardLayout.jsx`.

---

## 3. Rediseño visual — perfil Dueño (capa 2)

**Objetivo:** Subir el nivel de "profesional" en la pantalla de Inicio del
Dueño, sin tocar colores.

**Cambios:**
- Tipografía **Fraunces** (serif cálida) para títulos grandes, combinada con
  **Inter** para el resto del texto.
- Panel de bienvenida con degradado (`from-primary to-primary-dark`) y
  formas circulares de fondo (blur), con saludo personalizado
  ("¡Hola, {nombre}! 🐾") y fecha del día.
- Se cambiaron los emojis de las tarjetas de estadísticas y accesos rápidos
  por íconos reales de la librería `lucide-react`.
- `StatCard` ahora acepta un ícono opcional (`icon` prop) sin romper a los
  demás roles que no lo usan.

**Archivos:** `src/index.css`, `tailwind.config.js`,
`src/presentation/components/ui/StatCard.jsx`,
`src/presentation/pages/OwnerDashboardPage.jsx`.

**Dependencia agregada:** `lucide-react`.

---

## 4. Íconos reales en el menú lateral + foto en mini-perfil

**Cambios:**
- `navigation.js` (los 3 roles: Dueño, Veterinario, Admin) pasó de emojis en
  texto a componentes de ícono de `lucide-react`.
- `DashboardLayout` ahora recibe una prop `photoUrl` y la muestra en el
  círculo del mini-perfil (parte inferior del sidebar). Antes ese dato nunca
  se le pasaba desde `OwnerDashboardPage`.

**Archivos:** `src/shared/constants/navigation.js`,
`src/presentation/layouts/DashboardLayout.jsx`,
`src/presentation/pages/OwnerDashboardPage.jsx`.

### 🐛 Bug introducido y corregido en el mismo cambio: pantalla en blanco

**Síntoma:** Tras desplegar el punto anterior, la app cargaba en blanco con
`Uncaught Error: Minified React error #31` en consola.

**Causa raíz:** Los íconos de `lucide-react` no son `typeof === "function"`
(son objetos especiales `forwardRef` de React), así que la validación
`typeof Icon === "function" ? <Icon/> : <span>{item.icon}</span>` caía
siempre al `else` e intentaba renderizar el objeto del ícono directo como
texto — lo cual React no permite.

**Solución:** Como ya no quedaban emojis sueltos en ningún `navigation.js`,
se simplificó a renderizar siempre `<Icon />` sin la validación `typeof`.

**Archivo:** `src/presentation/layouts/DashboardLayout.jsx`

---

## 5. Rediseño visual — Panel Veterinario (capa 3, en curso)

**Objetivo:** Igualar el tratamiento visual del Dueño (héroe con degradado,
tipografía Fraunces, íconos reales, sombras) en el Panel Veterinario.

**Cambios:**
- Panel de bienvenida con degradado y saludo personalizado al veterinario.
- `StatCard` de Citas Hoy / Pacientes Activos / Confirmadas / Pendientes,
  cada una con su ícono correspondiente.
- Accesos rápidos con íconos de `lucide-react`.
- Sección "Mi Agenda" con tarjetas de cita más pulidas (ícono de reloj,
  sombra al hover).

**Archivo:** `src/presentation/pages/VetDashboardPage.jsx`

**Estado:** _pendiente de confirmar build + deploy._

---

## Pendiente

- [ ] Confirmar build y desplegar el Panel Veterinario (punto 5).
- [ ] Aplicar el mismo tratamiento visual al Panel de Administración.
- [ ] Animaciones y transiciones adicionales.
- [ ] Pulir estados vacíos y de carga ("Cargando datos...") en los 3 roles.
- [ ] Rediseño de Login / Registro.

---

## 6. Bug — visor de foto y menú inestables en "Mis Mascotas"

**Síntoma:** Al hacer clic en el avatar de una mascota, el menú "Ver foto /
Cambiar foto" se dibujaba mal si había otra tarjeta cerca (se veía "debajo"
de la siguiente mascota). Y al abrir la foto en grande, esta cambiaba de
tamaño y posición según dónde estuviera el cursor.

**Causa raíz:** Ambos elementos (`menú` y `visor de foto`) usaban
`position: absolute` / `fixed` **dentro** de la tarjeta de la mascota, que
tiene `hover:-translate-y-0.5` (el efecto de elevación). Un elemento `fixed`
dentro de un padre con `transform` deja de posicionarse respecto a toda la
pantalla y pasa a posicionarse respecto a ese padre — por eso "saltaba"
según el hover.

**Solución:** Se usó `createPortal` de React para que el menú y el visor de
foto se dibujen directo en `document.body`, fuera del árbol de la tarjeta.
La posición del menú ahora se calcula manualmente con
`getBoundingClientRect()` del botón que lo abre.

**Archivo:** `src/presentation/components/ui/PetListItem.jsx`
(`PatientListItem.jsx` también recibió el fix del visor de foto de forma
preventiva, aunque no mostraba el bug del menú porque no tiene ese menú).

---

## 7. Rediseño visual — Panel de Administración (capa 3, completado)

**Cambios:** Mismo tratamiento que Dueño y Veterinario: héroe con degradado
y saludo, tarjetas de estadísticas con ícono (`Users`, `Stethoscope`,
`UserRound`, `Activity`), accesos rápidos con íconos reales de
`lucide-react` en vez de emojis.

**Archivo:** `src/presentation/pages/AdminDashboardPage.jsx`

**Con esto, los 3 roles (Dueño, Veterinario, Administrador) quedan con el
mismo lenguaje visual.**

---

## 8. Estados vacíos y de carga en los 3 roles

**Cambios:**
- Nuevo componente `LoadingState.jsx`: loader con 3 puntos animados,
  reemplaza el texto plano "Cargando datos..." en Dueño, Veterinario y Admin.
- Nuevo componente `EmptyState.jsx`: ícono + título + descripción,
  reemplaza mensajes de "vacío" sueltos (agenda sin citas, sin mascotas,
  sin pacientes encontrados, sin veterinarios registrados).

**Archivos:** `src/presentation/components/ui/LoadingState.jsx`,
`src/presentation/components/ui/EmptyState.jsx`, y los 3 `*DashboardPage.jsx`
+ `PetsSection.jsx`, `PatientsSection.jsx`, `VeterinariansSection.jsx`.

---

## 9. Rediseño de Login / Registro

**Objetivo:** Que la pantalla de acceso tuviera el mismo nivel visual que
el resto de la app, sin romper la lógica de autenticación (roles, Google
login, validaciones) que ya funcionaba.

**Cambios principales:**
- Layout de una sola columna con fondo pastel continuo (sin corte de color
  a la mitad de la pantalla): logo + texto centrados a la izquierda,
  tarjeta de login flotando a la derecha — inspirado en el estilo de
  Facebook.
- Logo dentro de un círculo con aro naranja degradado, con un patrón sutil
  de patitas en diagonal de fondo (`opacity-[0.09]`) para dar textura sin
  competir visualmente con el contenido.
- Textos y tamaños con `clamp()` en vez de unidades fijas o 100% `vh`, para
  que el diseño se ajuste suave entre distintos tamaños de pantalla en vez
  de saltar bruscamente o desbordarse.
- `TextField` y `RoleCard` rediseñados: inputs con mejor foco (anillo +
  borde), tarjetas de rol con íconos reales de `lucide-react` y check de
  seleccionado.
- `LoginForm` y `RegisterForm` ahora viven dentro de una tarjeta con borde
  y sombra (`shadow-soft-lg`), en vez de flotar sueltos sobre el fondo.

**Archivos:** `src/presentation/pages/LoginPage.jsx`,
`src/presentation/components/forms/LoginForm.jsx`,
`src/presentation/components/forms/RegisterForm.jsx`,
`src/presentation/components/ui/TextField.jsx`,
`src/presentation/components/ui/RoleCard.jsx`.

---

## Pendiente

- [ ] Pulir el registro para roles Veterinario/Admin (actualmente el
      formulario de registro solo cubre perfil de Dueño).
- [ ] Revisar el recorte del logo circular en pantallas muy angostas
      (móvil) — confirmar que el ícono perro/gato se vea centrado.
- [ ] Animaciones y micro-interacciones adicionales en el resto de la app.
