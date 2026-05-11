# archIAFront

Frontend de ArchIA — React 19 + Vite 6 + Tailwind CSS 4 + React Router v7. Atomic Design, theming dual Tutor / Profesional (F6), Dashboard de perfil técnico (F8), retos pedagógicos (F9), feature flags por tenant (F11-T5) y telemetría (F11-T6).

---

## Requisitos previos

- Node.js 20.x
- npm 10.x

---

## Setup inicial

```powershell
npm install

# Copiar env si existe ejemplo (sino crear .env.local)
# VITE_API_BASE apunta al Backend Negocio (default: '' → '/api/v1')

npm run dev
```

App disponible en `http://localhost:5173`.

---

## Comandos

```powershell
npm run dev          # Dev server con hot-reload
npm run build        # Producción → dist/
npm run preview      # Servir el build local
npm test             # Suite Vitest (215+ tests)
npm test -- a11y     # Solo auditoría axe-core (F11-T3)
npm run lint         # ESLint
```

---

## Estructura

```
src/
├── App.jsx                    # Rutas + providers (Auth, Features, Mode)
├── components/
│   ├── atoms/                 # Box, Text, Button, Tooltip, Skeleton, MonoTag, etc.
│   ├── molecules/             # MessageInput, BubbleMessage, ChallengeBlock,
│   │                          # StrengthChip, WeaknessActionCard, RoutineProgressBar, …
│   └── organisms/             # MarkdownRenderer, RadarChart, AgentMessageDispatcher
├── contexts/
│   ├── ModeContext.jsx        # F1-T5 — tutor / professional + data-mode en <html>
│   └── FeaturesContext.jsx    # F11-T5 — flags por tenant
├── data/
│   └── agentJsonMap.js        # F10-T1 — catálogo Agente → Atomic Design
├── hooks/
│   ├── useAuth.jsx            # JWT login/logout
│   ├── useKeyboardShortcuts.js # F6-T5 — Ctrl+M, Ctrl+K, Ctrl+/
│   └── useTelemetry.js        # F11-T6 — wrapper de emit
├── services/
│   ├── chatService.js         # POST /message (SSE)
│   ├── profileService.js      # GET /users/:id/profile, POST /routines/generate
│   ├── featuresService.js     # F11-T5 — GET /tenants/me/features
│   └── telemetryService.js    # F11-T6 — POST /telemetry batched
├── utils/
│   ├── profileHydration.js    # hydrateNames, humanizeDelta
│   └── radarMath.js           # polarToCartesian, pickTop6ByLastSeen
├── views/
│   ├── LoginView.jsx
│   ├── MainView.jsx           # Shell con sidebar + chat
│   ├── ProfileView.jsx        # F8 — Dashboard "Mi Perfil Técnico"
│   ├── ChatView.jsx           # Vista standalone del chat
│   ├── ProjectsView.jsx
│   └── ProjectDetailView.jsx
├── styles/
│   └── tokens.css             # Tokens semánticos + [data-mode] dual
└── test/
    ├── setup.js
    ├── renderWithMode.jsx
    └── a11y.test.jsx          # F11-T3 — axe-core
```

---

## Atajos de teclado (F6-T5)

| Atajo | Acción |
|---|---|
| `Ctrl+M` / `Cmd+M` | Toggle modo Tutor ↔ Profesional |
| `Ctrl+K` / `Cmd+K` | Foco en el input del chat |
| `Ctrl+/` / `Cmd+/` | Paleta de comandos (placeholder F11+) |

---

## Theming (F6-T3 / F6-T4)

El atributo `data-mode="tutor"|"professional"` en el `<html>` conmuta los tokens CSS bajo `[data-mode="..."]`. Cada componente consume `var(--mode-*)` y nunca colores brand directos. Ver [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) sección 8-11.

---

## Feature flags (F11-T5)

`FeaturesContext` carga `GET /tenants/me/features` al mount. Flags soportados:

| Flag | Apaga... |
|---|---|
| `enableTutorMode` | Botón Tutor en `ModeSwitcher` queda disabled; usuarios con tutor persistido se rescatan a professional |
| `enableProfileDashboard` | Sidebar oculta "My Profile"; `/profile` muestra mensaje "deshabilitado" |
| `enableRoutines` | `ChallengeBlock` no se renderiza; `WeaknessActionCard` se sustituye por pills read-only |

Política optimista: si fetch falla, todos los flags caen a `true` (no romper UX).

---

## Telemetría (F11-T6)

`useTelemetry()` o `emit()` directo. Eventos canónicos:

- `mode_changed`
- `mode_suggestion_accepted`
- `profile_viewed`
- `weakness_action_clicked`
- `routine_generated`

Batched + debounce (5 eventos o 1.5s) → `POST /telemetry`. Fire-and-forget. Ver [`../../docs/observability.md`](../../docs/observability.md).

---

## Accesibilidad (F11-T3)

```powershell
npm test -- a11y
```

Suite axe-core sobre `ProfileView` (ready + empty) y `ChallengeBlock`. Cero issues nivel A. Auditoría completa en [`../../docs/a11y_audit.md`](../../docs/a11y_audit.md).

---

## Documentación adicional

- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — Atomic Design, tokens, theming, catálogo de componentes.
- [`../../docs/architecture.md`](../../docs/architecture.md) — arquitectura global de los 3 repos.
- [`../../docs/endpoints.md`](../../docs/endpoints.md) — inventario consolidado de endpoints.
- [`../../docs/observability.md`](../../docs/observability.md) — telemetría y métricas.
- [`../../docs/a11y_audit.md`](../../docs/a11y_audit.md) — auditoría de accesibilidad.
- [`../../docs/Tracking_Maestro.md`](../../docs/Tracking_Maestro.md) — historial completo de fases.
