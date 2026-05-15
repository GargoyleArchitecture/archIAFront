# UI / UX Changelog — ArchIA Frontend

> Registro oficial de cambios de UI, UX y refactors de la capa de presentación del proyecto `archIAFront`.
> Formato: entradas en orden cronológico inverso (lo más nuevo arriba). Cada entrada documenta **qué** cambió, **por qué**, **archivos tocados** y **cómo verificar**.

---

## 2026-05-12 — Iteración 8 · Feedback visible cuando el agente procesa

### Problema
Al enviar un mensaje, la burbuja de respuesta del agente aparecía como un "bloque en blanco" mientras la IA procesaba. La causa: `BubbleMessage` con `isLoading=true` renderizaba `<ResponseSkeleton>` (barras `bg-gray-200` sobre fondo blanco — `--mode-bubble-bg-ai` también es blanco/casi blanco). El contraste resultaba casi nulo y el usuario no sabía si la app había colgado o estaba pensando.

### Cambio
`src/components/molecules/BubbleMessage.jsx`: nuevo `TypingIndicator` interno que reemplaza al skeleton:

- **3 dots** con `animate-bounce` (delay escalonado 0/150/300ms) coloreados con `var(--mode-primary)` → naranja en Tutor, azul brand en Profesional. Pop visible sobre el fondo blanco de la burbuja.
- **Label "Generando respuesta…"** al lado, en `var(--mode-text-secondary)` y `var(--mode-font-body)` para integrarse a la tipografía del modo.
- A11y: `role="status"` + `aria-live="polite"` + `aria-label` descriptivo → lectores de pantalla anuncian el estado.
- `motion-reduce:animate-none` respeta `prefers-reduced-motion`.

Limpieza: removidos del archivo el import de `ResponseSkeleton` y la dependencia de `useMode` (ya no se necesitaba leer el modo en este componente). `ResponseSkeleton` queda intacto como componente independiente — se puede seguir usando en otros contextos (carga de listas, vistas con perfil técnico, etc.).

### Verificación
- `npx vitest run -u BubbleMessage.test.jsx` → snapshot del estado `isLoading` actualizado.
- Suite completa: **221/221 passed**.
- `npx vite build` → OK.
- Manual: enviar mensaje → la burbuja AI muestra de inmediato 3 dots animados + texto "Generando respuesta…". Funciona idéntico en tutor (dots naranja) y profesional (dots azul).

---

## 2026-05-12 — Iteración 7.3 · RadarChart amplía a 100% del container

### Cambio
El SVG del radar "Dominio General" estaba limitado a `maxWidth: 320px` independientemente del ancho disponible — quedaba pequeño y centrado en una card mucho más ancha.

`src/components/organisms/RadarChart.jsx`:
- Default de la prop `size` subido de **320 → 520** (más breathing room).
- Wrapper del SVG: `w-full` → `w-full flex justify-center` (centra el chart en la card).
- `style` del SVG: añadido `width: '100%'` explícito; el `maxWidth` queda como cap visual en 520px para que en pantallas anchas el radar no se vuelva grotesco.

### Verificación
- Aspect ratio 1:1 preservado por `viewBox`.
- Labels con `offset=14` (de `radarMath.buildLabelPosition`) quedan a 209px del centro → dentro de viewBox 0–520. Sin clipping.
- `npx vite build` + `npx vitest run` → 221/221 OK.

---

## 2026-05-12 — Iteración 7.2 · App shell anclado al viewport (raíz del doble-scroll)

### Síntoma
Screenshot del usuario mostraba dos scrollbars verticales en `/profile`: uno externo (window) y uno interno (panel main). La página quedaba "cortada por la mitad" — sidebar y contenido ocupando solo la mitad superior, mitad inferior en blanco.

