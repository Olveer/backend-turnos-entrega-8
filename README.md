# Sistema Backend de Turnos y Reservas

API REST con Node.js, Express y MongoDB (Mongoose) para gestionar servicios y reservas, con vistas renderizadas con Handlebars y actualizaciones en tiempo real con Socket.io. El código está organizado en capas: router, controller, service, repository y DAO.



## Instalación
1. `npm install`
2. Copiar `.env.example` a `.env` y completar `MONGO_URI` con la cadena de conexión de MongoDB Atlas
3. `npm run dev` (o `npm start`)
## Endpoints
### Services
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/services | Lista servicios con filtros (`?category=`, `?available=`), paginación y orden (`page`, `limit`, `sortBy`, `order`) |
| GET | /api/services/:sid | Servicio por id |
| POST | /api/services | Crea un servicio |
| PUT | /api/services/:sid | Actualiza un servicio |
| DELETE | /api/services/:sid | Elimina un servicio |

Body de ejemplo:
```json
{
  "name": "Consulta general",
  "description": "Consulta médica de 30 minutos",
  "duration": 30,
  "price": 25000,
  "category": "salud",
  "available": true
}
```

### Bookings
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/bookings | Crea una reserva (sin servicios) |
| GET | /api/bookings/:bid | Reserva por id, con servicios completos (populate) |
| POST | /api/bookings/:bid/services/:sid | Agrega un servicio a la reserva (si ya estaba, suma `quantity`) |

Body de ejemplo:
```json
{
  "clientName": "Ana Pérez",
  "clientEmail": "ana@mail.com",
  "date": "2026-11-05",
  "time": "10:30"
}
```

## Persistencia
Los datos se guardan en MongoDB Atlas usando Mongoose. Colecciones: `services`, `bookings` y `messages` (modelos en `src/models/`). En `bookings`, los servicios se referencian por `ObjectId`:

```js
services: [{ service: ObjectId, quantity: Number }]
```

## Estructura del proyecto

```
src/
  config/
    env.config.js
    db.config.js
  controllers/
    services.controller.js
    bookings.controller.js
    views.controller.js
  services/
    services.service.js
    bookings.service.js
  repositories/
    services.repository.js
    bookings.repository.js
  dao/
    services.dao.js
    bookings.dao.js
  models/
    service.model.js
    booking.model.js
    message.model.js
  middlewares/
    validator.middleware.js
  routes/
    services.router.js
    bookings.router.js
    views.router.js
  utils/
    errors.js
  views/
    layouts/main.handlebars
    services.handlebars
    availability.handlebars
  public/
    css/styles.css
    js/socket.js
  app.js
  server.js
```
## Vistas y tiempo real

- `GET /views/services`: listado de servicios (nombre, descripción, duración, precio, categoría y disponibilidad), con formulario para crear servicios y botones para cambiar la disponibilidad o eliminar.
- `GET /views/availability`: servicios disponibles.

Las vistas usan Handlebars y obtienen los datos reales de MongoDB a través de las mismas capas que la API (controller → service → repository → DAO → model).

Socket.io: al crear, actualizar o eliminar un servicio mediante la API (`POST`, `PUT` o `DELETE` en `/api/services`), el servidor emite los eventos `service:created`, `service:updated` y `service:deleted`. El cliente (`src/public/js/socket.js`) los escucha y actualiza las vistas sin recargar la página.

## Arquitectura en capas

```
router → controller → service → repository → DAO → MongoDB (Mongoose)
```

| Capa | Responsabilidad |
|------|-----------------|
| Router | Define los endpoints y los conecta con su controller |
| Controller | Lee `req`, llama al service y responde con `res` |
| Service | Reglas de negocio. No conoce req ni res |
| Middleware | Valida body y query con Zod antes del controller |
| Repository | Ofrece métodos de acceso a datos, sin reglas de negocio |
| DAO | Accede a MongoDB mediante los modelos de Mongoose, sin lógica de negocio |

La migración de archivos JSON a MongoDB afectó solo a la capa de persistencia (DAO y modelos), sin cambiar rutas ni controllers.
## Consultas avanzadas: GET /api/services
| Query param | Descripción | Default |
|-------------|-------------|---------|
| `category`  | Filtra por categoría (sin distinguir mayúsculas) | - |
| `available` | `true` o `false` | - |
| `page`      | Número de página (≥ 1) | 1 |
| `limit`     | Resultados por página (1 a 100) | 10 |
| `sortBy`    | `name`, `price`, `duration`, `category` o `createdAt` | `createdAt` |
| `order`     | `asc` o `desc` | `asc` |

Ejemplos:
```
GET /api/services?category=salud&available=true
GET /api/services?page=2&limit=5
GET /api/services?sortBy=price&order=desc
GET /api/services?category=salud&available=true&sortBy=price&order=asc&page=1&limit=5
```

Respuesta:
```json
{
  "status": "success",
  "payload": [ { "id": "...", "name": "Consulta general", "price": 25000 } ],
  "total": 12,
  "page": 1,
  "limit": 5,
  "totalPages": 3,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

## Validaciones (Zod)

Se aplican como middlewares (`src/middlewares/validator.middleware.js`) antes del controller, así que los datos inválidos nunca llegan a MongoDB. Devuelven `400`:
```json
{
  "error": "Datos inválidos",
  "errors": ["price debe ser mayor a 0"],
  "details": [{ "field": "price", "message": "price debe ser mayor a 0" }]
}
```

| Endpoint | Esquema | Reglas principales |
|----------|---------|--------------------|
| `POST /api/services` | `createServiceSchema` | name, description, duration, price, category, available obligatorios; duration y price > 0 |
| `PUT /api/services/:sid` | `updateServiceSchema` | mismos campos, todos opcionales |
| `GET /api/services` | `getServicesQuerySchema` | page ≥ 1, limit 1 a 100, sortBy y order en lista cerrada |
| `POST /api/bookings` | `createBookingSchema` | clientName, clientEmail válido, date `YYYY-MM-DD`, time `HH:MM`, status opcional |
| `POST /api/bookings/:bid/services/:sid` | `addServiceToBookingSchema` | quantity entero > 0 (default 1) |

## Reservas con populate

En la base, `services` guarda solo referencias: `[{ service: ObjectId, quantity: Number }]`.
`GET /api/bookings/:bid` usa `populate("services.service")` y devuelve cada servicio completo:
```json
{
  "id": "...",
  "clientName": "Ana Pérez",
  "clientEmail": "ana@mail.com",
  "date": "2026-11-05",
  "time": "10:30",
  "status": "pending",
  "services": [
    {
      "service": { "id": "...", "name": "Consulta general", "duration": 30, "price": 25000, "category": "salud", "available": true },
      "quantity": 2
    }
  ]
}
```