# ApiTutoClass

API REST para una aplicación tipo aula virtual: gestión de usuarios (maestros y alumnos), grupos/clases y mensajes. Para chat en tiempo real.

---

## Stack

- **Runtime:** Node.js
- **Lenguaje:** TypeScript
- **Framework:** Express 5
- **Base de datos:** MySQL (cliente `mysql2`)
- **Auth:** JWT (access + refresh), bcrypt para contraseñas
- **Otros:** CORS, Helmet, Morgan, dotenv

---

## Estructura del proyecto

Arquitectura en capas: dominio, casos de uso e infraestructura.

```
src/
├── app.ts                    # App Express, middleware y montaje de rutas
├── index.ts                  # Punto de entrada (listen)
├── domain/                   # Capa de dominio
│   ├── entities/             # User, Group, Message, GroupUser
│   ├── enums/                # Role, GroupStatus, MessageType
│   └── interfaces/           # IUserRepository, IGroupRepository, IMessageRepository
├── usecases/                 # Casos de uso (lógica de aplicación)
│   ├── auth/                 # Registro, login, refresh, perfil
│   ├── groups/               # Crear, actualizar, eliminar, unirse, salir
│   └── messages/             # Crear, actualizar, eliminar mensajes
├── infraestructure/http/     # Infraestructura HTTP
│   ├── configure/            # auth.config, auth.types
│   ├── controllers/          # AuthController, GroupsController, MessagesController
│   ├── database/             # Conexión MySQL (pool)
│   ├── middleware/            # auth (JWT), errorHandler
│   ├── repositories/         # UserRepositoryImpl, GroupRepositoryImpl, MessageRepositoryImpl
│   ├── routes/               # createRoutes (registro de rutas)
│   ├── services/             # HashService, TokenService
│   └── types/                # Extensión de Express (req.user)
└── shared/
    └── errors/               # getErrorMessage
```


## Requisitos

- Node.js (recomendado v18+)
- MySQL (5.7+ o 8.x)
- Variables de entorno (ver más abajo)

---

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto. Ejemplo:

```env
# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tutoclass
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_ACCESS_SECRET=tu_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=tu_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# Servidor (opcional)
PORT=3000
```

### 3. Base de datos MySQL

Crea la base y ejecuta los scripts en `sql/` en este orden:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tutoclass;"
mysql -u root -p tutoclass < sql/schema-usuarios.sql
mysql -u root -p tutoclass < sql/schema-grupos.sql
mysql -u root -p tutoclass < sql/schema-mensajes.sql
```

(O desde el cliente MySQL: `USE tutoclass;` y luego `source sql/schema-usuarios.sql;`, etc.)

---

## Cómo ejecutar

**Desarrollo :**

```bash
npm run dev
```

**Producción (compilar y ejecutar):**

```bash
npm run build
npm start
```

Por defecto el servidor queda en **http://localhost:3000** (o en el `PORT` de `.env`).

**Documentación interactiva (Swagger):** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## API – Resumen de endpoints

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register/alumno` | No | Registro alumno (nombre, email, password). Devuelve user + tokens. |
| POST | `/auth/register/maestro` | No | Registro maestro (nombre, email, password). Devuelve user + tokens. |
| POST | `/auth/login` | No | Login (email, password). Devuelve user + tokens. |
| POST | `/auth/refresh` | No | Renovar tokens (body: `refreshToken`). |
| GET | `/auth/profile` | Sí | Perfil del usuario autenticado. |

### Grupos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/groups` | No | Lista grupos activos. |
| GET | `/groups/teacher/:teacherId` | No | Grupos de un profesor. |
| GET | `/groups/student/:studentId` | No | Grupos de un alumno. |
| GET | `/groups/:id` | No | Detalle de un grupo. |
| POST | `/groups` | Maestro | Crear grupo. |
| PATCH | `/groups/:id` | Maestro | Actualizar grupo. |
| DELETE | `/groups/:id` | Maestro | Eliminar grupo. |
| POST | `/groups/join` | Alumno | Unirse con código (body: `accessCode`). |
| POST | `/groups/:id/leave` | Alumno | Salir del grupo. |
| GET | `/groups/:id/enrolled` | Sí | Saber si el usuario está inscrito. |

### Mensajes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/groups/:groupId/messages` | No | Mensajes del grupo (query: `limit`, `from`). |
| GET | `/messages/:id` | No | Un mensaje por ID. |
| POST | `/messages` | Sí | Crear mensaje (body: `groupId`, `text`). |
| PATCH | `/messages/:id` | Sí | Editar mensaje (body: `text`). |
| DELETE | `/messages/:id` | Sí | Eliminar mensaje. |

### Autenticación en peticiones

Las rutas marcadas como “Auth” requieren cabecera:

```
Authorization: Bearer <accessToken>
```

El `accessToken` se obtiene en login o registro. Si expira, usar `/auth/refresh` con el `refreshToken` para obtener un nuevo par.

---

## Roles

- **maestro:** puede crear, editar y eliminar grupos; no puede unirse a grupos como alumno.
- **alumno:** puede unirse a grupos (con código) y salir; no puede crear/editar/eliminar grupos.

La comprobación de rol se hace en middleware (`requireRole("maestro")` o `requireRole("alumno")`).

---

## Scripts

| Comando       | Descripción                          |
|---------------|--------------------------------------|
| `npm run dev` | Servidor en desarrollo con nodemon.  |
| `npm run build` | Compila TypeScript a `dist/`.      |
| `npm start`   | Ejecuta `dist/index.js` (tras build). |

---

## Licencia

ISC.