### Causa raíz
`src/styles/index.css` no declaraba reglas globales para `html`, `body` ni `#root`. Sin esas reglas, el body crece a la altura intrínseca de su contenido. Cualquier descendiente que (por culpa de `min-height: auto` de flexbox, un portal de tooltip, o un overflow no contenido) supere los 100vh, hace que el body se expanda y aparezca el scroll de página. La Iteración 7.1 mitigó parte del problema con `min-h-0` pero no lo cerraba en escenarios donde el contenido del panel era muy alto.

### Fix
`src/styles/index.css` — bloque nuevo:
```css
html, body, #root {
  height: 100%;
  overflow: hidden;
}
```

El **documento ya no scrollea**. Todos los scrolls viven dentro de containers internos:
- `<nav>` de "Recent Chats" en la sidebar (overflow-y-auto + flex-1 min-h-0).
- `<main>` de cada panel (overflow-y-auto + flex-1 min-h-0).
- Modales (overflow-y-auto interno, max-h-[90vh]).

Esto elimina la posibilidad de doble-scrollbar por construcción: si un panel crece, su propio overflow lo absorbe; el body queda fijo a 100% del viewport.

### Verificación
- `npx vite build` → OK.
- `npx vitest run` → **221/221 passed** (sin regresiones).
- Manual: en `/profile` con perfil técnico cargado, solo aparece el scroll del panel central. El body no se mueve, la sidebar y el header del panel permanecen pinned al viewport. Funciona igual en `/projects`, `/projects/:id` y `/` (chat).

### Nota
Este patrón de "shell anclado al viewport + scrolls internos" es estándar en SPAs con sidebar fija. Cualquier vista nueva que se monte dentro de `AppLayout` debe asumir que su contenedor es exactamente 100vh y debe manejar overflow internamente.

---

## 2026-05-12 — Iteración 7.1 · Fix complementario: scroll del profile + SVG warning

### Problemas reportados tras Iter. 7
1. El scroll Y del profile seguía saliéndose de la app.
2. Aparecía un nuevo scroll X cuando el `tenantId` (UUID fallback) era ancho.
3. Console: `<svg> attribute height: Expected length, "auto"`.

### Causas y fixes

**Y-scroll persistente** — `min-h-0` se había añadido solo al `<main>` interno de ProfileView, pero la regla del `min-height: auto` aplica en CADA nivel de la cadena flex. El root de ProfileView (también flex-col + flex-1) podía crecer por encima del padre arrastrando al main fuera de su área visible.
- `src/views/ProfileView.jsx` — añadido `minH="0"` también al `BoxAtom` root.

**X-scroll** — el `ReadOnlyField` que muestra `name`, `email` y `tenant` no rompía palabras largas (UUIDs, mails sin espacios). Sumado a que el grid `md:grid-cols-3` reparte equitativamente, un UUID empujaba la columna y desbordaba.
- `src/views/ProfileView.jsx:ReadOnlyField` — añadidas `break-all` al valor y `min-w-0` al wrapper para permitir que el grid track se encoja por debajo del contenido.

**SVG height="auto"** — el atributo `height` del SVG en `RadarChart` aceptaba sólo longitudes (`100`, `10em`, etc.), no `"auto"`. La keyword `auto` es válida para la *propiedad CSS* `height`, no para el atributo SVG.
- `src/components/organisms/RadarChart.jsx:99` — eliminado `height="auto"` del atributo; el `height: 'auto'` ya se aplicaba via `style` junto a `maxWidth` y `display: 'block'` (la combinación canónica para mantener la proporción del `viewBox`).

### Verificación
- `npx vite build` → OK.
- `npx vitest run` → **221/221 passed** (sin regresiones).
- Manual: en `/profile` el scroll vertical ocurre dentro del `<main>` del panel (no del body). El header del panel ("Mi Perfil" + ModeBadge) queda sticky. Cuando hay un UUID largo en lugar del nombre del tenant, el campo lo parte en líneas sin desbordar la card. Console limpia de warnings de SVG.

---

## 2026-05-12 — Iteración 7 · Pulido post-refactor (3 fixes pequeños)

