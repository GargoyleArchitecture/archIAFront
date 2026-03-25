# ArchIA — Design System Documentation

> **Propósito de este documento**
> Fuente de verdad para cualquier agente o desarrollador que deba agregar, modificar o revisar
> componentes del design system. Sigue este documento al pie de la letra para mantener la
> coherencia visual y estructural del producto.

---

## Tabla de contenidos

1. [Stack técnico](#1-stack-técnico)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Design Tokens](#3-design-tokens)
4. [Configuración Tailwind CSS v4](#4-configuración-tailwind-css-v4)
5. [Átomos](#5-átomos) (TextAtom · HeaderAtom · LabelAtom · InputAtom · ButtonAtom · CheckboxAtom · TooltipAtom · **BoxAtom**)
6. [Moléculas](#6-moléculas)
7. [Organismos](#7-organismos)
8. [Capa de servicios, hooks y vistas](#8-capa-de-servicios-hooks-y-vistas)
9. [Reglas para agregar componentes](#9-reglas-para-agregar-componentes)
10. [Anti-patrones — qué NUNCA hacer](#10-anti-patrones--qué-nunca-hacer)

---

## 1. Stack técnico

| Herramienta | Versión | Rol |
|---|---|---|
| React | 19 | UI framework |
| Tailwind CSS | v4 | Estilos utility-first |
| Vite | 6 | Bundler |
| @mui/icons-material | 6 | Íconos SVG (solo íconos, no componentes MUI) |
| react-markdown | 10 | Parseo de Markdown |
| remark-gfm | 4 | GFM: tablas, strikethrough, tasklists |
| react-syntax-highlighter | 16 | Highlighting de código (CodeBlock) |
| mermaid | 11 | Diagramas (MermaidChart legacy) |

**Regla crítica:** MUI se usa **solo para íconos** (`@mui/icons-material`). Nunca importar
componentes de `@mui/material` (Button, TextField, Dialog, etc.) en los componentes nuevos.

---

## 2. Estructura del proyecto

```
front/
├── src/
│   ├── styles/
│   │   ├── tokens.css          ← Design tokens (única fuente de verdad de colores/tipos)
│   │   └── index.css           ← @theme inline (mapeo tokens → clases Tailwind)
│   │
│   ├── components/
│   │   ├── atoms/              ← Bloques indivisibles (8 átomos)
│   │   │   ├── TextAtom.jsx
│   │   │   ├── HeaderAtom.jsx
│   │   │   ├── LabelAtom.jsx
│   │   │   ├── InputAtom.jsx
│   │   │   ├── ButtonAtom.jsx
│   │   │   ├── CheckboxAtom.jsx
│   │   │   ├── TooltipAtom.jsx
│   │   │   └── BoxAtom.jsx
│   │   │
│   │   ├── molecules/          ← Composición de átomos (17 moléculas)
│   │   │   ├── SectionHeader.jsx
│   │   │   ├── InputForm.jsx
│   │   │   ├── Form.jsx
│   │   │   ├── Chips.jsx
│   │   │   ├── Column.jsx
│   │   │   ├── Cards.jsx
│   │   │   ├── ChatHistory.jsx
│   │   │   ├── BubbleMessage.jsx
│   │   │   ├── DropzoneFile.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── RowTable.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── AlertDialog.jsx
│   │   │   └── CodeBlock.jsx
│   │   │
│   │   └── organisms/          ← Secciones autónomas con lógica propia (1 organismo)
│   │       └── MarkdownRenderer.jsx
│   │
│   ├── services/
│   │   └── chatService.js      ← Capa de red (fetch puro, sin React)
│   │
│   ├── hooks/
│   │   └── useChatManager.js   ← Estado + persistencia (sin JSX)
│   │
│   ├── views/
│   │   └── ChatView.jsx        ← Vista completa (consume hook + átomos/moléculas)
│   │
│   ├── AtomShowcase.jsx        ← Storybook de átomos
│   └── MoleculeShowcase.jsx    ← Storybook de moléculas y organismos
```

---

## 3. Design Tokens

**Archivo fuente:** `src/styles/tokens.css`

Los tokens son **CSS Custom Properties** en `:root`. Nunca hardcodear valores en los componentes;
siempre referenciar tokens a través de las clases Tailwind.

---

### 3.1 Tipografía

#### Familias de fuente

| Token CSS | Clase Tailwind | Fuente | Uso |
|---|---|---|---|
| `--font-serif` | `font-serif` | Roboto Serif | Títulos, display, branding |
| `--font-sans` | `font-sans` | Roboto Mono | Cuerpo de texto, UI |
| `--font-mono` | `font-mono` | JetBrains Mono | Código, snippets |

> **Nota:** `font-sans` usa Roboto Mono, no una sans-serif tradicional. Esto es intencional
> en el diseño de ArchIA — da un carácter técnico al cuerpo de texto.

#### Escala tipográfica — Display

| Token CSS | Clase Tailwind | Tamaño | Line-height | Uso |
|---|---|---|---|---|
| `--text-display-2xl` | `text-display-2xl` | 72px | 90px | Heroes, landing |
| `--text-display-xl` | `text-display-xl` | 60px | 72px | Page titles |
| `--text-display-lg` | `text-display-lg` | 48px | 60px | Section titles |
| `--text-display-md` | `text-display-md` | 36px | 44px | Subtítulos grandes |
| `--text-display-sm` | `text-display-sm` | 30px | 38px | Subtítulos medianos |
| `--text-display-xs` | `text-display-xs` | 24px | 32px | Card titles, headings |

#### Escala tipográfica — Body

| Token CSS | Clase Tailwind | Tamaño | Line-height | Uso |
|---|---|---|---|---|
| `--text-xl` | `text-body-xl` | 20px | 30px | Intro text, destacados |
| `--text-lg` | `text-body-lg` | 18px | 28px | Lead paragraphs |
| `--text-md` | `text-body-md` | 16px | 24px | Cuerpo principal |
| `--text-sm` | `text-body-sm` | 14px | 20px | UI labels, secundario |
| `--text-xs` | `text-body-xs` | 12px | 18px | Captions, metadatos |

> **Importante — colisión de nombres:** Las clases `text-xl`, `text-lg`, `text-md`, `text-sm`,
> `text-xs` son las nativas de Tailwind. El design system las renombra con prefijo `body-`
> para evitar conflictos: usar siempre `text-body-*`.

#### Pesos de fuente

| Clase Tailwind | Valor | Uso |
|---|---|---|
| `font-regular` | 400 | Texto base, body |
| `font-medium` | 500 | Labels, botones secundarios |
| `font-semibold` | 600 | Headings en UI, botones primarios |
| `font-bold` | 700 | Títulos hero, énfasis fuerte |

#### Letter spacing

| Clase Tailwind | Valor | Uso |
|---|---|---|
| `tracking-display` | −0.02em | Títulos display |
| `tracking-normal` | 0em | Cuerpo de texto |

---

### 3.2 Colores

#### Gray (Neutros)

| Clase Tailwind | Hex | Uso típico |
|---|---|---|
| `gray-25` | #FDFDFD | Fondos de página, backgrounds sutiles |
| `gray-50` | #FAFAFA | Fondos de sección, card backgrounds |
| `gray-100` | #F5F5F5 | Fondos de code inline, hover muy suave |
| `gray-200` | #E9EAEB | Bordes sutiles, divisores |
| `gray-300` | #D5D7DA | Bordes de inputs, separadores |
| `gray-400` | #A4A7AE | Placeholders, íconos inactivos, timestamps |
| `gray-500` | #717680 | Texto de ayuda (hint), subtexto |
| `gray-600` | #535862 | Texto secundario |
| `gray-700` | #414651 | Labels, texto de navegación |
| `gray-800` | #252B37 | Texto de cuerpo en dark contexts |
| `gray-900` | #101828 | El negro más oscuro del sistema |

#### Brand (Azul cian — color primario)

| Clase Tailwind | Hex | Uso típico |
|---|---|---|
| `brand-25` | #F4FDFF | Fondos hover muy suaves |
| `brand-50` | #E5FAFF | Fondos de item activo en sidebar |
| `brand-100` | #CCF5FF | Focus ring, burbujas de usuario |
| `brand-200` | #99E9FF | Bordes hover |
| `brand-300` | #66D9FF | Bordes, blockquote |
| `brand-400` | #33C5FF | Íconos decorativos |
| `brand-500` | #00B3FF | Bordes de input en focus |
| `brand-600` | #0088CC | **Botón primario**, links, íconos activos |
| `brand-700` | #006DA8 | Hover del botón primario, texto brand |
| `brand-800` | #00578A | Active del botón primario |
| `brand-900` | #003D66 | Gradientes oscuros |

#### Secondary (Naranja — acento decorativo)

| Clase Tailwind | Hex | Uso típico |
|---|---|---|
| `secondary-50` | #FFF2E5 | Fondo de badge @molecule |
| `secondary-100` | #FFE4CC | Borde de badge |
| `secondary-300` | #FFA666 | Viñetas decorativas |
| `secondary-400` | #FF8133 | Acentos de interfaz |
| `secondary-600` | #CC4400 | Texto de badge @molecule |
| `secondary-700` | #A83500 | Texto secondary oscuro |

> **Regla:** `secondary-*` es para acentos decorativos (badges, viñetas). **No** es el color
> de los botones "secondary" — esos usan `brand-*` como outlined.

#### Error (Rojo)

| Clase Tailwind | Uso |
|---|---|
| `error-50` | Fondos de mensajes de error |
| `error-100` | Focus ring de error |
| `error-300` | Bordes de error suaves |
| `error-500` | Borde de input con error, asterisco requerido |
| `error-600` | **Botón danger**, iconos de error |
| `error-700` | Hover del botón danger |

#### Warning (Amarillo/Naranja)

| Clase Tailwind | Uso |
|---|---|
| `warning-100` | Fondos de alerta |
| `warning-400` | Íconos de advertencia |
| `warning-600` | Texto de advertencia |

#### Success (Verde)

| Clase Tailwind | Uso |
|---|---|
| `success-50` | Fondos de éxito |
| `success-400` | Íconos de éxito, check de copiar |
| `success-900/20` | Fondo del botón "Copiado" en CodeBlock |

---

### 3.3 Sombras

| Clase Tailwind | Valor | Uso |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(10,13,18, 0.05)` | Inputs, cards planas |
| `shadow-sm` | `0 1px 3px + 0 1px 2px` | Burbujas de chat |
| `shadow-md` | `0 4px 8px -2px + 0 2px 4px -2px` | Cards elevadas |
| `shadow-lg` | `0 12px 16px -4px + 0 4px 6px -2px` | Popovers |
| `shadow-xl` | `0 20px 24px -4px + 0 8px 8px -4px` | Modales |
| `shadow-2xl` | `0 24px 48px -12px` | Overlays |
| `shadow-3xl` | `0 32px 64px -12px` | Máxima elevación |

#### Focus rings (como sombras)

| Clase Tailwind | Color | Cuándo usar |
|---|---|---|
| `shadow-focus-primary` | brand-100 (cian claro) | Inputs, botones brand |
| `shadow-focus-gray` | gray-100 | Botones ghost, items de nav |
| `shadow-focus-error` | error-100 | Inputs con error |
| `shadow-focus-primary-solid` | brand-600 | Sin uso actual |
| `shadow-focus-gray-solid` | gray-600 | Sin uso actual |

---

### 3.4 Border radius

| Clase Tailwind | Valor | Uso |
|---|---|---|
| `rounded-sm` | 4px | Checkboxes |
| `rounded-md` | 8px | Botones, inputs, tooltips, code inline |
| `rounded-lg` | 12px | Cards, burbujas de chat, CodeBlock, modales |
| `rounded-full` | 999px | Avatares, chips pill |

---

### 3.5 Gradientes

| Clase Tailwind | Definición | Uso |
|---|---|---|
| `bg-gradient-angular` | conic-gradient brand | Decorativo |
| `bg-gradient-linear-90-600-500` | 90° brand-600 → brand-500 | CTAs, fondos premium |
| `bg-gradient-linear-45-700-600` | 45° brand-700 → brand-600 | Variante media |
| `bg-gradient-linear-45-800-600` | 45° brand-800 → brand-600 | Variante oscura |
| `bg-gradient-linear-90-800-600` | 90° brand-800 → brand-600 | Barras horizontales |
| `bg-gradient-linear-26-800-700` | 26.5° brand-800 → brand-700 | Gradiente diagonal sutil |
| `bg-gradient-linear-45-900-600` | 45° brand-900 → brand-600 | El más dramático |

---

## 4. Configuración Tailwind CSS v4

**Archivo:** `src/styles/index.css`

Tailwind v4 usa `@theme inline` en lugar de `tailwind.config.js`. El bloque `@theme inline`
mapea los tokens CSS a nombres de clases Tailwind. `inline` significa que los valores no se
re-emiten como CSS vars adicionales — Tailwind los consume directamente.

```css
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  --font-sans: var(--font-sans);
  --text-body-md: var(--text-md);
  --text-body-md--line-height: var(--leading-md);
  --color-brand-600: var(--color-brand-600);
  /* ... todos los tokens mapeados aquí ... */
}
```

**Regla:** Si necesitas un token nuevo, se añade primero en `tokens.css` y luego se mapea
en el bloque `@theme inline` de `index.css`.

---

## 5. Átomos

> Los átomos son los bloques más pequeños del sistema. No dependen de otros átomos.
> Se clasifican en `src/components/atoms/`.

---

### TextAtom

**Archivo:** `src/components/atoms/TextAtom.jsx`
**Propósito:** Componente polimórfico de tipografía. Único punto de entrada para renderizar
texto con los tokens del design system.

#### Props

| Prop | Tipo | Default | Valores posibles |
|---|---|---|---|
| `variant` | string | `'text-md'` | `display-2xl` · `display-xl` · `display-lg` · `display-md` · `display-sm` · `display-xs` · `text-xl` · `text-lg` · `text-md` · `text-sm` · `text-xs` |
| `weight` | string | `'regular'` | `regular` · `medium` · `semibold` · `bold` |
| `family` | string | `'sans'` | `serif` · `sans` · `mono` |
| `as` | string | auto | Cualquier tag HTML (`p`, `h1`, `span`, `div`, `code`, etc.) |
| `className` | string | `''` | Clases Tailwind adicionales (color, margin, etc.) |

**Tag por defecto según variante:**
- `display-*` → `h1` (2xl, xl), `h2` (lg, md), `h3` (sm, xs)
- `text-xl` · `text-lg` · `text-md` · `text-sm` → `p`
- `text-xs` → `span`

#### Uso

```jsx
import TextAtom from './components/atoms/TextAtom'

// Título hero
<TextAtom variant="display-2xl" weight="bold" family="serif" className="text-gray-900">
  Arquitectura inteligente
</TextAtom>

// Párrafo de cuerpo
<TextAtom variant="text-md" className="text-gray-700">
  Genera diagramas a partir de lenguaje natural.
</TextAtom>

// Etiqueta pequeña como span
<TextAtom variant="text-xs" weight="medium" as="span" className="text-gray-500 uppercase">
  Versión beta
</TextAtom>

// Código inline
<TextAtom variant="text-sm" family="mono" as="code" className="text-brand-500">
  npm run dev
</TextAtom>
```

---

### HeaderAtom

**Archivo:** `src/components/atoms/HeaderAtom.jsx`
**Propósito:** Delegación semántica a `TextAtom` para headings. Convierte `level` (1–6) en
el par `(variant, tag)` correcto.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `level` | number | `2` | 1–6, determina tag HTML y tamaño display |
| `weight` | string | `'semibold'` | igual que TextAtom |
| `family` | string | `'sans'` | igual que TextAtom |
| `className` | string | `''` | clases adicionales |

**Mapeo level → variante:**
- level 1 → `display-2xl` (h1)
- level 2 → `display-xl` (h2)
- level 3 → `display-lg` (h3)
- level 4 → `display-md` (h4)
- level 5 → `display-sm` (h5)
- level 6 → `display-xs` (h6)

#### Uso

```jsx
import HeaderAtom from './components/atoms/HeaderAtom'

<HeaderAtom level={1} weight="bold" family="serif" className="text-gray-900">
  Arquitectura inteligente
</HeaderAtom>

<HeaderAtom level={2} className="text-brand-700">
  Análisis de requisitos
</HeaderAtom>
```

---

### LabelAtom

**Archivo:** `src/components/atoms/LabelAtom.jsx`
**Propósito:** Etiqueta semántica `<label>` para formularios. Siempre vinculada a un input
con `htmlFor`.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `htmlFor` | string | — | ID del input vinculado |
| `required` | bool | `false` | Muestra asterisco `*` rojo |
| `className` | string | `''` | clases adicionales |

**Estilos fijos:** `text-body-sm font-medium text-gray-700 block`

#### Uso

```jsx
import LabelAtom from './components/atoms/LabelAtom'

<LabelAtom htmlFor="email" required>Correo electrónico</LabelAtom>
<LabelAtom htmlFor="org">Organización</LabelAtom>
```

---

### InputAtom

**Archivo:** `src/components/atoms/InputAtom.jsx`
**Propósito:** Campo de texto `<input>` base con estilos del design system.

#### Props

| Prop | Tipo | Default | Valores posibles |
|---|---|---|---|
| `size` | string | `'md'` | `sm` · `md` · `lg` |
| `state` | string | `'default'` | `default` · `error` · `disabled` |
| `fullWidth` | bool | `false` | Si `true`, aplica `w-full` |
| `id` | string | — | Para vincular con `LabelAtom` |
| `disabled` | bool | — | Sobrescribe `state` a `'disabled'` |

**Acepta todos los props nativos de `<input>`** (type, placeholder, value, onChange, etc.)

#### Estilos por estado

| Estado | Borde | Focus |
|---|---|---|
| `default` | `border-gray-300` | `border-brand-500 shadow-focus-primary` |
| `error` | `border-error-500` | `border-error-500 shadow-focus-error` |
| `disabled` | `border-gray-200 bg-gray-50` | — |

#### Uso

```jsx
import InputAtom from './components/atoms/InputAtom'

// Con label vinculado
<LabelAtom htmlFor="email" required>Correo</LabelAtom>
<InputAtom id="email" type="email" placeholder="tu@email.com" fullWidth />

// Con error
<InputAtom state="error" placeholder="Campo requerido" />

// Deshabilitado
<InputAtom disabled placeholder="No editable" size="lg" />
```

---

### ButtonAtom

**Archivo:** `src/components/atoms/ButtonAtom.jsx`
**Propósito:** Botón polimórfico con 3 variantes de layout y 4 intents de color.

#### Props

| Prop | Tipo | Default | Valores posibles |
|---|---|---|---|
| `variant` | string | `'text'` | `text` · `icon` · `text-icon` |
| `intent` | string | `'primary'` | `primary` · `secondary` · `ghost` · `danger` |
| `size` | string | `'md'` | `xs` · `sm` · `md` · `lg` |
| `iconPosition` | string | `'leading'` | `leading` · `trailing` (solo para `text-icon`) |
| `icon` | ReactNode | — | Elemento ícono MUI, ej: `<SendIcon />` |
| `as` | string | `'button'` | `button` · `a` · cualquier tag HTML |
| `disabled` | bool | `false` | Deshabilita el elemento |
| `className` | string | `''` | clases adicionales |

#### Variantes de layout

- **`text`** — Solo texto. El icon prop se ignora.
- **`icon`** — Solo ícono, padding simétrico (cuadrado). Los children se ignoran; usa `icon` prop o `children` como ícono.
- **`text-icon`** — Texto + ícono. La posición del ícono se controla con `iconPosition`.

#### Intents de color

| Intent | Fondo | Texto | Hover |
|---|---|---|---|
| `primary` | `brand-600` | `white` | `brand-700` |
| `secondary` | `white` | `brand-700` | `brand-50` (outlined) |
| `ghost` | `transparent` | `gray-700` | `gray-100` |
| `danger` | `error-600` | `white` | `error-700` |

#### Tamaños

| Size | Padding (text/text-icon) | Padding (icon) | Font |
|---|---|---|---|
| `xs` | `px-2 py-1` | `p-1.5` | `text-body-xs` |
| `sm` | `px-3 py-2` | `p-2` | `text-body-sm` |
| `md` | `px-4 py-2.5` | `p-2.5` | `text-body-sm` |
| `lg` | `px-6 py-3` | `p-3` | `text-body-md` |

#### Uso

```jsx
import ButtonAtom from './components/atoms/ButtonAtom'
import SendIcon       from '@mui/icons-material/Send'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

// Primario
<ButtonAtom intent="primary">Enviar</ButtonAtom>

// Outlined
<ButtonAtom intent="secondary">Cancelar</ButtonAtom>

// Con ícono leading
<ButtonAtom variant="text-icon" intent="primary" icon={<SendIcon />}>
  Enviar mensaje
</ButtonAtom>

// Con ícono trailing
<ButtonAtom variant="text-icon" intent="ghost" iconPosition="trailing" icon={<ChevronRightIcon />}>
  Ver más
</ButtonAtom>

// Solo ícono (siempre añadir aria-label)
<ButtonAtom variant="icon" intent="danger" size="sm" aria-label="Eliminar">
  <DeleteOutlineIcon />
</ButtonAtom>

// Como enlace
<ButtonAtom as="a" href="/dashboard" intent="ghost">Ir al panel</ButtonAtom>

// Deshabilitado
<ButtonAtom disabled intent="primary">Procesando…</ButtonAtom>
```

---

### CheckboxAtom

**Archivo:** `src/components/atoms/CheckboxAtom.jsx`
**Propósito:** Checkbox personalizado con estilos del design system. Técnica peer/overlay
de Tailwind — el input nativo es invisible pero interactivo; un span hermano es la caja visual.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `checked` | bool | — | Estado controlado (recomendado siempre controlado) |
| `onChange` | function | — | `(e) => void` |
| `label` | string | — | Texto de la etiqueta |
| `indeterminate` | bool | `false` | Estado intermedio (solo JS, no hay atributo HTML) |
| `disabled` | bool | `false` | Deshabilita |
| `id` | string | — | Para vínculos externos |
| `children` | ReactNode | — | Alternativa a `label` para contenido rico |

#### Uso

```jsx
import CheckboxAtom from './components/atoms/CheckboxAtom'

// Básico
const [agreed, setAgreed] = useState(false)
<CheckboxAtom
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
  label="Acepto los términos"
/>

// Indeterminate (seleccionar todos)
<CheckboxAtom
  checked={allSelected}
  indeterminate={someSelected && !allSelected}
  onChange={handleSelectAll}
  label="Seleccionar todos"
/>

// Con contenido rico
<CheckboxAtom checked={v} onChange={(e) => setV(e.target.checked)}>
  Acepto los <a href="/terms" className="text-brand-600 underline">términos</a>
</CheckboxAtom>
```

---

### TooltipAtom

**Archivo:** `src/components/atoms/TooltipAtom.jsx`
**Propósito:** Contenedor flotante CSS + Portal. Usa `ReactDOM.createPortal` para renderizar
el globo directamente en `<body>` con `position: fixed; z-index: 9999`, garantizando que
**nunca sea recortado** por `overflow: hidden` de ningún contenedor padre.

La posición se calcula con `getBoundingClientRect()` en cada evento `mouseEnter`.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `content` | string | — | Texto del tooltip (obligatorio) |
| `position` | string | `'top'` | `top` · `right` · `bottom` · `left` |
| `className` | string | `''` | Clases adicionales para el wrapper `<span>` |
| `children` | ReactNode | — | El elemento trigger |

#### Uso

```jsx
import TooltipAtom from './components/atoms/TooltipAtom'

// Sobre un botón (top — default)
<TooltipAtom content="Enviar mensaje">
  <ButtonAtom variant="icon" intent="primary" aria-label="Enviar">
    <SendIcon />
  </ButtonAtom>
</TooltipAtom>

// A la derecha — para sidebar colapsado
<TooltipAtom content="Proyectos" position="right">
  <ButtonAtom variant="icon" intent="ghost" aria-label="Proyectos">
    <FolderOpenIcon />
  </ButtonAtom>
</TooltipAtom>
```

---

### BoxAtom

**Archivo:** `src/components/atoms/BoxAtom.jsx`
**Propósito:** Primitiva universal de layout. Reemplaza contenedores `<div>` crudos exponiendo
`display`, `spacing`, `sizing` y propiedades visuales como props resueltas a clases del design
system. Reduce la repetición de clases Tailwind y centraliza las decisiones de layout.

**Regla de uso:** Cualquier `<div>` que sirva exclusivamente de layout (flex, grid, spacing,
bg, border, shadow, rounded) debe ser un `<BoxAtom>` en lugar de un `<div>` plano.

#### Props

| Prop | Tipo | Default | Valores posibles |
|---|---|---|---|
| `as` | string | `'div'` | Cualquier tag HTML (`section`, `nav`, `ul`, `li`, etc.) |
| `display` | string | — | `flex` · `grid` · `block` · `inline` · `inline-flex` · `hidden` |
| `direction` | string | — | `row` · `col` · `row-reverse` · `col-reverse` |
| `wrap` | string | — | `wrap` · `nowrap` · `wrap-reverse` |
| `align` | string | — | `start` · `end` · `center` · `stretch` · `baseline` |
| `justify` | string | — | `start` · `end` · `center` · `between` · `around` · `evenly` |
| `gap` | string | — | `0` · `1` · `2` · `3` · `4` · `5` · `6` · `8` · `10` · `12` · `16` |
| `gapX` / `gapY` | string | — | igual que `gap` |
| `p` / `px` / `py` / `pt` / `pr` / `pb` / `pl` | string | — | `0`–`16` |
| `m` / `mx` / `my` / `mt` / `mr` / `mb` / `ml` | string | — | `0`–`16` · `auto` |
| `w` | string | — | `full` · `screen` · `auto` · `fit` · `min` · `max` |
| `h` | string | — | `full` · `screen` · `auto` |
| `minH` | string | — | `full` · `screen` · `0` |
| `maxW` | string | — | `xs` · `sm` · `md` · `lg` · `xl` · `2xl` · `3xl` · `4xl` · `5xl` · `6xl` · `7xl` · `full` · `none` · `prose` |
| `overflow` | string | — | `hidden` · `auto` · `scroll` · `visible` · `x-hidden` · `y-auto` · `y-scroll` |
| `position` | string | — | `relative` · `absolute` · `fixed` · `sticky` · `static` |
| `rounded` | string | — | `none` · `sm` · `md` · `lg` · `xl` · `2xl` · `full` |
| `shadow` | string | — | `none` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl` · `3xl` |
| `bg` | string | — | `white` · `transparent` · `gray-25`–`gray-900` · `brand-25`–`brand-900` |
| `border` | string | — | `none` (→ `border-0`) · `default` (→ `border`) · color (→ `border border-{color}`) |
| `flex` | string | — | `1` · `auto` · `none` · `initial` |
| `shrink` | string | — | `0` · `1` |
| `grow` | string | — | `0` · `1` |
| `className` | string | `''` | Clases adicionales no cubiertas por las props |

**Clases que NO mapean a props** (van en `className`):
- Gaps decimales: `gap-1.5`, `gap-0.5`, `gap-2.5`
- `flex-1`, `min-w-0`, `min-h-0`, `self-end`, `self-start`, `self-center`
- `ml-auto`, `mr-auto`, `max-w-screen-xl`, `max-h-[...]`
- Valores arbitrarios: `w-14`, `w-80`, `h-[calc(...)]`, `max-w-[75%]`
- Bordes direccionales: `border-t`, `border-b`, `border-l`, `border-r`, `border-l-2`
- Pseudo-clases: `focus-within:*`, `hover:*`, `transition-*`
- `aspect-*`, `backdrop-blur-*`, `select-none`, `inset-0`, `z-*`

#### Polimorfismo con `as`

```jsx
// Lista semántica sin perder el flex layout
<BoxAtom as="ul" display="flex" direction="col" gap="2">
  <BoxAtom as="li">Item 1</BoxAtom>
  <BoxAtom as="li">Item 2</BoxAtom>
</BoxAtom>

// Sección semántica con padding y borde
<BoxAtom as="section" p="6" border="gray-200" rounded="lg">
  ...
</BoxAtom>
```

#### Uso

```jsx
import BoxAtom from './components/atoms/BoxAtom'

// Flex row con gap
<BoxAtom display="flex" align="center" gap="3">
  <ButtonAtom intent="primary">Guardar</ButtonAtom>
  <ButtonAtom intent="ghost">Cancelar</ButtonAtom>
</BoxAtom>

// Flex column — card layout
<BoxAtom display="flex" direction="col" gap="4" p="6" bg="white" rounded="lg" shadow="md">
  <HeaderAtom level={3}>Título</HeaderAtom>
  <TextAtom variant="text-md" className="text-gray-600">Descripción...</TextAtom>
</BoxAtom>

// Contenedor centrado con ancho máximo
<BoxAtom maxW="4xl" mx="auto" px="4">
  ...
</BoxAtom>

// Overlay fijo (modal)
<BoxAtom position="fixed" display="flex" align="center" justify="center" className="inset-0 z-50 bg-gray-900/50">
  ...
</BoxAtom>

// Scroll vertical en panel
<BoxAtom overflow="y-auto" className="flex-1 min-h-0">
  ...
</BoxAtom>
```

---

## 6. Moléculas

> Las moléculas son composiciones de átomos con una función bien definida.
> Se clasifican en `src/components/molecules/`.
> **Regla:** Una molécula puede usar otras moléculas solo si es absolutamente necesario y
> están en el mismo nivel de abstracción.

---

### SectionHeader

**Archivo:** `src/components/molecules/SectionHeader.jsx`
**Propósito:** Encabezado de sección con título, descripción opcional y slot de acción.

#### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `title` | string | Título principal (obligatorio) |
| `description` | string | Subtexto descriptivo |
| `action` | ReactNode | Slot derecho (botón, badge, etc.) |
| `className` | string | Clases adicionales |

---

### InputForm

**Archivo:** `src/components/molecules/InputForm.jsx`
**Propósito:** Campo de formulario completo: LabelAtom + InputAtom + mensaje de hint/error.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `id` | string | — | Vincula label con input |
| `label` | string | — | Texto de la etiqueta |
| `type` | string | `'text'` | Tipo de input HTML |
| `placeholder` | string | — | Placeholder |
| `hint` | string | — | Texto de ayuda debajo |
| `error` | string | — | Mensaje de error (sobrescribe hint) |
| `required` | bool | `false` | Asterisco en label |
| `disabled` | bool | `false` | Deshabilita |
| `size` | string | `'md'` | `sm` · `md` · `lg` |
| `fullWidth` | bool | `true` | Ancho completo |

---

### Form

**Archivo:** `src/components/molecules/Form.jsx`
**Propósito:** Contenedor de formulario con gap consistente entre campos.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `gap` | string | `'md'` | `sm` · `md` · `lg` — espaciado entre items |
| `onSubmit` | function | — | Handler de submit |
| `children` | ReactNode | — | InputForm u otros campos |

---

### Chips

**Archivo:** `src/components/molecules/Chips.jsx`
**Propósito:** Lista de etiquetas seleccionables (single o multiselect).

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `items` | `{id, label}[]` | — | Lista de chips |
| `selected` | string \| string[] | — | ID(s) seleccionado(s) |
| `onSelect` | function | — | `(id) => void` |
| `multiSelect` | bool | `false` | Permite múltiple selección |
| `size` | string | `'md'` | `sm` · `md` · `lg` |

---

### Column

**Archivo:** `src/components/molecules/Column.jsx`
**Propósito:** Layout vertical con gap configurable. Contenedor semántico para agrupar elementos.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `gap` | string | `'md'` | `xs` · `sm` · `md` · `lg` · `xl` |
| `align` | string | `'start'` | `start` · `center` · `end` · `stretch` |
| `className` | string | `''` | clases adicionales |

---

### Cards

**Archivo:** `src/components/molecules/Cards.jsx`
**Propósito:** Contenedor tipo tarjeta con borde, sombra y padding consistente.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `padding` | string | `'md'` | `sm` · `md` · `lg` |
| `shadow` | string | `'sm'` | `xs` · `sm` · `md` |
| `border` | bool | `true` | Muestra borde `border-gray-100` |
| `className` | string | `''` | clases adicionales |
| `children` | ReactNode | — | Contenido |

---

### ChatHistory

**Archivo:** `src/components/molecules/ChatHistory.jsx`
**Propósito:** Item de historial de sesión en el sidebar de chat.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | — | Nombre de la sesión |
| `projectName` | string | — | Subtexto del proyecto |
| `timestamp` | string | — | Hora relativa de la sesión |
| `isActive` | bool | `false` | Resalta el item activo |
| `onClick` | function | — | Handler de selección |
| `unread` | bool | `false` | Muestra badge de no leído |

---

### BubbleMessage

**Archivo:** `src/components/molecules/BubbleMessage.jsx`
**Propósito:** Burbuja de mensaje de chat. Dos variantes: usuario (derecha, brand-100) y
AI (izquierda, blanco con borde).

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | string | `'ai'` | `user` · `ai` |
| `children` | ReactNode | — | Contenido del mensaje |
| `isLoading` | bool | `false` | Muestra tres puntos animados |
| `avatar` | ReactNode | — | Avatar (solo variante `ai`) |
| `timestamp` | string | — | Hora debajo de la burbuja |
| `className` | string | `''` | clases adicionales |

**Nota arquitectónica:** `BubbleMessage` envuelve `children` en `<TextAtom>` (renderiza como
`<p>`). Para pasar contenido rico (Markdown con bloques div), usar `MarkdownRenderer` directamente
sin envolverlo en `TextAtom`. Ver `ChatView.jsx` para el patrón `AssistantContent`.

#### Uso

```jsx
import BubbleMessage from './components/molecules/BubbleMessage'

<BubbleMessage variant="user" timestamp="14:23">
  ¿Qué es la arquitectura hexagonal?
</BubbleMessage>

<BubbleMessage variant="ai" timestamp="14:23">
  Es un patrón que aísla el dominio de sus dependencias externas…
</BubbleMessage>

// Loading state
<BubbleMessage variant="ai" isLoading />
```

---

### DropzoneFile

**Archivo:** `src/components/molecules/DropzoneFile.jsx`
**Propósito:** Área de carga de archivos con drag & drop. Estados: idle, dragging, error, disabled.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `onDrop` | function | — | `(files: File[]) => void` al soltar |
| `onFileSelect` | function | — | `(files: File[]) => void` al seleccionar |
| `accept` | string | `'*'` | MIME types o extensiones ej: `'.pdf,image/*'` |
| `multiple` | bool | `false` | Permitir múltiples archivos |
| `maxSizeMB` | number | — | Tamaño máximo en MB |
| `error` | string | — | Mensaje de error |
| `disabled` | bool | `false` | Deshabilita |

---

### MessageInput

**Archivo:** `src/components/molecules/MessageInput.jsx`
**Propósito:** Input principal del chat. Textarea auto-resize con botón de envío integrado.
Enter envía; Shift+Enter añade línea nueva.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `onSend` | function | — | `(text: string) => void` |
| `placeholder` | string | `'Escribe un mensaje…'` | Placeholder |
| `hint` | string | — | Texto de ayuda (default: atajos de teclado) |
| `disabled` | bool | `false` | Bloquea campo y botón |
| `maxRows` | number | `6` | Máximas líneas visibles antes de scroll |
| `className` | string | `''` | clases adicionales |

**Estado interno:** el valor del textarea es `uncontrolled` desde el exterior. No se usa
`value`/`onChange` externo — la vista recibe el texto solo al hacer submit vía `onSend`.

#### Uso

```jsx
import MessageInput from './components/molecules/MessageInput'

<MessageInput
  onSend={(msg) => handleSend(msg)}
  placeholder="Describe tu diagrama de arquitectura…"
  hint="Sé específico sobre los componentes."
  disabled={isLoading}
  maxRows={4}
/>
```

---

### ChatContainer

**Archivo:** `src/components/molecules/ChatContainer.jsx`
**Propósito:** Contenedor de scroll para mensajes de chat. Resuelve el problema de
`overflow-y-auto` en flex con `min-h-0`.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | ReactNode | — | `BubbleMessage` u otros hijos |
| `className` | string | `''` | Clases adicionales (ej: `flex-1`) |

**Clases base:** `flex flex-col gap-4 w-full min-h-0 overflow-y-auto px-4 py-4`

**Patrón de uso obligatorio:** el padre debe ser `flex flex-col` con altura definida.
`ChatContainer` necesita `flex-1` para que `overflow-y-auto` funcione.

```jsx
// CORRECTO
<div className="h-screen flex flex-col">
  <ChatContainer className="flex-1">
    {messages.map(m => <BubbleMessage key={m.id} ... />)}
  </ChatContainer>
  <MessageInput onSend={send} />
</div>

// INCORRECTO — overflow-y-auto no funcionará
<div className="h-screen">
  <ChatContainer>...</ChatContainer>
</div>
```

---

### Sidebar

**Archivo:** `src/components/molecules/Sidebar.jsx`
**Propósito:** Menú lateral de navegación con soporte de estado colapsado (solo iconos).

#### Props del Sidebar

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `items` | `SidebarItemDef[]` | — | Items del nav principal |
| `bottomItems` | `SidebarItemDef[]` | — | Items fijos al fondo |
| `footer` | ReactNode | — | Slot bajo los bottom items (oculto si collapsed) |
| `collapsed` | bool | `false` | Colapsa a iconos + TooltipAtom |
| `className` | string | `''` | Clases adicionales para el `<aside>` |

#### Shape de SidebarItemDef

```js
{
  id:       string,       // único
  label:    string,       // texto + tooltip en modo colapsado
  icon:     ReactNode,    // ícono MUI (opcional)
  href:     string,       // si existe → renderiza como <a>
  isActive: bool,         // resalta el item
  onClick:  function,     // handler (si no es href)
}
```

#### Estilos del item activo vs inactivo

- **Activo:** `bg-brand-50 text-brand-700 border-l-2 border-brand-500 font-semibold`
- **Inactivo:** `text-gray-600 border-l-2 border-transparent hover:bg-gray-50`
- **Colapsado:** `w-14 overflow-x-hidden` en el aside; los items muestran solo ícono con `TooltipAtom position="right"`

#### Uso

```jsx
import Sidebar from './components/molecules/Sidebar'
import HomeIcon from '@mui/icons-material/Home'
import ChatIcon from '@mui/icons-material/Chat'

<Sidebar
  collapsed={isCollapsed}
  items={[
    { id: 'home', label: 'Inicio', icon: <HomeIcon />, href: '/', isActive: true },
    { id: 'chat', label: 'Chat', icon: <ChatIcon />, onClick: () => navigate('/chat') },
  ]}
  bottomItems={[
    { id: 'settings', label: 'Configuración', icon: <SettingsIcon />, onClick: openSettings },
  ]}
  className="w-64"
/>
```

---

### RowTable

**Archivo:** `src/components/molecules/RowTable.jsx`
**Propósito:** Fila de tabla con layout de columnas configurables.

#### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `cells` | `ReactNode[]` | Contenido de cada celda en orden |
| `onClick` | function | Handler de click en la fila |
| `isHeader` | bool | Renderiza como fila de encabezado |
| `className` | string | Clases adicionales |

---

### Table

**Archivo:** `src/components/molecules/Table.jsx`
**Propósito:** Tabla completa con cabecera, filas y estado vacío.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `columns` | `{key, label, width?}[]` | — | Definición de columnas |
| `rows` | `object[]` | — | Datos a mostrar |
| `emptyState` | ReactNode | — | Contenido cuando `rows` está vacío |
| `onRowClick` | function | — | `(row) => void` |
| `className` | string | `''` | Clases adicionales |

---

### Modal

**Archivo:** `src/components/molecules/Modal.jsx`
**Propósito:** Overlay fijo con panel centrado. Se cierra con `Escape` o click en el overlay.
No usa React Portal (z-50 es suficiente en este contexto).

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `isOpen` | bool | — | Controla visibilidad |
| `onClose` | function | — | Llamado al cerrar |
| `title` | string | — | Título en la cabecera |
| `size` | string | `'md'` | `sm` (max-w-sm) · `md` (max-w-lg) · `lg` (max-w-2xl) · `xl` (max-w-4xl) |
| `footer` | ReactNode | — | Slot de acciones en el pie |
| `children` | ReactNode | — | Cuerpo del modal |
| `className` | string | `''` | Clases para el panel |

#### Uso

```jsx
import Modal from './components/molecules/Modal'

const [open, setOpen] = useState(false)

<ButtonAtom onClick={() => setOpen(true)}>Abrir modal</ButtonAtom>

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Nuevo proyecto"
  size="md"
  footer={
    <>
      <ButtonAtom intent="ghost" onClick={() => setOpen(false)}>Cancelar</ButtonAtom>
      <ButtonAtom intent="primary" onClick={handleCreate}>Crear</ButtonAtom>
    </>
  }
>
  <Form gap="md">
    <InputForm id="name" label="Nombre" required />
  </Form>
</Modal>
```

---

### AlertDialog

**Archivo:** `src/components/molecules/AlertDialog.jsx`
**Propósito:** Modal de confirmación destructiva. Variante semántica de `Modal` con ícono
de advertencia y botón de confirmación en `danger`.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `isOpen` | bool | — | Controla visibilidad |
| `onClose` | function | — | Cancelar |
| `onConfirm` | function | — | Confirmar la acción destructiva |
| `title` | string | — | Título del diálogo |
| `description` | string | — | Descripción del riesgo |
| `confirmLabel` | string | `'Eliminar'` | Texto del botón de confirmación |
| `cancelLabel` | string | `'Cancelar'` | Texto del botón de cancelación |

---

### CodeBlock

**Archivo:** `src/components/molecules/CodeBlock.jsx`
**Propósito:** Bloque de código con syntax highlighting Prism. Tema oscuro vscDarkPlus adaptado
a la paleta ArchIA. Botón "Copiar" con feedback visual de 2 s.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `code` | string | `''` | Código a mostrar |
| `language` | string | `'plaintext'` | Lenguaje para highlighting |
| `showLineNumbers` | bool | `false` | Muestra números de línea |
| `className` | string | `''` | Clases adicionales del contenedor |

**Lenguajes soportados:** `javascript` · `typescript` · `jsx` · `tsx` · `python` · `bash` · `sh`
· `json` · `html` · `css` · `markdown` · `sql` · `yaml` · `plaintext`

**Estilos fijos:** fondo `bg-gray-900`, header `bg-gray-800`, fuente `JetBrains Mono`, scroll
horizontal en líneas largas.

#### Uso

```jsx
import CodeBlock from './components/molecules/CodeBlock'

<CodeBlock
  language="typescript"
  code={`function greet(name: string): string {
  return \`Hola, \${name}!\`
}`}
  showLineNumbers
/>

<CodeBlock language="bash" code="npm install && npm run dev" />
<CodeBlock language="json" code={JSON.stringify(config, null, 2)} />
```

---

## 7. Organismos

> Los organismos son secciones autónomas con lógica propia que pueden incluir estado local
> y componer moléculas + átomos. Se clasifican en `src/components/organisms/`.

---

### MarkdownRenderer

**Archivo:** `src/components/organisms/MarkdownRenderer.jsx`
**Propósito:** Motor visual de respuestas de la IA. Renderiza texto Markdown con `react-markdown`
+ `remark-gfm`. **Cero `@tailwindcss/typography`** — control absoluto sobre cada elemento
a través del sistema de tokens.

**Dependencias:** `react-markdown ^10`, `remark-gfm ^4` (ya instalados).

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `content` | string | `''` | Texto Markdown en crudo |
| `className` | string | `''` | Clases adicionales para el contenedor raíz |

#### Mapeo de elementos HTML → tokens

| Elemento | Clases aplicadas | Notas |
|---|---|---|
| `p` | `font-sans text-body-md leading-relaxed text-gray-700` | `mb-3 last:mb-0` |
| `h1` | `font-serif text-display-md font-semibold text-gray-900` | `mt-8 mb-4` |
| `h2` | `font-serif text-display-sm font-semibold text-gray-900` | `mt-6 mb-3` |
| `h3` | `font-serif text-display-xs font-semibold text-gray-900` | `mt-5 mb-2` |
| `h4` | `font-sans text-body-lg font-semibold text-gray-800` | `mt-4 mb-2` |
| `h5/h6` | `font-sans text-body-md/sm font-semibold text-gray-800/700` | `mt-3 mb-1` |
| `a` | `text-brand-600 font-medium hover:text-brand-700 hover:underline` | `target="_blank"` |
| `ul` | `list-disc ml-6 space-y-1.5 text-body-md text-gray-700` | — |
| `ol` | `list-decimal ml-6 space-y-1.5 text-body-md text-gray-700` | — |
| `code` inline | `font-mono text-body-xs bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded-md` | — |
| `code` block | delega en `<CodeBlock language={...} />` | Detecta `language-*` en className |
| `pre` | transparent (delega al handler de `code`) | — |
| `blockquote` | `border-l-4 border-brand-300 bg-brand-25 italic text-gray-600` | `pl-4 pr-3 py-2 rounded-r-md` |
| `hr` | `border-0 border-t border-gray-200 my-6` | — |
| `strong` | `font-semibold text-gray-900` | — |
| `em` | `italic text-gray-600` | — |
| `del` (GFM) | `line-through text-gray-400` | — |
| `table` | `border border-gray-200 rounded-lg overflow-x-auto shadow-xs` | — |
| `thead` | `bg-gray-50 border-b border-gray-200` | — |
| `tbody` | `divide-y divide-gray-100` | — |
| `tr` | `hover:bg-gray-50 transition-colors` | — |
| `th` | `p-3 font-semibold text-gray-700 whitespace-nowrap` | — |
| `td` | `p-3 text-gray-600` | — |

#### Uso

```jsx
import MarkdownRenderer from './components/organisms/MarkdownRenderer'

// Respuesta básica de la IA
<MarkdownRenderer content={message.text} />

// Con ancho máximo
<MarkdownRenderer content={message.text} className="max-w-2xl" />

// Dentro de BubbleMessage (sin usar el TextAtom interno)
// — Ver patrón AssistantContent en ChatView.jsx
<div className="px-4 py-2.5 bg-white rounded-lg">
  <MarkdownRenderer content={aiText} />
</div>
```

---

## 8. Capa de servicios, hooks y vistas

La arquitectura del chat sigue separación estricta de responsabilidades:

```
chatService.js      ← Red (fetch puro)
useChatManager.js   ← Estado + persistencia (localStorage)
ChatView.jsx        ← Renderizado (zero fetch, zero localStorage)
```

### chatService.js

**Archivo:** `src/services/chatService.js`
**Contiene:** funciones async puras, sin React. Construye `FormData` y llama a la API.

```js
const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

sendMessage({ text, sessionId, images })  → { text, internalMessages, mermaidCode, sessionId, messageId, suggestions }
sendFeedback({ sessionId, messageId, thumbsUp, thumbsDown }) → Promise<void>
```

**Variable de entorno:** `VITE_API_BASE` en `.env.local`. Si no existe, usa `http://localhost:8000`.

### useChatManager.js

**Archivo:** `src/hooks/useChatManager.js`
**Contiene:** estado de sesiones y mensajes, persistencia en localStorage, lógica de envío
optimista con guard de secuencia de requests.

**Claves de localStorage:**
- `arquia.sessions` → array de `{ id, title, createdAt }`
- `arquia.chat.{sessionId}` → array de mensajes de esa sesión

**API pública del hook:**

```js
const {
  // Estado de solo lectura
  sessions,        // SesionDef[]
  sessionId,       // string — sesión activa
  messages,        // Mensaje[]
  isBusy,          // bool — hay un pending=true
  ratedMessages,   // Set<string> — ids ya valorados

  // Acciones
  setSessionId,    // (id) => void
  createSession,   // () => void
  renameSession,   // (id, title) => void
  deleteSession,   // (id) => void
  send,            // async (text, images[]) => void
  rateMessage,     // (sessionId, messageId, isUp: bool) => void
} = useChatManager()
```

**Exports adicionales:**
- `summarizeRoles(internal)` → `[nombre, conteo][]` ordenados por relevancia
- `extractRagSources(internal)` → `string[]` de fuentes RAG

### ChatView.jsx

**Archivo:** `src/views/ChatView.jsx`
**Contiene:** renderizado puro. Usa `useChatManager()` para datos y acciones, componentes del
design system para la UI. **Sin** imports de `fetch`, `localStorage` ni `@mui/material`.

**Componentes locales internos (no exportados, solo para uso dentro de ChatView):**
- `AssistantContent({ text })` — renderiza la respuesta IA con `MarkdownRenderer`
- `AgentRoleBadges({ internalMessages })` — badges de agentes usando `summarizeRoles`
- `SuggestionChips({ suggestions, onSelect, disabled })` — chips de sugerencias
- `FeedbackButtons({ sessionId, messageId, rated, onRate })` — pulgares arriba/abajo

---

## 9. Reglas para agregar componentes

### Checklist obligatorio al crear un átomo nuevo

- [ ] El archivo va en `src/components/atoms/`
- [ ] No importa otros átomos (excepción: `HeaderAtom` importa `TextAtom` y moléculas/átomos pueden importar `BoxAtom`)
- [ ] No importa componentes MUI (solo `@mui/icons-material`)
- [ ] Todas las clases de color/tipografía usan tokens del design system
- [ ] Props documentadas en el JSDoc del archivo
- [ ] Prop `className` siempre aceptada para extensibilidad
- [ ] `...props` pasados al elemento raíz para accesibilidad (aria-*, data-*, etc.)
- [ ] Estado `disabled` manejado semánticamente (no solo opacidad visual)
- [ ] Bloque de ejemplos de uso al final del archivo
- [ ] Demo añadida a `AtomShowcase.jsx` (NAV_ITEMS + sección + `<NuevoAtomSection />`)

### Checklist obligatorio al crear una molécula nueva

- [ ] El archivo va en `src/components/molecules/`
- [ ] Compone átomos, no los reinventa (usar `ButtonAtom` en lugar de `<button>`, `BoxAtom` en lugar de `<div>` de layout)
- [ ] Si necesita tooltip sobre elementos, usa `TooltipAtom` (no CSS group/group-hover)
- [ ] Si tiene scroll vertical, usa el patrón `flex-1 min-h-0` en el padre
- [ ] El `aside` o cualquier sidebar usa `overflow-x-hidden` permanente
- [ ] No importa `@mui/material` — solo `@mui/icons-material`
- [ ] Prop `className` aceptada y aplicada al elemento raíz
- [ ] `...props` pasados al elemento raíz
- [ ] Bloque de ejemplos de uso al final
- [ ] Demo añadida a `MoleculeShowcase.jsx` con badge `@molecule`

### Checklist al crear un organismo nuevo

- [ ] El archivo va en `src/components/organisms/`
- [ ] Puede tener estado local (`useState`, `useEffect`) pero no accede a APIs ni localStorage
  directamente — eso es responsabilidad de los hooks
- [ ] Compone moléculas + átomos
- [ ] Demo añadida a `MoleculeShowcase.jsx` con badge `@organism` (`type="organism"` en `ShowcaseSection`)

### Añadir tokens nuevos

1. Definir la CSS Custom Property en `src/styles/tokens.css`
2. Mapearla en el bloque `@theme inline` de `src/styles/index.css`
3. Nunca usar valores hexadecimales hardcodeados en los componentes

### Cómo extender la paleta de colores

Si se necesita un color nuevo que no existe en la paleta actual:

```css
/* tokens.css */
:root {
  --color-brand-950: #001F33;  /* ejemplo */
}

/* index.css → @theme inline */
--color-brand-950: var(--color-brand-950);
```

Luego se puede usar como `text-brand-950`, `bg-brand-950`, `border-brand-950`.

### Convención de nombres de componentes

- **Átomos:** `NombreAtom.jsx` — ej: `ButtonAtom`, `TextAtom`
- **Moléculas:** `NombreMolecule.jsx` — ej: `ChatHistory`, `MessageInput` (sin sufijo obligatorio)
- **Organismos:** `NombreOrganism.jsx` o nombre descriptivo — ej: `MarkdownRenderer`
- **Vistas:** `NombreView.jsx` — ej: `ChatView`

---

## 10. Anti-patrones — qué NUNCA hacer

### ❌ Importar componentes de MUI

```jsx
// INCORRECTO
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

// CORRECTO
import ButtonAtom from '../atoms/ButtonAtom'
import InputAtom  from '../atoms/InputAtom'
import SendIcon   from '@mui/icons-material/Send'  // solo íconos ✓
```

### ❌ Hardcodear colores o tipografía

```jsx
// INCORRECTO
<p style={{ color: '#0088CC', fontSize: '16px' }}>Texto</p>
<div className="text-[#252B37]">...</div>

// CORRECTO
<TextAtom variant="text-md" className="text-brand-600">Texto</TextAtom>
<div className="text-gray-800">...</div>
```

### ❌ Crear un `<button>` HTML plano en lugar de ButtonAtom

```jsx
// INCORRECTO
<button className="bg-blue-500 text-white px-4 py-2 rounded">Enviar</button>

// CORRECTO
<ButtonAtom intent="primary">Enviar</ButtonAtom>
```

### ❌ Usar `position: absolute` para tooltips dentro de contenedores con overflow

```jsx
// INCORRECTO — el tooltip será recortado por overflow:hidden
<div className="relative">
  <div className="absolute top-0 left-0 ...">Tooltip</div>
</div>

// CORRECTO — TooltipAtom usa createPortal + position: fixed
<TooltipAtom content="Ayuda contextual">
  <ButtonAtom variant="icon">...</ButtonAtom>
</TooltipAtom>
```

### ❌ Usar `overflow-hidden` en sidebars sin separar los ejes

```jsx
// INCORRECTO — bloquea el scroll Y también
<aside className={collapsed ? 'w-14 overflow-hidden' : ''}>

// CORRECTO — solo bloquea X para evitar scroll horizontal
<aside className="overflow-x-hidden ...">
```

### ❌ ChatContainer sin el patrón flex padre

```jsx
// INCORRECTO — overflow-y-auto nunca activará
<div className="h-64">
  <ChatContainer>...</ChatContainer>
</div>

// CORRECTO
<div className="h-64 flex flex-col">
  <ChatContainer className="flex-1">...</ChatContainer>
</div>
```

### ❌ Usar `@tailwindcss/typography` (prose)

El design system tiene control explícito sobre cada elemento HTML vía `MarkdownRenderer`.
No instalar ni usar el plugin `@tailwindcss/typography`.

### ❌ Lógica de red o localStorage en componentes visuales

```jsx
// INCORRECTO — mezcla red con presentación
function MyView() {
  const data = await fetch('/api/...')
  localStorage.setItem('key', data)
}

// CORRECTO — separación de capas
// Red → chatService.js
// Estado/persistencia → useChatManager.js
// Presentación → ChatView.jsx (consume el hook)
```

### ❌ Usar `<div>` plano para layout cuando BoxAtom cubre el caso

```jsx
// INCORRECTO — div con clases de layout repetidas manualmente
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  ...
</div>

// CORRECTO — BoxAtom resuelve las mismas clases con props tipadas
<BoxAtom display="flex" direction="col" gap="4" p="6" bg="white" rounded="lg" shadow="md">
  ...
</BoxAtom>
```

**Excepciones válidas para `<div>` nativo:**
- Elementos con handlers de interacción compleja (`onDragOver`, `onDrop`, `role="button"` + `onClick`)
- Clases que no mapean a props de BoxAtom (valores arbitrarios, bordes direccionales, etc.) — en ese caso usar `BoxAtom` con `className`
- Divisores visuales sin layout (`<div className="h-px bg-gray-200" />`)

---

### ❌ CSS-only group/group-hover para tooltips

```jsx
// INCORRECTO — se recorta en contenedores con overflow
<div className="relative group">
  <div className="absolute hidden group-hover:block">Tooltip</div>
</div>

// CORRECTO
<TooltipAtom content="Tooltip">
  <div>trigger</div>
</TooltipAtom>
```

---

## Apéndice: Flujo de trabajo con este Design System

Cuando un agente o desarrollador recibe una tarea nueva:

1. **Identificar el nivel Atomic Design** del componente a crear:
   - ¿Es indivisible, sin dependencias? → Átomo
   - ¿Compone átomos para una función específica? → Molécula
   - ¿Es una sección autónoma con lógica? → Organismo
   - ¿Es una pantalla completa? → Vista (en `src/views/`)

2. **Verificar tokens disponibles** en la sección [3. Design Tokens](#3-design-tokens)
   antes de añadir cualquier valor de color, tamaño o sombra.

3. **Reusar átomos existentes**. Si necesitas un botón, usa `ButtonAtom`. Si necesitas
   texto, usa `TextAtom`. No reinventar la rueda.

4. **Seguir el checklist** de la sección [9. Reglas para agregar componentes](#9-reglas-para-agregar-componentes).

5. **Añadir el componente al showcase** correspondiente (`AtomShowcase.jsx` o `MoleculeShowcase.jsx`)
   para que sea visible y verificable.

6. **Verificar en `npm run dev`** que no hay errores de compilación ni warnings de ESLint.

---

*ArchIA Design System — Atomic Design + Tailwind CSS v4 + React 19*
*Última actualización: 2026-03-09*
