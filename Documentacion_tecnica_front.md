# ArchIA Frontend — Documentación Técnica (v1)

> **Versión**: 1.0
> **Fecha**: Abril 2026
> **Tipo de documento**: Especificación Técnica de Arquitectura Frontend Completa
> **Repositorio**: `archIAFront`

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Stack Tecnológico y Dependencias](#2-stack-tecnológico-y-dependencias)
3. [Arquitectura General](#3-arquitectura-general)
4. [Sistema de Diseño — Design Tokens](#4-sistema-de-diseño--design-tokens)
5. [Atoms — Componentes Primitivos](#5-atoms--componentes-primitivos)
6. [Molecules — Componentes Compuestos](#6-molecules--componentes-compuestos)
7. [Organisms — Componentes Complejos](#7-organisms--componentes-complejos)
8. [Vistas Principales](#8-vistas-principales)
9. [Gestión de Estado — useChatManager](#9-gestión-de-estado--usechatmanager)
10. [Capa de Servicios — chatService](#10-capa-de-servicios--chatservice)
11. [DiagramViewer](#11-diagramviewer)
12. [Configuración y Build](#12-configuración-y-build)
13. [Variables de Entorno](#13-variables-de-entorno)
14. [Jerarquía de Archivos](#14-jerarquía-de-archivos)

---

## 1. Introducción

### 1.1 Propósito del Frontend

El frontend de **ArchIA** es la interfaz gráfica del asistente inteligente de diseño de arquitectura de software. Provee al usuario una experiencia conversacional basada en chat donde puede:

| Capacidad                     | Descripción                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------- |
| **Chat con ArchIA**           | Conversación en lenguaje natural para diseño arquitectónico bajo metodología ADD 3.0 |
| **Visualización de Diagramas**| Renderizado de diagramas Graphviz SVG generados por el backend                    |
| **Exportación de Diagramas**  | Descarga en formatos SVG, DOT, DOT-DrawIO y DrawIO XML                            |
| **Historial de Sesiones**     | Persistencia local de conversaciones por sesión (localStorage)                   |
| **Adjuntos de Imagen**        | Envío de hasta 2 imágenes por mensaje para análisis contextual                    |
| **Feedback por Mensaje**      | Valoración thumbs-up / thumbs-down de cada respuesta del asistente               |

### 1.2 Paradigma de Interfaz

La interfaz sigue el patrón **Atomic Design** (Atoms → Molecules → Organisms → Views) con separación estricta entre:

- **Componentes visuales**: sin lógica de negocio, reciben estado vía props
- **Hooks**: lógica y estado encapsulados y reutilizables
- **Servicios**: comunicación HTTP con el backend, completamente separada de la UI

### 1.3 Integración con el Backend

El frontend se conecta al backend FastAPI mediante tres endpoints REST. Toda la comunicación asíncrona se realiza via `fetch` nativo desde `chatService.js`. No existe WebSocket ni streaming — las respuestas son síncronas (request/response completo).

---

## 2. Stack Tecnológico y Dependencias

### 2.1 Dependencias de Producción

| Paquete                      | Versión  | Rol                                                            |
| ---------------------------- | -------- | -------------------------------------------------------------- |
| `react`                      | 19.0.0   | Framework de UI principal                                      |
| `react-dom`                  | 19.0.0   | Binding DOM de React                                           |
| `@mui/icons-material`        | 6.4.3    | Iconos SVG de Material Design (sin usar componentes MUI)       |
| `@mui/material`              | 6.4.3    | Instalado como peer dep de icons (no se usa directamente)      |
| `@emotion/react`             | 11.14.0  | CSS-in-JS (requerido por MUI, no usado en código propio)       |
| `@emotion/styled`            | 11.14.0  | CSS-in-JS (requerido por MUI, no usado en código propio)       |
| `react-markdown`             | 10.1.0   | Renderizado de Markdown en respuestas del asistente            |
| `remark-gfm`                 | 4.0.1    | Plugin GFM: tablas, tachado, listas de tareas                  |
| `rehype-raw`                 | 7.0.0    | Permite HTML literal dentro del Markdown                       |
| `react-syntax-highlighter`   | 16.1.1   | Resaltado de sintaxis en bloques de código (motor Prism)       |

### 2.2 Dependencias de Desarrollo

| Paquete                      | Versión  | Rol                                                     |
| ---------------------------- | -------- | ------------------------------------------------------- |
| `vite`                       | 6.1.0    | Bundler y servidor de desarrollo                        |
| `@vitejs/plugin-react`       | 4.3.4    | JSX transform y React Fast Refresh (HMR)                |
| `tailwindcss`                | 4.2.1    | Framework CSS de utilidades                             |
| `@tailwindcss/postcss`       | 4.2.2    | Plugin PostCSS para Tailwind v4                         |
| `postcss`                    | 8.x      | Procesador CSS                                          |
| `autoprefixer`               | 10.4.27  | Prefijos CSS automáticos (manejados por Lightning CSS)  |
| `eslint`                     | 9.19.0   | Linter de JavaScript                                    |
| `eslint-plugin-react`        | 7.37.4   | Reglas ESLint específicas para React                    |
| `eslint-plugin-react-hooks`  | 5.0.0    | Reglas de hooks (exhaustive-deps)                       |
| `eslint-plugin-react-refresh`| 0.4.19   | Advertencias para compatibilidad con HMR                |

### 2.3 Scripts NPM

```json
{
  "dev":     "vite",           // Servidor de desarrollo (localhost:5173)
  "build":   "vite build",     // Build de producción → dist/
  "preview": "vite preview",   // Preview del build de producción
  "lint":    "eslint ."        // Análisis estático de código
}
```

---

## 3. Arquitectura General

### 3.1 Diagrama de Capas

```
┌─────────────────────────────────────────────────────────┐
│                         VISTAS                          │
│              ChatView  /  AtomShowcase  /  MoleculeShowcase │
├─────────────────────────────────────────────────────────┤
│                       ORGANISMS                         │
│                    MarkdownRenderer                     │
├─────────────────────────────────────────────────────────┤
│                       MOLECULES                         │
│   BubbleMessage · MessageInput · Sidebar · Modal · ...  │
├─────────────────────────────────────────────────────────┤
│                        ATOMS                            │
│  ButtonAtom · TextAtom · BoxAtom · InputAtom · ...      │
├───────────────────────┬─────────────────────────────────┤
│       HOOKS           │         SERVICIOS               │
│   useChatManager      │       chatService               │
├───────────────────────┴─────────────────────────────────┤
│              DESIGN TOKENS (CSS Custom Properties)      │
│         tokens.css  ←→  tailwind.config.js              │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Datos

```
Usuario escribe mensaje
       │
       ▼
MessageInput (componente)
       │  onSend(text, images)
       ▼
ChatView (orquestador)
       │  send(text, images)       ← useChatManager
       ▼
chatService.sendMessage()          ← POST /message
       │
       ▼
Backend FastAPI
       │  { endMessage, messages, suggestions }
       ▼
useChatManager actualiza estado
       │  messages[]
       ▼
ChatView re-renderiza
       │
       ▼
BubbleMessage + MarkdownRenderer
```

### 3.3 Enrutamiento

El enrutamiento actual es un **switcher de estado** simple en `App.jsx`. No se usa ninguna librería de routing (no React Router).

```jsx
// App.jsx
const [view, setView] = useState('demo')
// 'atoms'     → AtomShowcase
// 'molecules' → MoleculeShowcase
// 'demo'      → ChatView (vista principal, default)
```

La navegación entre vistas ocurre via callbacks `onNavigate` pasados como props. El flujo principal del usuario siempre parte en `demo` (ChatView).

### 3.4 Persistencia de Estado

Todo el estado de conversación se persiste en **localStorage** del navegador. No hay backend de sesión — la sesión de LangGraph del backend es referenciada únicamente por `sessionId`.

| Clave localStorage         | Contenido                                          |
| -------------------------- | -------------------------------------------------- |
| `arquia.sessions`          | Array JSON de `{ id, title, createdAt }`           |
| `arquia.chat.{sessionId}`  | Array JSON de mensajes de la sesión correspondiente |

---

## 4. Sistema de Diseño — Design Tokens

### 4.1 Fuente Única de Verdad

El sistema de diseño parte de **CSS Custom Properties** definidas en `src/styles/tokens.css`. Estos tokens son consumidos por Tailwind v4 vía `@theme inline` en `src/styles/index.css`, lo que genera las clases utilitarias de Tailwind correspondientes.

```
tokens.css  →  @theme inline (index.css)  →  tailwind.config.js  →  clases Tailwind
```

### 4.2 Tipografía

**Familias Tipográficas:**

| Token CSS             | Familia          | Uso                                 |
| --------------------- | ---------------- | ----------------------------------- |
| `--font-serif`        | Roboto Serif     | Títulos y encabezados               |
| `--font-sans`         | Roboto Mono      | Texto de interfaz (cuerpo, labels)  |
| `--font-mono`         | JetBrains Mono   | Bloques de código                   |

> **Nota**: `--font-sans` contiene Roboto Mono, lo cual es inusual pero intencional según el diseño del sistema.

**Pesos:**

| Token CSS               | Valor |
| ----------------------- | ----- |
| `--font-weight-regular` | 400   |
| `--font-weight-medium`  | 500   |
| `--font-weight-semibold`| 600   |
| `--font-weight-bold`    | 700   |

**Escalas de Tamaño:**

| Escala       | Tamaño  | Uso típico             |
| ------------ | ------- | ---------------------- |
| display-2xl  | 72px    | Títulos de hero        |
| display-xl   | 60px    | Títulos principales    |
| display-lg   | 48px    | Secciones              |
| display-md   | 36px    | Subsecciones           |
| display-sm   | 30px    | Encabezados de módulo  |
| display-xs   | 24px    | Encabezados menores    |
| text-xl      | 20px    | Párrafos grandes       |
| text-lg      | 18px    | Texto de lectura       |
| text-md      | 16px    | Texto de interfaz base |
| text-sm      | 14px    | Labels, metadata       |
| text-xs      | 12px    | Texto auxiliar, tags   |

### 4.3 Paleta de Colores

Cada color tiene 11 niveles de luminosidad (25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900).

| Grupo       | Color Central    | Uso                                              |
| ----------- | ---------------- | ------------------------------------------------ |
| `gray`      | Neutros          | Textos, fondos, bordes                           |
| `brand`     | `#00B3FF` (cyan) | Color primario: botones, links, selección activa |
| `secondary` | `#FF5E00` (naranja) | Acentos decorativos, highlights                |
| `error`     | Rojo             | Estados de error y destructivos                  |
| `warning`   | Amarillo/naranja | Alertas y advertencias                           |
| `success`   | Verde            | Confirmaciones y estados positivos               |

### 4.4 Sombras y Focus Rings

| Token                    | Descripción                                                     |
| ------------------------ | --------------------------------------------------------------- |
| `--shadow-xs`            | 0 1px 2px rgba(10,13,18,.05) — sombra mínima                   |
| `--shadow-sm`            | Sombra suave de 2 capas                                         |
| `--shadow-md` … `3xl`    | Escalas progresivas de sombra                                   |
| `--ring-primary-100`     | Focus ring claro (CCF5FF) — 4px spread, para fondos oscuros     |
| `--ring-primary-600`     | Focus ring sólido — para fondos claros                          |

### 4.5 Bordes y Espaciado

| Token              | Valor   |
| ------------------ | ------- |
| `--radius-sm`      | 4px     |
| `--radius-md`      | 8px     |
| `--radius-lg`      | 12px    |
| `--radius-full`    | 999px   |
| Espaciado base     | 4px (1 unidad Tailwind = 4px) |

### 4.6 Gradientes

Definidos como `@utility` en `index.css` y consumibles como clases Tailwind. Hay 7 gradientes de marca en distintos ángulos, combinando colores brand y secondary.

---

## 5. Atoms — Componentes Primitivos

Los Atoms son los bloques de construcción más pequeños. No tienen dependencias de otros componentes propios. Son puramente presentacionales y reciben toda su configuración vía props.

### 5.1 ButtonAtom

**Archivo**: `src/components/atoms/ButtonAtom.jsx`

Botón polimórfico con soporte para múltiples variantes e intenciones.

**Props:**

| Prop           | Tipo     | Valores                              | Default     |
| -------------- | -------- | ------------------------------------ | ----------- |
| `variant`      | string   | `text` \| `icon` \| `text-icon`     | `text`      |
| `intent`       | string   | `primary` \| `secondary` \| `ghost` \| `danger` | `primary` |
| `size`         | string   | `xs` \| `sm` \| `md` \| `lg`        | `md`        |
| `iconPosition` | string   | `leading` \| `trailing`             | `leading`   |
| `disabled`     | boolean  | —                                    | `false`     |
| `as`           | element  | Cualquier tag HTML o componente      | `button`    |
| `className`    | string   | Clases Tailwind adicionales          | `""`        |

**Comportamiento:**
- `variant="icon"` renderiza solo el icono sin padding lateral
- `intent="danger"` usa colores de error del design system
- Todos los intents tienen focus ring accesible (`ring-2 ring-offset-2`)
- Renderiza como `<a>` si se le pasa `as="a"` o si tiene prop `href`

### 5.2 TextAtom

**Archivo**: `src/components/atoms/TextAtom.jsx`

Primitivo tipográfico que mapea las escalas del design system.

**Props:**

| Prop        | Tipo    | Valores                                          | Default    |
| ----------- | ------- | ------------------------------------------------ | ---------- |
| `variant`   | string  | `display-2xl`…`display-xs`, `text-xl`…`text-xs` | `text-md`  |
| `weight`    | string  | `regular` \| `medium` \| `semibold` \| `bold`   | `regular`  |
| `family`    | string  | `serif` \| `sans` \| `mono`                     | `sans`     |
| `as`        | string  | Cualquier tag HTML                               | Auto       |
| `className` | string  | Clases adicionales                               | `""`       |

**Semántica automática:**
- `display-2xl` → `<h1>`, `display-xl` → `<h2>`, … , `display-xs` → `<h6>`
- `text-*` → `<span>` (o el valor de `as` si se especifica)

### 5.3 InputAtom

**Archivo**: `src/components/atoms/InputAtom.jsx`

Campo de input HTML estilizado con estados visuales.

**Props:**

| Prop        | Tipo    | Valores                               | Default     |
| ----------- | ------- | ------------------------------------- | ----------- |
| `size`      | string  | `sm` \| `md` \| `lg`                 | `md`        |
| `state`     | string  | `default` \| `error` \| `disabled`   | `default`   |
| `fullWidth` | boolean | —                                     | `false`     |
| `disabled`  | boolean | —                                     | `false`     |

Focus ring activo: `ring-2 ring-brand-500 shadow-focus-primary`.

### 5.4 CheckboxAtom

**Archivo**: `src/components/atoms/CheckboxAtom.jsx`

Checkbox personalizado con técnica **peer overlay** (input invisible + span estilizado).

**Props:**

| Prop            | Tipo     | Descripción                          |
| --------------- | -------- | ------------------------------------ |
| `checked`       | boolean  | Estado controlado                    |
| `indeterminate` | boolean  | Estado intermedio (para select-all)  |
| `onChange`      | function | Handler de cambio                    |
| `disabled`      | boolean  | Deshabilita interacción              |
| `label`         | string   | Label visible al lado del checkbox   |
| `className`     | string   | Clases adicionales                   |

**Implementación**: Usa `peer` de Tailwind — el `<input type="checkbox">` es invisible pero maneja los estados; el `<span>` visual reacciona con `peer-checked:*` y `peer-focus:*` classes.

### 5.5 LabelAtom

**Archivo**: `src/components/atoms/LabelAtom.jsx`

Envuelve `<label>` HTML con soporte para asterisco de campo requerido.

**Props:** `htmlFor`, `required` (boolean), `children`, `className`.

### 5.6 HeaderAtom

**Archivo**: `src/components/atoms/HeaderAtom.jsx`

Delegador sobre TextAtom que mapea un nivel numérico a la escala tipográfica correspondiente.

**Props:**

| Prop    | Tipo   | Descripción              |
| ------- | ------ | ------------------------ |
| `level` | number | 1–6 (corresponde a h1–h6)|

Internamente mapea `level=1` → `variant="display-2xl"` con tag `h1`, etc.

### 5.7 BoxAtom

**Archivo**: `src/components/atoms/BoxAtom.jsx`

Primitivo de layout universal. Envuelve un `<div>` (o el tag especificado) con props de flexbox, grid, espaciado, visual y más.

**Props de Layout:**

| Prop         | Descripción                            | Ejemplo de valor        |
| ------------ | -------------------------------------- | ----------------------- |
| `display`    | CSS display                            | `flex`, `grid`, `block` |
| `direction`  | flex-direction                         | `row`, `col`            |
| `align`      | align-items                            | `center`, `start`       |
| `justify`    | justify-content                        | `between`, `center`     |
| `gap`        | gap uniforme                           | `4`, `8`                |
| `gapX`       | column-gap                             | `2`                     |
| `gapY`       | row-gap                                | `2`                     |

**Props de Espaciado:** `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl`, `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`

**Props de Tamaño:** `w`, `h`, `minW`, `minH`, `maxW`, `maxH`

**Props Visuales:**

| Prop       | Descripción              | Valores de ejemplo          |
| ---------- | ------------------------ | --------------------------- |
| `rounded`  | Border radius            | `sm`, `md`, `lg`, `full`    |
| `shadow`   | Box shadow               | `sm`, `md`, `lg`            |
| `bg`       | Background color         | `gray-100`, `brand-600`     |
| `border`   | Borde                    | `none`, `default`, color    |
| `overflow` | overflow shorthand       | `x-hidden`, `y-auto`        |
| `flex`     | flex shorthand           | `1`, `auto`, `none`         |

### 5.8 TooltipAtom

**Archivo**: `src/components/atoms/TooltipAtom.jsx`

Tooltip flotante basado en **Portal** (usa `ReactDOM.createPortal` hacia `document.body`), lo que garantiza que nunca quede cortado por contenedores con `overflow: hidden`.

**Props:**

| Prop       | Tipo   | Descripción                               |
| ---------- | ------ | ----------------------------------------- |
| `content`  | string | Texto del tooltip                         |
| `position` | string | `top` \| `right` \| `bottom` \| `left`   |
| `children` | node   | Elemento que activa el tooltip al hover   |

**Implementación:** Calcula posición via `getBoundingClientRect()` en los eventos `onMouseEnter` / `onFocus`. El offset es de 6px. Soporta teclado (focus/blur).

---

## 6. Molecules — Componentes Compuestos

Las Molecules combinan Atoms para crear patrones de UI con propósito específico. Pueden tener estado interno pero no se comunican con servicios externos.

### 6.1 BubbleMessage

**Archivo**: `src/components/molecules/BubbleMessage.jsx`

Burbuja de chat con variantes para mensajes de usuario y de la IA.

**Props:**

| Prop          | Tipo    | Descripción                                       |
| ------------- | ------- | ------------------------------------------------- |
| `variant`     | string  | `user` \| `ai`                                    |
| `children`    | node    | Contenido del mensaje (texto o MarkdownRenderer)  |
| `isLoading`   | boolean | Muestra animación de typing dots                  |
| `avatar`      | node    | Slot para avatar (imagen o icono)                 |
| `timestamp`   | string  | Hora relativa del mensaje                         |
| `noTextWrap`  | boolean | Desactiva wrapping de texto (para diagramas)      |

**Layout:**
- `variant="user"` → alineación derecha, fondo `brand-100`
- `variant="ai"` → alineación izquierda, fondo blanco con borde `gray-200`
- `isLoading=true` → tres puntos animados en lugar del contenido

### 6.2 MessageInput

**Archivo**: `src/components/molecules/MessageInput.jsx`

Área de entrada de mensajes con textarea auto-redimensionable y botón de envío.

**Props:**

| Prop            | Tipo     | Descripción                                   |
| --------------- | -------- | --------------------------------------------- |
| `onSend`        | function | `(text: string) => void`                      |
| `placeholder`   | string   | Texto placeholder del textarea                |
| `disabled`      | boolean  | Deshabilita envío (mientras hay respuesta)    |
| `maxRows`       | number   | Límite de filas antes de scroll               |
| `leadingAction` | node     | Slot izquierdo (ej. botón de adjuntar archivo)|

**Teclado:**
- `Enter` → envía mensaje
- `Shift + Enter` → inserta salto de línea

**Auto-resize:** El textarea crece con el contenido hasta `maxRows`, luego hace scroll interno. Implementado con `rows` calculado desde `scrollHeight`.

### 6.3 ChatContainer

**Archivo**: `src/components/molecules/ChatContainer.jsx`

Contenedor de lista de mensajes con scroll automático.

**Responsabilidades:**
- Layout `flex-col gap-4` para apilar burbujas
- `overflow-y-auto` con scroll suave
- Ancla de scroll para hacer auto-scroll al mensaje más reciente

### 6.4 ChatHistory

**Archivo**: `src/components/molecules/ChatHistory.jsx`

Ítem de lista en la barra lateral que representa una sesión de chat.

**Props:**

| Prop          | Tipo     | Descripción                            |
| ------------- | -------- | -------------------------------------- |
| `title`       | string   | Nombre de la sesión                    |
| `projectName` | string   | Nombre del proyecto arquitectónico     |
| `timestamp`   | string   | Tiempo relativo de última actividad    |
| `isActive`    | boolean  | Resalta el ítem activo                 |
| `onClick`     | function | Handler de selección                   |
| `unread`      | boolean  | Muestra indicador de no leído          |

### 6.5 Sidebar

**Archivo**: `src/components/molecules/Sidebar.jsx`

Panel de navegación lateral expandible/colapsable.

**Props:**

| Prop           | Tipo    | Descripción                                   |
| -------------- | ------- | --------------------------------------------- |
| `items`        | array   | Ítems principales de navegación               |
| `bottomItems`  | array   | Ítems fijos en la parte inferior              |
| `footer`       | node    | Contenido del pie del sidebar                 |
| `collapsed`    | boolean | Estado colapsado (solo iconos visibles)       |

**Modo colapsado:** Cuando `collapsed=true`, muestra solo iconos con `TooltipAtom` al hover para accesibilidad.

### 6.6 Modal

**Archivo**: `src/components/molecules/Modal.jsx`

Diálogo modal con overlay de fondo.

**Props:**

| Prop       | Tipo     | Descripción                                 |
| ---------- | -------- | ------------------------------------------- |
| `isOpen`   | boolean  | Controla visibilidad                        |
| `onClose`  | function | Handler de cierre                           |
| `title`    | string   | Título del modal                            |
| `size`     | string   | `sm` \| `md` \| `lg` \| `xl`               |
| `footer`   | node     | Slot para botones de acción en el pie       |
| `children` | node     | Contenido del modal                         |

**Cierre automático:**
- Clic en el overlay de fondo
- Tecla `Escape`
- Botón `×` en el header del modal

### 6.7 Chips

**Archivo**: `src/components/molecules/Chips.jsx`

Etiquetas/badges interactivos para categorías y sugerencias.

**Props:**

| Prop        | Tipo     | Descripción                                |
| ----------- | -------- | ------------------------------------------ |
| `label`     | string   | Texto del chip                             |
| `variant`   | string   | 6 variantes de color                       |
| `size`      | string   | `sm` \| `md`                               |
| `removable` | boolean  | Muestra botón × para eliminar              |
| `onRemove`  | function | Handler de eliminación                     |
| `onClick`   | function | Handler de clic (convierte chip en botón)  |
| `selected`  | boolean  | Estado seleccionado                        |
| `icon`      | node     | Icono leading                              |
| `disabled`  | boolean  | Deshabilita interacción                    |

### 6.8 CodeBlock

**Archivo**: `src/components/molecules/CodeBlock.jsx`

Bloque de código con resaltado de sintaxis y funcionalidad de copiar.

**Props:**

| Prop              | Tipo    | Descripción                           |
| ----------------- | ------- | ------------------------------------- |
| `code`            | string  | Código a mostrar                      |
| `language`        | string  | Lenguaje para Prism (ej: `python`)    |
| `showLineNumbers` | boolean | Muestra números de línea              |
| `className`       | string  | Clases adicionales                    |

**Funcionalidades:**
- Resaltado vía `react-syntax-highlighter` con tema `vscDarkPlus`
- Botón "Copiar" que accede a `navigator.clipboard.writeText()`
- Feedback visual "Copiado ✓" durante 2 segundos
- Fuente: JetBrains Mono, fondo `gray-900`

### 6.9 AlertDialog

**Archivo**: `src/components/molecules/AlertDialog.jsx`

Diálogo de confirmación para acciones destructivas. Extiende Modal con botones de Confirmar/Cancelar predefinidos.

**Props:** `isOpen`, `onClose`, `onConfirm`, `title`, `description`, `confirmLabel`, `cancelLabel`, `intent` (`danger` | `primary`).

### 6.10 DropzoneFile

**Archivo**: `src/components/molecules/DropzoneFile.jsx`

Área de carga de archivos con soporte drag & drop.

**Props:** `onFilesSelected`, `accept`, `maxFiles`, `disabled`.

**Comportamiento:** Acepta archivos vía clic (input oculto) y vía arrastrar y soltar. Muestra feedback visual de estado (idle/hover/error).

### 6.11 Cards, Form, InputForm, Column, Table, RowTable, SectionHeader

Componentes auxiliares del design system para estructurar contenido en formularios, tablas y layouts de card. Se documentan en `DESIGN_SYSTEM.md` del repositorio.

---

## 7. Organisms — Componentes Complejos

Los Organisms combinan Molecules y Atoms en estructuras de UI completas con lógica propia.

### 7.1 MarkdownRenderer

**Archivo**: `src/components/organisms/MarkdownRenderer.jsx`

Renderiza texto Markdown proveniente de las respuestas del backend. Implementa un mapa completo de componentes para controlar totalmente el estilo del output.

**Uso:**
```jsx
<MarkdownRenderer content={message.text} />
```

**Librerías:**
- `react-markdown` — parseo de Markdown a AST
- `remark-gfm` — soporte para GitHub Flavored Markdown (tablas, tachado, listas de tareas)
- `rehype-raw` — permite HTML literal en el Markdown

**Mapa de Componentes Personalizado:**

| Nodo Markdown | Componente React / Estilo Tailwind           |
| ------------- | -------------------------------------------- |
| `h1`–`h6`     | `HeaderAtom` con level correspondiente       |
| `p`           | `TextAtom variant="text-md"` + `mb-3`        |
| `a`           | Link `text-brand-600 hover:underline`        |
| `ul` / `ol`   | Lista con `list-disc` / `list-decimal`       |
| `code` (inline)| `<code>` con fondo `gray-100`, mono font   |
| `code` (fence) | `CodeBlock` con el lenguaje del fence       |
| `blockquote`  | Border izquierdo brand, fondo `brand-50`     |
| `table`       | Tabla con bordes, header `gray-100`          |
| `hr`          | Separador `border-gray-200`                  |
| `strong`      | `font-semibold`                              |
| `em`          | `italic`                                     |
| `del`         | `line-through text-gray-400`                 |

> **Decisión de diseño**: Se evita `@tailwindcss/typography` intencionalmente para tener control total sobre el estilo de cada elemento Markdown.

---

## 8. Vistas Principales

### 8.1 ChatView

**Archivo**: `src/views/ChatView.jsx` (~700 líneas)

Vista principal de la aplicación. Orquesta todos los componentes para construir la interfaz de chat completa.

#### Estructura de Layout

```
┌─────────────────────────────────────────────┐
│  HEADER (título sesión + controles)         │
├──────────────┬──────────────────────────────┤
│              │   ÁREA DE MENSAJES           │
│   SIDEBAR    │   (ChatContainer)            │
│   (sesiones) │                              │
│              │   INPUT (MessageInput)       │
│              │   FOOTER (disclaimer)        │
└──────────────┴──────────────────────────────┘
```

#### Estado Visual Local (useState)

| Estado               | Tipo      | Descripción                                  |
| -------------------- | --------- | -------------------------------------------- |
| `sidebarOpen`        | boolean   | Controla visibilidad del sidebar             |
| `onboardingOpen`     | boolean   | Modal de bienvenida (primera visita)         |
| `attachedImages`     | array     | Imágenes adjuntas pendientes de envío (max 2)|
| `activeInternalMsg`  | object    | Mensaje seleccionado para ver internals       |
| `internalModalOpen`  | boolean   | Modal de mensajes internos del agente        |

#### Estado de Negocio (useChatManager)

```js
const {
  sessions,       // Lista de sesiones en el sidebar
  sessionId,      // ID de la sesión activa
  messages,       // Mensajes del chat visible
  isBusy,         // true mientras el backend procesa
  ratedMessages,  // Set de mensajes ya valorados
  setSessionId,
  createSession,
  renameSession,
  deleteSession,
  send,
  rateMessage,
} = useChatManager()
```

#### Renderizado de Mensajes

Cada mensaje en `messages[]` se renderiza con:

1. **Avatar** — ícono de robot (IA) o usuario
2. **BubbleMessage** — burbuja con el contenido
3. **MarkdownRenderer** — dentro de la burbuja AI para formatear la respuesta
4. **AgentRoleBadges** — chips con los agentes que participaron (Investigator, ASR Node, etc.)
5. **Indicador RAG** — si hay fuentes RAG, muestra `N fuentes` clickeable
6. **SuggestionChips** — sugerencias de seguimiento enviables con un clic
7. **FeedbackButtons** — thumbs up/down (deshabilitados tras votar)

#### Funciones Helper Internas

**`relativeTime(ts)`**: Convierte timestamp a texto relativo en español.

```
"Ahora"         → < 1 minuto
"Hace 5 min"    → 1–59 minutos
"Hace 2h"       → 1–23 horas
"Hace 3d"       → días
```

**`AgentRoleBadges({ internalMessages })`**: Usa `summarizeRoles()` del hook para agrupar los agentes participantes en una respuesta y renderizarlos como chips.

**`SuggestionChips({ suggestions, onSend })`**: Renderiza las sugerencias del backend como chips clickeables que llaman a `onSend` con el texto de la sugerencia.

**`FeedbackButtons({ sessionId, messageId })`**: Botones de valoración con lógica de estado: una vez votado, ambos botones quedan deshabilitados y el elegido muestra estado activo.

#### Modales en ChatView

**Modal de Onboarding:**
- Se muestra en la primera visita
- Explica el flujo ADD 3.0 (5 pasos)
- Se omite si `localStorage.getItem('arquia.onboarding_seen')` existe

**Modal de Mensajes Internos:**
- Se abre al hacer clic en "Ver proceso" en cualquier mensaje AI
- Muestra el árbol de conversación interna entre agentes del backend
- Muestra las fuentes RAG extraídas mediante `extractRagSources()`

#### Modo Demo

`ChatView` puede operar con respuestas mock desde `src/data/demoMessages.js` cuando no hay backend disponible. El modo demo se activa internamente y devuelve respuestas rotativas del array de demos.

### 8.2 AtomShowcase

**Archivo**: `src/AtomShowcase.jsx`

Vista de desarrollo que muestra todos los componentes Atom con sus variantes. Usada para QA visual del design system.

### 8.3 MoleculeShowcase

**Archivo**: `src/MoleculeShowcase.jsx`

Vista de desarrollo que muestra todos los componentes Molecule en acción. Complementa AtomShowcase para QA visual completo.

---

## 9. Gestión de Estado — useChatManager

**Archivo**: `src/hooks/useChatManager.js`

Hook personalizado que centraliza toda la lógica de estado de conversación. Actúa como la única fuente de verdad para el chat.

### 9.1 API del Hook

```js
const {
  sessions,       // Session[]  — lista de sesiones del sidebar
  sessionId,      // string     — ID de la sesión actualmente activa
  messages,       // Message[]  — mensajes visibles del chat actual
  isBusy,         // boolean    — true si hay una petición en curso
  ratedMessages,  // Set<string>— "sessionId-messageId" ya valorados
  setSessionId,   // (id: string) => void
  createSession,  // () => void
  renameSession,  // (id: string, title: string) => void
  deleteSession,  // (id: string) => void
  send,           // async (text: string, images: ImageObj[]) => Promise<void>
  rateMessage,    // (sid: string, mid: string, isUp: boolean) => void
} = useChatManager()
```

### 9.2 Gestión de Sesiones

**Crear sesión (`createSession`):**
1. Genera UUID para el nuevo `sessionId`
2. Crea objeto `{ id, title: "Nueva Conversación", createdAt: Date.now() }`
3. Actualiza `sessions` en estado y en `localStorage`
4. Activa la nueva sesión (setSessionId)

**Renombrar sesión (`renameSession`):**
1. Actualiza el `title` en el array `sessions`
2. Persiste en `arquia.sessions` en localStorage

**Eliminar sesión (`deleteSession`):**
1. Elimina el ítem de `sessions`
2. Elimina `arquia.chat.{sessionId}` de localStorage
3. Si era la sesión activa, activa la primera sesión restante (o crea una nueva si no quedan)

### 9.3 Envío de Mensajes (`send`)

```
1. Agrega mensaje de usuario al estado (optimistic UI)
2. Agrega placeholder "typing" del asistente
3. Incrementa requestSeq (ref) para deduplicación
4. Llama chatService.sendMessage({ text, sessionId, images })
5. Si la respuesta corresponde al requestSeq actual:
   a. Reemplaza el placeholder con la respuesta real
   b. Adjunta internalMessages y suggestions a la respuesta
   c. Persiste messages en localStorage
6. Si hay error: reemplaza placeholder con mensaje de error
7. setIsBusy(false)
```

**Deduplicación de requests:** El `requestSeq` es una `ref` que se incrementa en cada envío. Si el usuario navega a otra sesión mientras espera, la respuesta de la sesión anterior es descartada (el seq no coincide).

### 9.4 Valoración de Mensajes (`rateMessage`)

1. Agrega `"${sessionId}-${messageId}"` al Set `ratedMessages`
2. Llama `chatService.sendFeedback({ sessionId, messageId, thumbsUp, thumbsDown })`
3. El Set previene valoraciones múltiples — una vez en `ratedMessages`, el par de botones queda deshabilitado

### 9.5 Funciones Utilitarias Exportadas

**`summarizeRoles(internalMessages)`**

Agrupa mensajes del árbol interno por tipo de agente y cuenta apariciones.

```js
// Input: [{ role: "investigator", content: "..." }, { role: "asr", content: "..." }]
// Output: [["investigator", 2], ["asr", 1]]
```

**`extractRagSources(internalMessages)`**

Parsea el bloque `\nSOURCES:\n` del contenido de mensajes internos y extrae las fuentes RAG.

```js
// Input: mensajes con sección "SOURCES:\n- Documento 1\n- Documento 2"
// Output: ["Documento 1", "Documento 2"]
```

### 9.6 Esquema de Datos

**Session:**
```json
{
  "id": "uuid-v4",
  "title": "Nombre de la sesión",
  "createdAt": 1712345678900
}
```

**Message:**
```json
{
  "id": "uuid-v4",
  "role": "user" | "assistant",
  "content": "Texto del mensaje",
  "internalMessages": [],
  "suggestions": [],
  "timestamp": 1712345678900,
  "isLoading": false
}
```

---

## 10. Capa de Servicios — chatService

**Archivo**: `src/services/chatService.js`

Módulo que abstrae toda comunicación HTTP con el backend. No tiene estado propio — es un conjunto de funciones puras que retornan Promises.

### 10.1 Base URL

```js
const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
```

La URL base se configura vía variable de entorno. Ver [Sección 13](#13-variables-de-entorno).

### 10.2 sendMessage

**Firma:** `sendMessage({ text, sessionId, images }) → Promise<Response>`

**Request:**
```
POST {API}/message
Content-Type: multipart/form-data

message:    string
session_id: string
image1:     File (opcional)
image2:     File (opcional)
```

**Response esperada:**
```json
{
  "endMessage":    "Respuesta final del asistente",
  "messages":      [...],
  "session_id":    "uuid",
  "message_id":    "uuid",
  "suggestions":   ["Sugerencia 1", "Sugerencia 2"]
}
```

**Procesamiento de respuesta:**
- `endMessage` pasa por `fixUtf8()` (función legacy para corregir doble codificación UTF-8)
- `messages` se guarda como `internalMessages` en el objeto de mensaje
- Si el backend no retorna `suggestions`, se usa array vacío

### 10.3 fetchDiagramSvg

**Firma:** `fetchDiagramSvg({ sessionId }) → Promise<{ svgText: string }>`

**Request:**
```
GET {API}/diagram/export?session_id={sessionId}&format=svg
```

**Manejo de errores:**

| Código HTTP | Comportamiento                                    |
| ----------- | ------------------------------------------------- |
| `404`       | Lanza `Error("No diagram found for this session")` |
| `400` / `500` | Extrae `detail` o `message` del JSON de error  |
| Otros       | Lanza `Error("HTTP {status}")`                    |

### 10.4 buildDiagramExportUrl

**Firma:** `buildDiagramExportUrl({ sessionId, format }) → string`

Construye la URL de descarga directa para un formato dado. No hace fetch — retorna el string de URL para usarlo en `<a href>` o `window.open()`.

**Formatos soportados:**

| `format`      | Descripción                       |
| ------------- | --------------------------------- |
| `svg`         | SVG vectorial renderizado         |
| `dot`         | Fuente DOT de Graphviz            |
| `dot_drawio`  | DOT adaptado para draw.io         |
| `drawio`      | XML de draw.io directamente       |

### 10.5 sendFeedback

**Firma:** `sendFeedback({ sessionId, messageId, thumbsUp, thumbsDown }) → Promise<void>`

**Request:**
```
POST {API}/feedback
Content-Type: multipart/form-data

session_id:  string
message_id:  string
thumbs_up:   boolean
thumbs_down: boolean
```

No se espera cuerpo de respuesta. Los errores HTTP se propagan como exceptions.

---

## 11. DiagramViewer

**Archivo**: `src/components/DiagramViewer.jsx`

Componente especializado para visualizar y exportar diagramas arquitectónicos generados por el backend.

### 11.1 Props

| Prop        | Tipo   | Descripción                         |
| ----------- | ------ | ----------------------------------- |
| `sessionId` | string | ID de sesión para solicitar el SVG  |

### 11.2 Ciclo de Vida

```
sessionId cambia
       │
       ▼
fetchDiagramSvg(sessionId)   ← chatService
       │
       ├── Loading state → "Cargando diagrama..."
       │
       ├── Éxito → sanitizeSvg(svgText) → renderiza en <div dangerouslySetInnerHTML>
       │
       └── Error → muestra mensaje de error
```

### 11.3 Sanitización SVG

El SVG recibido del backend se sanitiza antes de renderizar para prevenir XSS:

```js
// useMemo — se recalcula solo cuando svgText cambia
const sanitized = useMemo(() => sanitizeSvg(rawSvg), [rawSvg])
```

**`sanitizeSvg(svgText)`:**
1. Elimina todos los tags `<script>` y su contenido
2. Elimina atributos `xlink:href` que apunten a `javascript:`
3. Elimina atributos `on*` (event handlers inline)
4. Retorna el SVG limpio como string

### 11.4 Exportación

El viewer muestra un panel de controles con 4 opciones de exportación:

| Botón       | Acción                                               |
| ----------- | ---------------------------------------------------- |
| SVG         | `window.open(buildDiagramExportUrl(sessionId, 'svg'))` |
| DOT         | Ídem con `'dot'`                                     |
| DOT DrawIO  | Ídem con `'dot_drawio'`                              |
| DrawIO      | Ídem con `'drawio'`                                  |

Cada botón abre la URL en una nueva pestaña. El navegador maneja la descarga según los headers `Content-Disposition` del backend.

---

## 12. Configuración y Build

### 12.1 Vite (`vite.config.js`)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

Configuración mínima. Usa los defaults de Vite para:
- Puerto de desarrollo: `5173`
- Build output: `dist/`
- JSX Transform automático (React 17+ — no necesita `import React`)
- HMR con React Fast Refresh

### 12.2 Tailwind CSS v4 (`tailwind.config.js` + `index.css`)

Tailwind v4 usa un enfoque diferente al v3: la mayor parte de la configuración de tema se define en CSS usando `@theme inline`, no en JavaScript.

**Flujo de configuración:**

```
tokens.css      → Define CSS Custom Properties como SSOT
                   --color-brand-500: #00B3FF;

index.css       → @theme inline { --color-brand-500: var(--color-brand-500); }
                  Esto genera la clase Tailwind: bg-brand-500, text-brand-500, etc.

tailwind.config.js → Extiende con fuentes y escalas que no son triviales en CSS
```

### 12.3 PostCSS (`postcss.config.js`)

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

Tailwind v4 integra Lightning CSS internamente, manejando los prefijos de vendor sin necesitar `autoprefixer` explícito.

### 12.4 ESLint (`eslint.config.js`)

- Formato flat config (ESLint v9)
- JSX Runtime: no requiere `import React from 'react'`
- Regla `react-hooks/exhaustive-deps`: activa (warning)
- Regla `react-refresh/only-export-components`: warning (HMR safety)

### 12.5 Build de Producción

```bash
npm run build
```

**Output (`dist/`):**
- `index.html` — HTML de entrada con scripts injectados
- `assets/*.js` — Bundle ESM con code splitting automático por Vite
- `assets/*.css` — CSS purificado (solo clases usadas en código)

**Características del bundle:**
- Tree-shaking: código no usado eliminado
- Minificación: Terser (JS) + Lightning CSS (CSS)
- Sin source maps en producción por default
- Tamaño estimado: ~1 MB gzipped (incluyendo Prism y MUI icons)

---

## 13. Variables de Entorno

Las variables de entorno se definen en un archivo `.env.local` en la raíz del proyecto (no commitear).

| Variable          | Default                    | Descripción                          |
| ----------------- | -------------------------- | ------------------------------------ |
| `VITE_API_BASE`   | `http://localhost:8000`    | URL base del backend FastAPI         |

**Uso en código:**
```js
const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
```

**Para producción**, setear `VITE_API_BASE` en el proceso de build o en la plataforma de hosting:
```bash
VITE_API_BASE=https://api.archia.example.com npm run build
```

> **Importante**: En Vite, solo las variables que empiezan con `VITE_` son expuestas al cliente. Variables sin este prefijo son privadas al proceso de Node.js del build.

---

## 14. Jerarquía de Archivos

```
archIAFront/
├── public/
│   └── magnifying-glass.svg          # Favicon
│
├── src/
│   ├── main.jsx                       # Punto de entrada — ReactDOM.createRoot()
│   ├── App.jsx                        # Router de vistas (switcher de estado)
│   ├── AtomShowcase.jsx               # Vista de QA visual de Atoms
│   ├── MoleculeShowcase.jsx           # Vista de QA visual de Molecules
│   │
│   ├── views/
│   │   └── ChatView.jsx               # Vista principal del chat (~700 líneas)
│   │
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── ButtonAtom.jsx         # Botón polimórfico (3 variantes × 4 intenciones)
│   │   │   ├── TextAtom.jsx           # Primitivo tipográfico (11 escalas)
│   │   │   ├── InputAtom.jsx          # Campo de input (3 estados)
│   │   │   ├── CheckboxAtom.jsx       # Checkbox con soporte indeterminate
│   │   │   ├── LabelAtom.jsx          # Label semántico con indicador required
│   │   │   ├── HeaderAtom.jsx         # Encabezados h1–h6 vía TextAtom
│   │   │   ├── BoxAtom.jsx            # Primitivo de layout universal (30+ props)
│   │   │   └── TooltipAtom.jsx        # Tooltip portal-based flotante
│   │   │
│   │   ├── molecules/
│   │   │   ├── BubbleMessage.jsx      # Burbuja de chat (user/ai + typing indicator)
│   │   │   ├── MessageInput.jsx       # Textarea auto-resize + botón de envío
│   │   │   ├── ChatContainer.jsx      # Contenedor de lista de mensajes
│   │   │   ├── ChatHistory.jsx        # Ítem de sesión en el sidebar
│   │   │   ├── Sidebar.jsx            # Panel lateral de navegación
│   │   │   ├── Modal.jsx              # Diálogo modal (4 tamaños)
│   │   │   ├── Chips.jsx              # Tags/badges (6 variantes)
│   │   │   ├── CodeBlock.jsx          # Bloque de código con Prism + copiar
│   │   │   ├── AlertDialog.jsx        # Confirmación de acción destructiva
│   │   │   ├── DropzoneFile.jsx       # Carga de archivos drag & drop
│   │   │   ├── Cards.jsx              # Tarjeta de contenido
│   │   │   ├── Form.jsx               # Wrapper de formulario
│   │   │   ├── InputForm.jsx          # Input con validación para formularios
│   │   │   ├── Column.jsx             # Helper flex-column
│   │   │   ├── Table.jsx              # Tabla
│   │   │   ├── RowTable.jsx           # Fila de tabla
│   │   │   └── SectionHeader.jsx      # Encabezado de sección
│   │   │
│   │   ├── organisms/
│   │   │   └── MarkdownRenderer.jsx   # Markdown → React (componentes custom)
│   │   │
│   │   ├── DiagramViewer.jsx          # Visualizador SVG + controles de exportación
│   │   ├── Header.jsx                 # Barra de navegación superior
│   │   └── Chat.jsx                   # (Deprecated — usar ChatView)
│   │
│   ├── hooks/
│   │   └── useChatManager.js          # Estado global de chat + persistencia
│   │
│   ├── services/
│   │   └── chatService.js             # Capa HTTP: /message, /diagram, /feedback
│   │
│   ├── data/
│   │   └── demoMessages.js            # Respuestas mock para modo demo
│   │
│   ├── styles/
│   │   ├── tokens.css                 # CSS Custom Properties — SSOT del design system
│   │   ├── index.css                  # @theme inline + @utility para gradientes
│   │   ├── diagramViewer.css          # Estilos del DiagramViewer
│   │   ├── header.css                 # Estilos del Header
│   │   └── chat.css                   # (Deprecated — estilos del Chat.jsx antiguo)
│   │
│   └── assets/
│       └── react.svg
│
├── index.html                         # HTML de entrada (Vite lo procesa)
├── package.json                       # Dependencias y scripts
├── package-lock.json                  # Lock file de npm
├── vite.config.js                     # Configuración de Vite
├── tailwind.config.js                 # Extensiones de tema Tailwind
├── postcss.config.js                  # Plugin Tailwind para PostCSS
├── eslint.config.js                   # Configuración ESLint v9 flat config
└── DESIGN_SYSTEM.md                   # Documentación del design system
```

---

> **Documento generado**: Abril 2026 — ArchIA Frontend v1
> **Basado en**: Código fuente de `archIAFront` + `Documentacion_Tecnica_ArchIA_v4.md` como referencia de formato