**Tipo:** Bug fixes y limpieza de UX tras las Iteraciones 4–6.

### Cambios

**1. Sidebar — quitar "My Profile" del medio**
Era redundante: el icono gear (`<TuneIcon />`) en la user card al pie de la sidebar ya navega a `/profile` desde la Iteración 5. Tener dos entradas al mismo destino confundía la jerarquía. Se elimina la entrada del medio y el icono `PersonOutlineIcon` queda sin uso (también removido el import).
- `src/components/templates/AppLayout.jsx` — eliminado el bloque `{features.enableProfileDashboard && (...)}` y el import asociado.

**2. New Chat — siempre devuelve al estado inicial**
*Bug observado:* el botón "New Chat" de la sidebar abría una sesión nueva en el último proyecto activo, persistiendo `activeProjectId` y mostrando ese contexto en lugar del empty state inicial.
*Causa:* el handler tenía un `if (activeProjectId) createSession()` que reusaba el contexto previo.
*Fix:* `handleNewChat` ahora resetea `activeProjectId`, `sessionId`, `pendingChatId` y `activeRoutine` antes de navegar a `/`. Resultado: el botón siempre te lleva a la pantalla inicial (Grid icon + "Select a chat to start" + CTA "Browse Projects").
- `src/components/templates/AppLayout.jsx` — `handleNewChat` reescrito.

**3. Profile — scroll que se salía de la aplicación**
*Bug observado:* en `/profile`, cuando el contenido crecía (Preferencias + 4 secciones del perfil técnico) aparecía un scroll que parecía pertenecer al `<html>`/`<body>` en vez de al panel interno.
*Causa:* el `<main>` interno usaba `flex="1"` + `overflow-y-auto` sin `min-h-0`. Los flex items tienen `min-height: auto` por defecto, lo que les permite crecer al menos hasta el tamaño intrínseco de su contenido — el `overflow-y-auto` no llegaba a activarse y el contenedor desbordaba al ancestro.
*Fix:* añadido `minH="0"` al `<main>` de `ProfileView`. El truco clásico de flexbox: permite que el item se encoja por debajo de su contenido y deja que `overflow-y-auto` haga su trabajo.
- `src/views/ProfileView.jsx` — `<BoxAtom as="main" flex="1" minH="0" className="overflow-y-auto">`.

### Verificación
- `npx vite build` → exitoso, sin nuevas advertencias.
- `npx vitest run` → **221/221 passed** (sin regresiones).
- Manual: la sidebar tiene una sola entrada al profile (gear al pie). Click en "New Chat" desde cualquier sesión activa → empty state inicial limpio. En `/profile`, el scroll ocurre dentro del panel central; el resto de la app (sidebar, header) permanece fijo.

---

## 2026-05-12 — Iteración 6 · SwitchAtom + fix de sizing en MessageInput

**Tipo:** Nuevo átomo + ajuste fino del input principal del chat.
**Objetivos 3 y 4 del refactor de UX.**

### Cambios

**`src/components/atoms/SwitchAtom.jsx`** *(nuevo)*
- Toggle MD3 con track + thumb, mismo patrón "overlay + peer" que `CheckboxAtom`.
- Cuando está activo usa `var(--mode-primary)` → el switch toma automáticamente el naranja del modo Tutor o el azul brand del modo Profesional al togglar `data-mode`.
- Props: `checked`, `onChange`, `disabled`, `label`, `leadingLabel`, `size` (`sm|md`), `id`.
- A11y: `<input type="checkbox" role="switch">` con `aria-checked`/`aria-disabled` propagados, Space/Enter funcionan nativos.

**`src/components/molecules/ModeToggleHint.jsx`** *(nuevo)*
- Wrapper que combina el hint del input ("Enter to send · Shift+Enter for new line") con el SwitchAtom enlazado a `useMode()`.
- Switch lleva `leadingLabel="Profesional"` y `label="Tutor"` para dar contexto visual.
- Gated por `features.enableTutorMode`: si el tenant lo apaga, queda solo el hint.

