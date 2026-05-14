/**
 * F12-T6 (modalidad MOCK): Fixtures deterministas para el ciclo pedagógico
 * completo. Shape espejo del contrato Negocio (camelCase, fechas ISO 8601)
 * para que al reanudar Backend baste con `VITE_USE_MOCKS=false` y los mismos
 * componentes Frontend funcionen sin cambios.
 *
 * Cobertura de estados:
 *   r-001  → reto PENDIENTE, sin attempts.
 *   r-002  → reto EN PROGRESO: 1 attempt evaluado con feedback, sin reflexión.
 *   r-003  → reto COMPLETADO: 2 attempts (uno evaluado parcial, segundo OK
 *            con reflexión enviada).
 *   r-004  → reto PENDIENTE: weakness distinto (variedad visual del listado).
 */

export const FIXTURE_USER_ID = 'mock-user-1'

/**
 * Crea un fixture con timestamps relativos a "ahora" para que el listado
 * muestre microcopy realista ("hace 2 días", etc.) sin importar la fecha
 * de ejecución. Helper privado a este módulo.
 */
function _hoursAgo(h) {
  return new Date(Date.now() - h * 3600 * 1000).toISOString()
}

const RUBRIC_CACHING = [
  {
    concept: 'LRU',
    description: 'Implementa evicción por uso reciente (least-recently-used).',
    weight: 5,
  },
  {
    concept: 'Capacidad',
    description: 'Respeta la capacidad configurada bajo cualquier carga.',
    weight: 4,
  },
  {
    concept: 'Concurrencia',
    description: 'Las operaciones get/put son seguras bajo accesos concurrentes.',
    weight: 3,
  },
]

const RUBRIC_RETRY = [
  {
    concept: 'Idempotencia',
    description: 'La operación es segura ante reintentos sin efectos colaterales.',
    weight: 5,
  },
  {
    concept: 'Backoff exponencial',
    description: 'Los reintentos respetan un backoff exponencial con jitter.',
    weight: 4,
  },
  {
    concept: 'Circuit breaker',
    description: 'Detecta fallos sistemáticos y abre el circuito antes de saturar.',
    weight: 3,
  },
  {
    concept: 'Observabilidad',
    description: 'Cada reintento queda registrado con su causa y latencia.',
    weight: 2,
  },
]

const RUBRIC_DECOUPLING = [
  {
    concept: 'Inversión de dependencias',
    description: 'El módulo depende de abstracciones, no de implementaciones concretas.',
    weight: 5,
  },
  {
    concept: 'Boundaries',
    description: 'Los límites entre capas están explícitos y son testeables.',
    weight: 4,
  },
  {
    concept: 'Cohesión',
    description: 'Cada módulo encapsula una sola razón para cambiar.',
    weight: 3,
  },
]

