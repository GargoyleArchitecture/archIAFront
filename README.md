# ArchIAFront

Frontend del sistema **ArchIA**, un asistente inteligente especializado en diseño de arquitectura de software basado en la metodología ADD 3.0.

Este repositorio contiene exclusivamente el frontend. El backend vive en un repositorio separado (`archIABack`).

---

## Tabla de Contenidos

1. [Requisitos](#requisitos)
2. [Quick Start — Backend (repo separado)](#quick-start--backend-repo-separado)
3. [Quick Start — Frontend](#quick-start--frontend)
4. [Variables de Entorno](#variables-de-entorno)
5. [Troubleshooting](#troubleshooting)
6. [Arquitectura del Proyecto (Atomic Design)](#arquitectura-del-proyecto-atomic-design)
7. [Gestion del Proyecto (Kanban)](#gestion-del-proyecto-kanban)
8. [Convenciones de Issues](#convenciones-de-issues)
9. [Flujo de Git y Conventional Commits](#flujo-de-git-y-conventional-commits)
10. [Definicion de Hecho](#definicion-de-hecho)

---

## Requisitos

| Herramienta | Version minima       | Notas                           |
| :---------- | :------------------- | :------------------------------ |
| Node.js     | 18.x                 | Requerido                       |
| npm         | Incluido con Node.js | Se usa `npm ci` para instalar |

Para verificar:

```bash
node -v
npm -v
```

---

## Quick Start — Backend (repo separado)

El frontend requiere que el backend este corriendo en `http://localhost:8000`. Clonar y levantar `archIABack` siguiendo su propio README. El flujo resumido es:

```bash
# En el repositorio archIABack
cd back
python3.11 -m poetry env use python3.11
python3.11 -m poetry install
# Configurar back/.env con OPENAI_API_KEY
python3.11 -m poetry run uvicorn src.main:app --port 8000
```

Una vez que el backend responda en `http://localhost:8000/docs`, continuar con los pasos del frontend.

---

## Quick Start — Frontend

Abrir una nueva terminal en la raiz de este repositorio y ejecutar los pasos en orden.

### 1. Instalar dependencias

```bash
npm ci
```

> `npm ci` instala exactamente lo que indica `package-lock.json`. Usar este comando en lugar de `npm install` para garantizar reproducibilidad.

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicacion queda disponible en `http://localhost:5173`.

---

## Troubleshooting

**Error al instalar dependencias o conflictos de versiones:**

Eliminar `node_modules` y el cache de npm, luego reinstalar desde cero:

```bash
rm -rf node_modules
npm cache clean --force
npm ci
```

**El frontend carga pero no responde (llamadas a la API fallan):**

- Verificar que el backend este corriendo: `curl http://localhost:8000/docs`
- Verificar que `front/.env.local` exista y contenga `VITE_API_BASE=http://localhost:8000`
- Reiniciar el servidor de desarrollo despues de modificar `.env.local`

**Puerto 5173 ocupado:**

```bash
npm run dev -- --port 5174
```

---

## Arquitectura del Proyecto (Atomic Design)

Los componentes ubicados en `src/components/` siguen la metodologia Atomic Design. Un componente solo puede importar desde su mismo nivel o niveles inferiores.

| Capa       | Directorio     | Responsabilidad                                                                             |
| :--------- | :------------- | :------------------------------------------------------------------------------------------ |
| Atomos     | `atoms/`     | Elementos de UI minimos e indivisibles (Button, Input, Icon). Sin logica de negocio.        |
| Moleculas  | `molecules/` | Combinacion de dos o mas atomos (ej.`SearchBar = Input + Button`).                        |
| Organismos | `organisms/` | Secciones complejas compuestas por moleculas y atomos (Navbar, Footer, ProductCard).        |
| Plantillas | `templates/` | Layouts y grillas de pagina. Definen la estructura pero no reciben datos reales.            |
| Paginas    | `pages/`     | Instancias de plantillas conectadas a logica de negocio, estado global y llamadas a la API. |

---

## Gestion del Proyecto (Kanban)

El trabajo se visualiza en el tablero Kanban del proyecto. Cada tarea avanza por las siguientes columnas:

| Estado                  | Descripcion                                                                                  |
| :---------------------- | :------------------------------------------------------------------------------------------- |
| **Backlog**       | Ideas, bugs reportados y tareas pendientes de priorizacion por el Product Owner o Tech Lead. |
| **Ready for Dev** | Issues refinadas con descripcion clara, listas para ser tomadas por un desarrollador.        |
| **In Progress**   | Tareas en las que se trabaja activamente. Limite: 1 tarea por desarrollador a la vez.        |
| **Review / QA**   | Desarrollo terminado, Pull Request abierto y esperando revision de codigo o pruebas.         |
| **Done**          | PR aprobado, fusionado y desplegado.                                                         |

---

## Convenciones de Issues

Toda nueva tarea, bug o mejora debe estar documentada en una Issue antes de escribir codigo. Al crear una Issue, utilizar los templates predefinidos (`Bug Report`, `Feature Request`, `Docs`).

### Formato del Titulo

```
[TIPO][SPRINT-XX][SCOPE] Descripcion breve
```

- **TIPO**: `[BUG]`, `[FEAT]`, `[DOCS]`, `[CHORE]`
- **SPRINT**: Ciclo de trabajo actual (ej. `S01`, `S02`). Usar `[BACKLOG]` si no corresponde a un sprint.
- **SCOPE**: Area afectada (ej. `AUTH`, `UI`, `API`, `CONFIG`)

**Ejemplos validos:**

```
[FEAT][S03][AUTH] Agregar boton de inicio de sesion con Google
[BUG][S03][UI] El modal de confirmacion no se cierra en dispositivos moviles
```

---

## Flujo de Git y Conventional Commits

Todo el codigo nuevo debe desarrollarse en ramas independientes y enviarse a la rama principal mediante un Pull Request.

### Nomenclatura de Ramas

```
feat/nombre-de-la-feature
bugfix/nombre-del-bug
chore/actualizacion-dependencias
```

### Conventional Commits

Este proyecto sigue la especificacion [Conventional Commits](https://www.conventionalcommits.org/).

**Formato:** `<tipo>(<scope>): <descripcion>`

| Tipo         | Proposito                                                        |
| :----------- | :--------------------------------------------------------------- |
| `feat`     | Nueva funcionalidad                                              |
| `fix`      | Correccion de un error                                           |
| `docs`     | Cambios exclusivos en documentacion                              |
| `style`    | Cambios de formato sin impacto en la logica                      |
| `refactor` | Cambio de codigo que no corrige un error ni agrega funcionalidad |
| `perf`     | Mejora de rendimiento                                            |
| `test`     | Agregar o corregir pruebas                                       |
| `chore`    | Tareas de construccion, configuracion o dependencias             |

**Ejemplo:**

```
feat(atoms): create primary button component with hover states
```

---

## Definicion de Hecho

Una tarea no esta terminada hasta que cumple con todos los siguientes criterios:

- [ ] El codigo cumple con las reglas de Atomic Design (ubicacion y responsabilidades correctas).
- [ ] No hay errores de compilacion, warnings en la consola ni errores de linter.
- [ ] Los commits siguen el estandar Conventional Commits.
- [ ] El Pull Request incluye la palabra clave para cerrar la issue asociada (ej. `Closes #12`).