**`src/components/molecules/MessageInput.jsx`**
- Bug del "aire" en el contenedor: `<SendIcon />` usaba el default de MUI (24px) mientras el textarea va con `--mode-text-body` (14–16px). El icono dictaba la altura.
- Fix: `<SendIcon style={{ fontSize: 'var(--mode-text-body)', lineHeight: 1 }} />` → el icono ahora mide lo mismo que el texto del input.
- Contenedor del input: `items-center` (antes `items-end`) y padding vertical `py-1.5` (antes `py-2`) → la caja queda compacta y alineada con la línea del texto.
- Botón de envío reemplazado de `ButtonAtom variant="icon" size="xs"` por un `<button>` minimalista con `var(--mode-primary)` de color: respeta la paleta del modo activo sin imponer la altura mínima del átomo.
- Nueva prop `footerSlot`: cuando se provee, se renderiza en lugar del hint default. Esto permite que `ChatHomePanel` inyecte el `ModeToggleHint` sin perder la composición.

**`src/components/templates/ChatHomePanel.jsx`**
- El `<MessageInput />` ahora pasa `footerSlot={<ModeToggleHint hint="Enter to send · Shift+Enter for new line" />}` → debajo del input aparece el hint a la izquierda y el switch Tutor/Profesional a la derecha.

### Tests
- Nuevo `src/components/atoms/SwitchAtom.test.jsx` con 6 casos: render, checked, onChange, disabled, labels y aria-checked.
- Suite total tras Iter. 6: **221/221 passed** (vs. 215 antes — 6 tests nuevos, 0 regresiones).

### Verificación manual
- En el chat, el switch debajo del input refleja el modo actual. Toggle → la paleta del chat (burbujas, blockquotes, code inline) cambia al instante junto con el color del propio switch.
- La altura del contenedor del MessageInput es la línea del texto + ~12px de padding. Antes era ~32px de "aire" extra.

---

## 2026-05-12 — Iteración 5 · Profile unificado (Cuenta + Preferencias + Perfil técnico)

**Tipo:** Reorganización UX + extensión menor del backend.
**Objetivo 2 del refactor.**

### Problema
Las preferencias de comunicación vivían en un `Modal` accesible vía el icono gear de la sidebar. El perfil técnico vivía en `/profile`. La info de cuenta del usuario (nombre, correo, organización) no estaba expuesta en ningún lado de la UI autenticada.

### Cambios

**Backend** (`archIABack-Negocio`)
- `src/modules/users/users.service.ts`: nuevo método `findByIdWithTenant(id)` que carga la relación `tenant` además del usuario. No se usa en el hot path de refresh tokens (sigue con `findById`).
- `src/modules/auth/auth.service.ts:getMe`: ahora usa `findByIdWithTenant` → la respuesta de `GET /auth/me` incluye `tenant: { id, name, ... }` además de `tenantId`.

**Frontend**
- `src/hooks/useAuth.jsx`: nuevo `refreshUser()` expuesto en el context. Llama `getMe()` y actualiza el user state — útil tras login (donde el user inicial viene del JWT decode y no incluye relaciones).
- `src/views/ProfileView.jsx`: reescrita con tres secciones verticales:
  1. **AccountCard** — read-only fields (`Nombre`, `Correo`, `Tenant`). El componente refresca el user en mount para asegurar que `tenant.name` esté cargado; fallback a `tenantId` si por cualquier razón el fetch falla.
  2. **PreferencesCard** — `explanationStyle` (FORMAL/ANALOGY/CONCISE) y `verbosity` (LOW/MEDIUM/HIGH) como segmented buttons (`EnumField`) estilizados como campos de formulario del DS, con tooltips descriptivos por opción. Botón "Guardar preferencias" inline + feedback de éxito/error.
  3. **Perfil técnico** — Dominio General · Fortalezas · Debilidades · Curva de Olvido (sin cambios funcionales — mismos estados loading/error/empty/ready y mismos testids `profile-skeleton|ready|empty|error` para preservar tests).
