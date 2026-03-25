# ArchIAFront

Este repositorio sigue metodologías **Ágiles** y estándares estrictos de la industria para garantizar un código Front-End mantenible, escalable y una colaboración fluida entre los desarrolladores.

---

## 📑 Tabla de Contenidos

1. [Arquitectura del Proyecto (Atomic Design)](#-arquitectura-del-proyecto-atomic-design)
2. [Gestión del Proyecto (Kanban)](#-gestión-del-proyecto-kanban)
3. [Convenciones de Issues](#-convenciones-de-issues)
4. [Flujo de Git y Conventional Commits](#-flujo-de-git-y-conventional-commits)
5. [Definición de Hecho (DoD)](#-definición-de-hecho-dod)

---

## ⚛️ Arquitectura del Proyecto: Atomic Design

Para mantener nuestra interfaz de usuario (UI) escalable y reutilizable, organizamos nuestros componentes siguiendo la metodología **Atomic Design**. La regla de oro es: *Un componente solo puede importar componentes de su mismo nivel o de niveles inferiores.*

Estructura principal dentro de `src/components/`:

* **`atoms/`**: Componentes mínimos e indivisibles (Botones, Inputs, Textos, Iconos). Son puros y no tienen lógica de negocio.
* **`molecules/`**: Combinación de dos o más átomos que funcionan juntos (Un `SearchBar` = `Input` + `Button`).
* **`organisms/`**: Componentes complejos formados por moléculas y átomos que forman secciones completas de la interfaz (Navbar, Footer, ProductCard).
* **`templates/`**: Estructuras de página o Layouts. Definen la cuadrícula y dónde van los organismos, pero no reciben datos reales.
* **`pages/`**: Instancias de los templates. Aquí es donde se conecta la lógica de negocio, los estados globales y las llamadas a la API con la interfaz.

---

## 📊 Gestión del Proyecto (Kanban)

El flujo de trabajo se visualiza en nuestro tablero de proyecto (Kanban). Cada tarea se mueve a través de las siguientes columnas:

| Estado | Descripción |
| :--- | :--- |
| **Backlog** | Ideas, bugs reportados y tareas pendientes de priorización por el Product Owner / Tech Lead. |
| **Ready for Dev** | Issues refinadas, con descripción clara y listas para ser tomadas por un desarrollador. |
| **In Progress** | Tareas en las que se está trabajando activamente. (Límite: 1 tarea por desarrollador a la vez). |
| **Review / QA** | Desarrollo terminado, Pull Request (PR) abierto y esperando revisión de código o pruebas. |
| **Done** | PR aprobado, fusionado (merged) y desplegado. |

---

## 🏷️ Convenciones de Issues

Toda nueva tarea, bug o mejora debe estar documentada en una Issue antes de escribir código. Al crear una Issue, utiliza los templates predefinidos (`Bug Report`, `Feature Request`, `Docs`).

### Nomenclatura del Título

Para mantener la trazabilidad con los Sprints, el título de la Issue debe seguir estrictamente este formato:

`[TIPO][SPRINT-XX][SCOPE] Descripción breve`

* **TIPO**: `[BUG]`, `[FEAT]`, `[DOCS]`, `[CHORE]`.
* **SPRINT**: El ciclo de trabajo actual (ej. `S01`, `S02`). Si no aplica, usar `[BACKLOG]`.
* **SCOPE**: El área afectada (ej. `AUTH`, `UI`, `API`, `CONFIG`).

**Ejemplos válidos:**
> `[FEAT][S03][AUTH] Añadir botón de inicio de sesión con Google`
> `[BUG][S03][UI] El modal de confirmación no se cierra en móviles`

---

## 💬 Flujo de Git y Conventional Commits

Todo el código nuevo debe desarrollarse en ramas (branches) independientes y enviarse a la rama principal (`main`/`develop`) a través de un Pull Request.

### Nomenclatura de Ramas
* `feat/nombre-de-la-feature`
* `bugfix/nombre-del-bug`
* `chore/actualizacion-dependencias`

### Conventional Commits
Adoptamos la especificación [Conventional Commits](https://www.conventionalcommits.org/). Esto facilita la lectura del historial y la automatización de versiones.

**Formato:** `<tipo>(<scope>): <descripción>`

**Tipos permitidos:**
* `feat`: Nueva funcionalidad.
* `fix`: Corrección de un error.
* `docs`: Cambios exclusivos en la documentación.
* `style`: Cambios de formato (espacios, comas, etc) que no afectan la lógica.
* `refactor`: Cambio de código que no corrige un error ni añade una funcionalidad.
* `perf`: Mejora de rendimiento.
* `test`: Añadir o corregir pruebas.
* `chore`: Tareas de construcción, configuración o dependencias.

**Ejemplo de Commit:**
> `feat(atoms): create primary button component with hover states`

---

## ✅ Definición de Hecho (Definition of Done - DoD)

Una tarea no está terminada hasta que cumple con los siguientes criterios:

- [ ] El código cumple con las reglas de Atomic Design (ubicación y responsabilidades correctas).
- [ ] No hay errores de compilación, warnings en la consola, ni errores de linter.
- [ ] Los Commits siguen el estándar *Conventional Commits*.
- [ ] El Pull Request incluye la palabra clave para cerrar la issue (ej. `Closes #12`).

---
