/**
 * demoMessages.js — Respuestas predefinidas de ArchIA para modo demo.
 *
 * Cada entrada es un string de Markdown con contenido real sobre
 * arquitectura de software. Incluyen inline code, code blocks,
 * listas, tablas y headings para ejercitar el MarkdownRenderer.
 */

const DEMO_MESSAGES = [

  /* ── 1. Arquitectura Hexagonal ── */
  `## Arquitectura Hexagonal (Ports & Adapters)

La **arquitectura hexagonal**, propuesta por Alistair Cockburn, aísla el núcleo del dominio de sus dependencias externas mediante el patrón *ports & adapters*.

### Principio central

> El dominio nunca depende de la infraestructura. La infraestructura depende del dominio.

### Capas principales

| Capa | Rol | Ejemplo |
|---|---|---|
| **Domain** | Lógica de negocio pura | Entidades, Value Objects |
| **Application** | Casos de uso | \`CreateProjectUseCase\` |
| **Ports** | Interfaces (contratos) | \`IProjectRepository\` |
| **Adapters** | Implementaciones concretas | \`PostgresProjectRepo\` |

### Estructura de carpetas típica

\`\`\`
src/
├── domain/
│   ├── Project.ts          ← Entidad
│   └── IProjectRepository.ts  ← Port (interfaz)
├── application/
│   └── CreateProject.usecase.ts
└── infrastructure/
    └── PostgresProjectRepo.ts  ← Adapter
\`\`\`

La regla clave: \`domain/\` **nunca** tiene imports de \`infrastructure/\`. El flujo de dependencias apunta siempre hacia adentro.`,


  /* ── 2. Microservicios con Docker Compose ── */
  `## Descomposición en Microservicios

Para un sistema de e-commerce, una estrategia de descomposición basada en **Bounded Contexts** (DDD) daría como resultado:

- \`order-service\` — gestión del ciclo de vida de pedidos
- \`inventory-service\` — stock y reservas
- \`payment-service\` — integración con pasarelas de pago
- \`notification-service\` — emails y push notifications (consumidor de eventos)

### Orquestación local con Docker Compose

\`\`\`yaml
version: "3.9"

services:
  order-service:
    build: ./order-service
    environment:
      - DATABASE_URL=postgres://db:5432/orders
      - KAFKA_BROKER=kafka:9092
    depends_on: [db, kafka]

  inventory-service:
    build: ./inventory-service
    environment:
      - DATABASE_URL=postgres://db:5432/inventory

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    ports:
      - "9092:9092"

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
\`\`\`

### Comunicación entre servicios

Usa **mensajería asíncrona** (Kafka, RabbitMQ) para operaciones que toleran eventual consistency, y **REST/gRPC** para consultas síncronas que requieren respuesta inmediata.

> **Regla**: si dos servicios se llaman síncronamente de forma frecuente, considera fusionarlos — probablemente pertenecen al mismo Bounded Context.`,


  /* ── 3. Principios SOLID ── */
  `## Principios SOLID aplicados

Los principios SOLID guían el diseño a nivel de clase/módulo para mantener el código flexible y testeable.

### Single Responsibility Principle (SRP)

Cada clase tiene **una sola razón para cambiar**. Ejemplo incorrecto:

\`\`\`typescript
// ❌ Dos responsabilidades: lógica de negocio + persistencia
class UserService {
  createUser(data: CreateUserDto) { /* ... */ }
  saveToDatabase(user: User) { /* SQL directo aquí */ }
}
\`\`\`

Correcto: separar \`UserService\` de \`UserRepository\`.

### Open/Closed Principle (OCP)

Las clases deben estar **abiertas para extensión, cerradas para modificación**. Usa interfaces para añadir comportamiento sin tocar el código existente:

\`\`\`typescript
interface NotificationChannel {
  send(message: string, recipient: string): Promise<void>
}

class EmailChannel implements NotificationChannel { /* ... */ }
class SlackChannel  implements NotificationChannel { /* ... */ }
// Añadir WhatsApp no modifica NotificationService
\`\`\`

### Dependency Inversion Principle (DIP)

Los módulos de alto nivel no deben depender de los de bajo nivel; ambos deben depender de **abstracciones**:

| Dirección incorrecta | Dirección correcta |
|---|---|
| \`OrderService → PostgresRepo\` | \`OrderService → IOrderRepo ← PostgresRepo\` |

Esto permite sustituir la implementación (p. ej. pasar de Postgres a MongoDB) sin modificar el caso de uso.`,


  /* ── 4. Event-Driven Architecture con TypeScript ── */
  `## Arquitectura Orientada a Eventos (EDA)

En una EDA, los componentes se comunican publicando y suscribiéndose a **eventos de dominio** en lugar de llamarse directamente.

### Ventajas principales

- **Desacoplamiento temporal**: el publicador no necesita saber si hay suscriptores activos.
- **Escalabilidad independiente**: cada consumidor escala por separado.
- **Auditabilidad**: el log de eventos es un historial completo del sistema.

### Implementación básica de un Event Bus en TypeScript

\`\`\`typescript
type Handler<T> = (event: T) => void | Promise<void>

class EventBus {
  private handlers = new Map<string, Handler<unknown>[]>()

  subscribe<T>(eventType: string, handler: Handler<T>): void {
    const existing = this.handlers.get(eventType) ?? []
    this.handlers.set(eventType, [...existing, handler as Handler<unknown>])
  }

  async publish<T>(eventType: string, payload: T): Promise<void> {
    const handlers = this.handlers.get(eventType) ?? []
    await Promise.all(handlers.map(h => h(payload)))
  }
}

// Uso
const bus = new EventBus()

bus.subscribe<{ orderId: string }>('OrderCreated', async ({ orderId }) => {
  await inventoryService.reserve(orderId)
})

bus.subscribe<{ orderId: string }>('OrderCreated', async ({ orderId }) => {
  await notificationService.sendConfirmation(orderId)
})

// Al crear un pedido:
await bus.publish('OrderCreated', { orderId: 'ord-123' })
\`\`\`

### Cuándo usar EDA

Considera EDA cuando el flujo de trabajo involucra **múltiples consumidores independientes** del mismo evento, o cuando necesitas desacoplar sistemas que operan a velocidades distintas.`,


  /* ── 5. Clean Architecture — capas y regla de dependencia ── */
  `## Clean Architecture

Robert C. Martin (Uncle Bob) define **Clean Architecture** como un sistema de capas concéntricas donde la **regla de dependencia** dicta que el código fuente solo puede apuntar hacia adentro.

### Las cuatro capas

\`\`\`
┌───────────────────────────────────┐
│         Frameworks & Drivers      │  ← Express, React, Postgres
│  ┌────────────────────────────┐   │
│  │    Interface Adapters      │   │  ← Controllers, Presenters, Gateways
│  │  ┌─────────────────────┐  │   │
│  │  │   Use Cases         │  │   │  ← Application Business Rules
│  │  │  ┌──────────────┐   │  │   │
│  │  │  │   Entities   │   │  │   │  ← Enterprise Business Rules
│  │  │  └──────────────┘   │  │   │
│  │  └─────────────────────┘  │   │
│  └────────────────────────────┘   │
└───────────────────────────────────┘
\`\`\`

### Regla de dependencia

Ninguna capa interna conoce nada de las capas externas. En código:

- ✅ \`UseCaseCreateOrder\` importa \`Order\` (Entidad)
- ✅ \`OrderController\` importa \`UseCaseCreateOrder\`
- ❌ \`UseCaseCreateOrder\` importa \`ExpressRequest\`

### Estructura en un proyecto Node.js

\`\`\`
src/
├── entities/           ← Núcleo del dominio (cero dependencias externas)
│   └── Order.ts
├── usecases/           ← Orquestación de reglas de negocio
│   └── CreateOrder.ts
├── adapters/
│   ├── controllers/    ← HTTP → UseCase
│   │   └── OrderController.ts
│   └── repositories/  ← UseCase → DB (implementación)
│       └── OrderRepo.ts
└── infrastructure/
    ├── http/           ← Express setup
    └── database/       ← Postgres / ORM config
\`\`\`

El beneficio clave: puedes reemplazar Express por Fastify, o Postgres por MongoDB, **sin tocar ni una línea de lógica de negocio**.`,

]

export default DEMO_MESSAGES