- `src/components/templates/AppLayout.jsx`: eliminado el `<Modal>` de preferencias (y el state asociado). El icono gear `<TuneIcon />` del user card de la sidebar ahora navega a `/profile` (mismo destino que el link "My Profile"). Tooltip actualizado a "Profile · Preferences".

### Decisiones tomadas
- **Preferencias**: form fields con enums siguiendo el DS (no rompe el contrato del backend que valida `FORMAL|ANALOGY|CONCISE` y `LOW|MEDIUM|HIGH`).
- **Tenant**: nombre legible vía relación cargada en `/auth/me`. Fallback a `tenantId` si la respuesta no trae el objeto.

### Verificación
- Test suite frontend: **215/215 passed** (sin regresiones; el test `ProfileView.test.jsx` sigue verde porque no asume estructura DOM externa al testid `profile-ready|empty|skeleton|error`).
- Test suite backend: **58/58 passed**, TypeScript limpio (`tsc --noEmit`).
- Manual: click en gear de la sidebar → navega a `/profile`. Editar preferencias y "Guardar" → confirmación inline, recargar → preferencias persisten. La card de Cuenta muestra `name + email + tenant.name` (o `tenantId` como fallback).

---

## 2026-05-12 — Iteración 4 · Routing embebido con `<Outlet />` (sidebar persistente)

**Tipo:** Refactor estructural de routing y layout.
**Objetivo 1 del refactor.**

### Problema
Cada ruta autenticada (`/`, `/projects`, `/projects/:id`, `/profile`) montaba su propia vista full-page con su propio header e (in algunos casos) ArrowBack. Cada navegación desmontaba la sidebar y re-renderizaba todo. El usuario quería que la sidebar persistiera y solo el contenido central cambiara.

### Cambios

**Estructura nueva**
```
<BrowserRouter>
  <Route element={<ProtectedRoute><AppLayout/></ProtectedRoute>}>
    <Route index                      element={<ChatHomePanel/>} />
    <Route path="projects"            element={<ProjectsView/>} />
    <Route path="projects/:projectId" element={<ProjectDetailView/>} />
    <Route path="profile"             element={<ProfileView/>} />
  </Route>
</BrowserRouter>
```

**Archivos nuevos**
- `src/components/templates/AppLayout.jsx` — shell autenticado. Monta la sidebar (todo el código de navegación, recent chats, user card que vivía en `MainView`), el `useChatManager`, `useProjects`, y un `<Outlet context={...} />` con el state de chat compartido (`activeProjectId`, sesiones, mensajes, `send`, etc.). Sigue conteniendo el Modal de preferencias por compatibilidad con la Iter. 4 — la Iter. 5 lo eliminó.
- `src/components/templates/ChatHomePanel.jsx` — panel default en `/`. Renderiza top bar + ChallengeBlock + ChatContainer + MessageInput + el modal de Project Context. Lee el state vía `useOutletContext()`. Consume `location.state` (chatId, projectId, pendingRoutine) al montar para handover desde otros paneles.

**Archivos refactorizados (in-place)**
- `src/views/ProjectsView.jsx` — quita el wrapper `min-h-screen` y el header full-width con ArrowBack. Ahora renderiza `flex-1 flex flex-col overflow-y-auto` (encaja en el slot del Outlet).
- `src/views/ProjectDetailView.jsx` — mismo cambio en el wrapper.
- `src/views/ProfileView.jsx` — quita ArrowBack y el wrapper `h="screen"`. Mantiene el ModeBadge en el header del panel.
- `src/App.jsx` — reescrito con rutas anidadas dentro de `<AppLayout/>`.
- `src/views/MainView.jsx` — vaciado, queda como `export { default } from '../components/templates/ChatHomePanel'` para back-compat por si algo lo referencia.