export const MOCK_ROUTINES = [
  {
    id: 'r-001',
    userId: FIXTURE_USER_ID,
    title: 'Refactoriza el cache global hacia un LRU acotado',
    targetWeakness: 'Caching',
    inverseRagSnippet:
      'CACHE = {}\n\nclass UserService:\n    def get_user(self, uid):\n        if uid in CACHE:\n            return CACHE[uid]   # crece sin control\n        u = db.fetch(uid)\n        CACHE[uid] = u\n        return u',
    expectedConcepts: ['LRU', 'eviction', 'thread safety'],
    difficulty: 3,
    challengeMd:
      '## Reto\n\nEl `UserService` actual cachea todos los usuarios consultados en un diccionario global. ' +
      'Bajo carga real, este cache crece hasta saturar memoria y produce OOM en los pods.\n\n' +
      '## Entregable\n\nReescribí el cache como una clase `LRUCache` configurable con capacidad fija. ' +
      'Mantené la misma firma pública de `get_user`. La nueva implementación debe:\n\n' +
      '1. Evictar la entrada menos recientemente usada cuando se supera la capacidad.\n' +
      '2. Permitir que dos requests concurrentes lean del cache sin corrupción interna.\n' +
      '3. Exponer métricas básicas (hits/misses) accesibles externamente.',
    rubricJson: RUBRIC_CACHING,
    solutionMd: null, // anti-spoiler: aún sin attempts evaluados
    attempts: [],
    createdAt: _hoursAgo(36),
  },

  {
    id: 'r-002',
    userId: FIXTURE_USER_ID,
    title: 'Implementa retries con backoff exponencial para llamadas externas',
    targetWeakness: 'Resiliencia',
    inverseRagSnippet:
      'def call_payments(payload):\n    return requests.post(URL, json=payload, timeout=2)\n# Falla silenciosamente bajo 5xx transitorios',
    expectedConcepts: ['idempotencia', 'backoff', 'circuit breaker'],
    difficulty: 4,
    challengeMd:
      '## Reto\n\nLa función `call_payments` falla silenciosamente cuando el upstream devuelve 5xx ' +
      'transitorios. El equipo de operaciones pide una capa de resiliencia.\n\n' +
      '## Entregable\n\n1. Envolvé la llamada en un decorador de retries con backoff exponencial + jitter.\n' +
      '2. Asegurá que la operación sea idempotente (header `Idempotency-Key`).\n' +
      '3. Cortocircuitá las llamadas si los últimos N intentos fallaron sistemáticamente.\n',
    rubricJson: RUBRIC_RETRY,
    solutionMd:
      '## Solución de referencia\n\n```python\nimport random\nimport time\nfrom functools import wraps\n\n' +
      'def retry_with_backoff(max_attempts=5, base=0.2):\n    def deco(fn):\n        @wraps(fn)\n' +
      '        def wrapped(*a, **kw):\n            for attempt in range(max_attempts):\n' +
      '                try:\n                    return fn(*a, **kw)\n                except TransientError:\n' +
      '                    if attempt == max_attempts - 1: raise\n' +
      '                    delay = base * (2 ** attempt) + random.random() * 0.05\n' +
      '                    time.sleep(delay)\n        return wrapped\n    return deco\n```\n\n' +
      'Notas: el `jitter` evita el thundering-herd cuando muchos clientes reintentan en sincronía. ' +
      'El `Idempotency-Key` debe generarse del payload, no del request — si el caller reintenta ' +
      'con el mismo payload, queremos que upstream deduplique.',
    attempts: [
      {
        id: 'a-002-1',
        routineId: 'r-002',
        userId: FIXTURE_USER_ID,
        status: 'in_progress',
        score: '72.00',
        feedbackJson: {
          score: 72,
          criteria: [
            {
              concept: 'Idempotencia',
              status: 'met',
              comment: 'El header Idempotency-Key se genera correctamente desde el payload.',
            },
            {
              concept: 'Backoff exponencial',
              status: 'partial',
              comment:
                'El backoff crece, pero falta jitter — bajo concurrencia alta podría sincronizar reintentos.',
            },
            {
              concept: 'Circuit breaker',
              status: 'missing',
              comment: 'No hay lógica para detectar fallos sistemáticos y abrir el circuito.',
            },
            {
              concept: 'Observabilidad',
              status: 'met',
              comment: 'Cada reintento se loguea con timestamp y causa.',
            },
          ],
          strengths: [
            'Estructura del decorador limpia y reutilizable',
            'Logging por reintento claro',
          ],
          improvements: [
            'Añadir jitter aleatorio al backoff para evitar thundering-herd',
            'Implementar un circuit breaker simple (state=closed|open|half-open)',
          ],
          socratic_comment:
            '¿Qué pasaría si tres réplicas del servicio reintentaran al mismo tiempo tras un fallo en cascada?',
        },
        userResponseText:
          'def call_payments(payload):\n    @retry_with_backoff(max_attempts=5, base=0.2)\n' +
          '    def _do():\n        return requests.post(URL, json=payload, timeout=2,\n' +
          '            headers={"Idempotency-Key": hash_payload(payload)})\n    return _do()',
        reflectionJson: null,
        evaluatedAt: _hoursAgo(6),
        completedAt: null,
        createdAt: _hoursAgo(8),
      },
    ],
    createdAt: _hoursAgo(12),
  },

  {
    id: 'r-003',
    userId: FIXTURE_USER_ID,
    title: 'Desacopla el OrderService del ORM concreto',
    targetWeakness: 'Acoplamiento',
    inverseRagSnippet:
      'class OrderService:\n    def __init__(self):\n        self.db = SQLAlchemyOrderRepo()  # acoplado',
    expectedConcepts: ['DIP', 'puertos', 'adaptadores'],
    difficulty: 3,
    challengeMd:
      '## Reto\n\nEl `OrderService` instancia directamente `SQLAlchemyOrderRepo`. ' +
      'Esto hace imposible testearlo sin levantar una base de datos.\n\n' +
      '## Entregable\n\nAplicá Inversión de Dependencias para que `OrderService` reciba una ' +
      'abstracción `OrderRepository` (puerto). Implementá un adaptador `SQLAlchemyOrderRepo` ' +
      'que lo respete y un `InMemoryOrderRepo` para tests.',
    rubricJson: RUBRIC_DECOUPLING,
    solutionMd:
      '## Solución de referencia\n\n```python\nfrom abc import ABC, abstractmethod\n\n' +
      'class OrderRepository(ABC):\n    @abstractmethod\n    def find(self, id): ...\n\n' +
      'class OrderService:\n    def __init__(self, repo: OrderRepository):\n        self.repo = repo\n```\n\n' +
      'El test inyecta `InMemoryOrderRepo` — el código de producción inyecta el adaptador SQL.',
    attempts: [
      {
        id: 'a-003-1',
        routineId: 'r-003',
        userId: FIXTURE_USER_ID,
        status: 'abandoned',
        score: '42.00',
        feedbackJson: {
          score: 42,
          criteria: [
            { concept: 'Inversión de dependencias', status: 'partial', comment: 'Inyectaste la dependencia pero por nombre, no por interfaz.' },
            { concept: 'Boundaries', status: 'missing', comment: 'No hay puerto definido.' },
            { concept: 'Cohesión', status: 'met', comment: 'OrderService sigue teniendo una sola responsabilidad.' },
          ],
          strengths: ['Mantuviste la API pública intacta'],
          improvements: ['Definí un puerto explícito (ABC) que ambos adaptadores implementen'],
          socratic_comment: 'Si el equipo quisiera migrar a MongoDB mañana, ¿cuánto código tendrías que tocar?',
        },
        userResponseText:
          'class OrderService:\n    def __init__(self, repo):\n        self.repo = repo',
        reflectionJson: null,
        evaluatedAt: _hoursAgo(48),
        completedAt: null,
        createdAt: _hoursAgo(50),
      },
      {
        id: 'a-003-2',
        routineId: 'r-003',
        userId: FIXTURE_USER_ID,
        status: 'completed',
        score: '88.00',
        feedbackJson: {
          score: 88,
          criteria: [
            { concept: 'Inversión de dependencias', status: 'met', comment: 'Puerto OrderRepository definido como ABC.' },
            { concept: 'Boundaries', status: 'met', comment: 'Adaptadores SQL e InMemory bien separados.' },
            { concept: 'Cohesión', status: 'partial', comment: 'El adaptador SQL podría delegar más lógica al ORM.' },
          ],
          strengths: ['Puerto + dos adaptadores correctamente implementados', 'Tests con InMemory ahora son rápidos'],
          improvements: ['Considerar mover validaciones al puerto, no al adaptador SQL'],
          socratic_comment: 'El test passes en 0.02s. ¿Cómo se compara con el tiempo previo a la refactorización?',
        },
        userResponseText:
          'from abc import ABC, abstractmethod\n\n' +
          'class OrderRepository(ABC):\n    @abstractmethod\n    def find(self, id): ...\n\n' +
          'class SQLAlchemyOrderRepo(OrderRepository): ...\n' +
          'class InMemoryOrderRepo(OrderRepository): ...\n\n' +
          'class OrderService:\n    def __init__(self, repo: OrderRepository):\n        self.repo = repo',
        reflectionJson: {
          difficultPart:
            'Identificar exactamente qué métodos pertenecen al puerto vs cuáles son detalles de cada ORM.',
          wouldDoDifferently:
            'Empezaría por escribir el test con InMemoryOrderRepo antes que el adaptador SQL, ' +
            'así el puerto se define desde el uso real y no por intuición.',
        },
        evaluatedAt: _hoursAgo(26),
        completedAt: _hoursAgo(24),
        createdAt: _hoursAgo(28),
      },
    ],
    createdAt: _hoursAgo(72),
  },

  {
    id: 'r-004',
    userId: FIXTURE_USER_ID,
    title: 'Diseña el contrato de eventos para el módulo de inventario',
    targetWeakness: 'Diseño de eventos',
    inverseRagSnippet: null,
    expectedConcepts: ['eventos', 'idempotencia', 'esquema'],
    difficulty: 2,
    challengeMd:
      '## Reto\n\nEl módulo de inventario va a emitir eventos cuando cambien sus existencias. ' +
      'Definí el contrato JSON de los eventos `inventory.item.created`, ' +
      '`inventory.item.updated` e `inventory.item.deleted`.\n\n' +
      '## Entregable\n\n1. Un schema JSON para cada evento con campos comunes (`eventId`, ' +
      '`timestamp`, `version`, `payload`).\n' +
      '2. Decisión justificada sobre versionado del schema.',
    rubricJson: RUBRIC_DECOUPLING,
    solutionMd: null,
    attempts: [],
    createdAt: _hoursAgo(4),
  },
]

/**
 * Devuelve un clon profundo de los fixtures.
 * Esto permite mutar el estado mock sin contaminar el módulo de origen.
 */
export function cloneInitialMockState() {
  return JSON.parse(JSON.stringify(MOCK_ROUTINES))
}