### Beneficios observables
- Click en "Projects", "My Profile" o un proyecto detallado → la sidebar no parpadea, solo cambia el contenido central.
- El estado de chat (mensajes en curso, sesión activa, `activeProjectId`) sobrevive a navegaciones entre paneles. Antes se reconstruía cada vez.
- URL-driven: el back/forward del navegador sigue funcionando; F5 monta el layout en la URL correcta.

### Verificación
- `npx vitest run` → **215/215 passed** (cero regresiones).
- `npx vite build` → exitoso, todos los imports resuelven correctamente.
- Manual: navegar entre `/`, `/projects`, `/projects/:id`, `/profile` no remonta la sidebar. La sesión de chat activa se preserva al ir a Projects y volver.

---

## 2026-05-12 — Iteración 3 · Higiene de auth en el backend (CORS + `isActive` en refresh)

**Tipo:** Hardening de backend.
**Severidad:** Media. No bloqueante en dev (Vite proxy lo enmascara), crítico en prod.
**Repositorio:** `archIABack-Negocio` (NestJS).

### Problema
Dos huecos detectados durante la auditoría de la cadena de refresh:

1. **CORS no estaba habilitado** en `src/main.ts`. En dev funcionaba porque Vite proxa `/api` → `localhost:3000` desde el mismo origen del frontend. En staging/prod, donde frontend y backend viven en dominios distintos, las peticiones cross-origin serían bloqueadas por el navegador.
2. **`refreshTokens()` no validaba `user.isActive`.** El handler de login sí lo verifica (`auth.service.ts:84-86`), pero un usuario desactivado podía seguir renovando access tokens durante toda la ventana de su refresh (hasta 7 días) — un agujero de revocación.

### Cambios

**`src/config/app.config.ts`**
- Nuevo `corsOrigins`: parsea `CORS_ORIGINS` (CSV) con tres modos:
  - `*` → permisivo (advertencia en logs, sin credentials).
  - CSV con orígenes → lista explícita con `credentials: true`.
  - Vacío → en dev default `['http://localhost:5173']`; en prod lista vacía (fail-closed con warning).

**`src/main.ts`**
- Configuración de `app.enableCors()` antes del prefijo global. Métodos y `allowedHeaders` (`Authorization`, `Content-Type`) explícitos. Se loguea el modo elegido al arrancar.

**`src/modules/auth/auth.service.ts`**
- En `refreshTokens()`, tras verificar que el usuario existe y tiene `hashedRefreshToken`, añadido `if (!user.isActive)` que:
  - Setea `hashedRefreshToken = null` en BD (invalida todas las sesiones activas del usuario).
  - Lanza `ForbiddenException('Account is deactivated')`.

**`.env.example`**
- Nueva variable documentada: `CORS_ORIGINS` con ejemplos para dev/staging/prod.

### Verificación
1. **Compilación TS**: `npx tsc --noEmit -p tsconfig.json` → sin errores.
2. **Test suite del backend**: `npx jest` → **58/58 specs pasan**.
3. **Manual CORS**:
   - `CORS_ORIGINS=http://localhost:5173 npm run start:dev` → log `CORS habilitado para: http://localhost:5173`.
   - Desde el frontend (otro origen distinto al configurado) → preflight devuelve 403/no headers → consola del navegador muestra el bloqueo esperado.
4. **Manual `isActive`**:
   - Login normal, anotar el refresh token.
   - En BD: `UPDATE users SET "isActive" = false WHERE id = '...'`.
   - Llamar `POST /api/v1/auth/refresh` con ese refresh → `403 Forbidden — Account is deactivated`. Verificar que `hashedRefreshToken` quedó en `NULL`.
   - Cualquier intento posterior con el mismo refresh → `403 Access denied` (ya invalidado).

### Notas para deploy
Cada entorno que despliegue el backend tras este cambio debe definir `CORS_ORIGINS`. Sin definirlo en producción, los logs avisan al arrancar pero el server queda **sin CORS** — los clientes externos al mismo origen verán fallos. Es intencional: mejor un fallo loud que un servidor abierto.

---

## 2026-05-12 — Iteración 2 · Auto-refresh ante 401 y unificación de la capa HTTP

**Tipo:** Refactor estructural + mejora de UX (resiliencia de sesión).
**Severidad:** Alta — sin esto el access token de 15 min expulsa al usuario a mitad de navegación.

### Problema
Tras la Iteración 1 la rotación queda íntegra, pero seguían dos huecos:

1. **No había auto-refresh durante la sesión.** El refresh solo se intentaba al montar `AuthProvider`. Si el access token de 15 min expiraba mientras el usuario navegaba, cualquier `GET /projects`, `GET /chats/...`, etc. devolvía un 401 visible y rompía la UX.
2. **Seis servicios duplicaban el wrapper `request()`** con su propia lectura de localStorage y su propia base URL. Una corrección como la de la Iteración 1 tenía que aplicarse seis veces y era fácil olvidarse.
3. **Carreras potenciales:** múltiples llamadas concurrentes que vencieran a la vez (o el doble disparo de `useEffect` en React StrictMode) podían lanzar varios refresh simultáneos contra el endpoint, agotando la rotación.

### Cambios

**Nuevo módulo central** — `front/src/services/http.js`:

- `API_BASE` único (antes duplicado en 6 archivos).
- `STORAGE_KEYS` y helpers `getAccessToken / getRefreshToken / setTokens / clearTokens`.
- `refreshAccessToken()` con **singleton in-flight promise**: si ya hay un refresh en curso, todas las llamadas concurrentes esperan al mismo. Persiste `accessToken` **y** `refreshToken` (refuerza el fix de Iteración 1). Si el refresh falla, limpia storage y dispara `archia:auth:expired` en `window`.
- `authorizedFetch(url, opts)`: inyecta `Authorization: Bearer <access>` y, ante un `401` con refresh disponible, refresca y **reintenta la petición una vez** de forma transparente.
- `apiRequest(url, opts)`: wrapper JSON. Devuelve `json?.data ?? json` y lanza `Error` con `.status`.

**Servicios refactorizados** (todos consumen `apiRequest` de `http.js`):

- `front/src/services/authService.js` — `login` / `register` ahora persisten tokens vía `setTokens()`; `logout` y `getMe` se simplifican (sin pasar el token como argumento).
- `front/src/services/projectService.js`, `profileService.js`, `userService.js`, `preferenceService.js` — eliminados los 4 wrappers `request()` duplicados.
- `front/src/services/featuresService.js` — usa `apiRequest`; conserva el fallback optimista a `DEFAULT_FEATURES`.
- `front/src/services/chatService.js` — el `apiRequest` interno (para Backend Negocio) ahora se importa de `http.js`. El streaming SSE a `AI_BASE` (Backend IA, otro dominio) **se deja con fetch manual** intencionalmente: ese backend no comparte tokens de refresh con Negocio.
- `front/src/services/telemetryService.js` — centraliza la lectura del token; mantiene `fetch` plano (NO `authorizedFetch`) para no disparar un refresh-on-401 por un fallo silencioso de logging.

**Hook de auth** — `front/src/hooks/useAuth.jsx`:

- `init()` reducido a un único `getMe()`: como `authorizedFetch` resuelve internamente el 401 → refresh → retry, el hook ya no necesita orquestar el refresh manualmente.
- Nuevo listener de `archia:auth:expired`: si un refresh falla a mitad de sesión, el usuario se desloguea automáticamente y se redirige vía `ProtectedRoute`.
- `clearStorage` reemplazado por el `clearTokens` central.

### Beneficios observables

| Escenario | Antes | Ahora |
|---|---|---|
| Access expira navegando | 401 visible, UX rota | 401 → refresh transparente → retry → 200 |
| 3 llamadas concurrentes tras access expirado | 3 refresh contra `/auth/refresh` | 1 refresh, las 3 esperan al mismo |
| Refresh falla (token revocado/caducado) | Estado inconsistente | `clearTokens` + redirect a `/login` automático |
| Tocar el contrato `/auth/refresh` | Modificar 6 servicios | Un solo archivo (`http.js`) |

### Verificación

1. **Test suite**: `npx vitest run` → **215/215 passed** (sin regresiones).
2. **Manual — refresh transparente**:
   - Login. En DevTools eliminar `archia.accessToken` y navegar a `/projects`.
   - Network tab debe mostrar: `GET /projects → 401` → `POST /auth/refresh → 200` → reintento `GET /projects → 200`. Sin redirect a login.
3. **Manual — singleton in-flight**:
   - Eliminar `archia.accessToken` y abrir 3 pestañas que carguen en paralelo.
   - Network agregada de las 3 pestañas: **una sola** llamada a `/auth/refresh`, no tres.
4. **Manual — auto-logout**:
   - Manipular `archia.refreshToken` para que sea inválido. Hacer cualquier acción que cause 401.
   - Tras el refresh fallido, el usuario debe quedar deslogueado y `ProtectedRoute` redirigir a `/login`.

### Pendiente (Iteración 3, opcional — backend)

- `archIABack-Negocio/src/main.ts`: habilitar CORS explícitamente para los orígenes del frontend en prod/staging.
- `archIABack-Negocio/src/modules/auth/auth.service.ts:refreshTokens`: rechazar refresh si `user.isActive === false`.

---

## 2026-05-12 — Iteración 1 · Fix: persistencia del refresh token rotado

**Tipo:** Bug fix (capa de auth, no estrictamente UI — se registra por trazabilidad).
**Severidad:** Alta. Provocaba expulsión silenciosa del usuario tras la primera rotación de token.

### Problema
El backend (`archIABack-Negocio`) implementa rotación de refresh tokens en cada llamada exitosa a `POST /api/v1/auth/refresh`: regenera el `bcrypt(hashedRefreshToken)` en BD y descarta el anterior. La respuesta incluye **ambos** tokens (`accessToken` + `refreshToken`).

El frontend solo persistía el `accessToken` nuevo en `useAuth.jsx`. El `refreshToken` rotado quedaba en localStorage con el valor original del login. Al siguiente intento de refresh:

- Si el JWT seguía vigente → `bcrypt.compare` fallaba → **403 Forbidden**.
- Si el JWT ya había caducado (>7d, default `JWT_REFRESH_EXPIRES_IN`) → passport-jwt lo rechazaba → **401 Unauthorized**.

### Cambios
- `front/src/hooks/useAuth.jsx` — al recibir la respuesta de `refreshToken()`, persistir también `result.refreshToken` cuando viene.
- `front/src/services/authService.js` — corregido el JSDoc de `refreshToken()`: el contrato real es `{ accessToken, refreshToken }`, no solo `accessToken`. Se añade nota sobre rotación para evitar regresiones.

### Verificación
1. Login en `/login`. Anotar `archia.refreshToken` en DevTools → Application → localStorage.
2. Eliminar `archia.accessToken` y recargar → el hook llama `/auth/refresh`. Confirmar que `archia.refreshToken` **ahora cambia** tras la respuesta 200.
3. Repetir el ciclo 3 veces seguidas → todas las llamadas devuelven 200 y los valores rotan correctamente.

### Pendiente para la siguiente iteración
- Centralizar el manejo de tokens en un `tokenManager` con singleton in-flight (evitar carreras de StrictMode y refrescos simultáneos).
- Crear `services/http.js` con `authorizedFetch` que reintente automáticamente en 401 a mitad de sesión.
- Unificar los 5 wrappers `request()` duplicados (`authService`, `chatService`, `projectService`, `profileService`, `userService`, `featuresService`).
