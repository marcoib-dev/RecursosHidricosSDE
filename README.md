# Recursos Hidricos de SDE

Sistema web de gestion integral de obras hidricas (pozos y plantas potabilizadoras) para Santiago del Estero, Argentina. Permite registrar, monitorear y administrar infraestructura hidrica con roles diferenciados, mapa interactivo, gestion documental y auditoria de acciones.

## Tabla de Contenidos

- [Caracteristicas](#caracteristicas)
- [Tecnologias](#tecnologias)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion Rapida](#instalacion-rapida)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecucion](#ejecucion)
- [Despliegue con Docker](#despliegue-con-docker)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Usuarios de Prueba](#usuarios-de-prueba)
- [Documentacion Adicional](#documentacion-adicional)
- [Licencia](#licencia)

## Caracteristicas

- **Gestion de Obras Hidricas**: CRUD completo de pozos y plantas potabilizadoras con datos tecnicos especificos (profundidad, caudal, tipo de bomba, tratamiento, capacidad, fuente).
- **Mapa Interactivo**: Visualizacion georreferenciada de todas las obras con Leaflet.
- **Sistema de Roles**: 6 roles con permisos diferenciados (Administrador, Presidente, Inspector, Dpto. Construccion, Dpto. Estudios, Dpto. Conservacion).
- **Gestion Documental**: Carga y descarga de archivos (PDF, imagenes, documentos Office, CSV) asociados a cada obra.
- **Dashboard Analitico**: Estadisticas en tiempo real, graficos de estado y distribucion de obras.
- **Auditoria**: Registro automatico de todas las acciones del sistema con trazabilidad completa.
- **Notificaciones**: Alertas en tiempo real sobre cambios en obras (creacion, actualizacion, eliminacion).
- **Exportacion CSV**: Descarga de reportes de obras en formato CSV.
- **Autenticacion JWT**: Login seguro con tokens, proteccion de rutas y manejo de sesion.

## Tecnologias

### Frontend
| Tecnologia | Version | Uso |
|---|---|---|
| React | 18.2 | Biblioteca UI |
| Vite | 4.4 | Bundler y dev server |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| React Router | 6.16 | Enrutamiento SPA |
| Radix UI | - | Componentes accesibles (Dialog, Select, Toast, etc.) |
| Leaflet / React-Leaflet | 1.9 / 4.2 | Mapa interactivo |
| Recharts | 2.8 | Graficos y visualizaciones |
| Framer Motion | 10.16 | Animaciones |
| Lucide React | 0.285 | Iconografia |

### Backend
| Tecnologia | Version | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4.21 | Framework HTTP |
| MySQL2 | 3.18 | Driver de base de datos |
| bcrypt | 5.1 | Hash de contrasenas |
| JSON Web Token | 9.0 | Autenticacion |
| Multer | 1.4 | Upload de archivos |
| Helmet | 7.1 | Seguridad HTTP headers |
| Morgan | 1.10 | Logging de requests |
| express-rate-limit | 7.4 | Proteccion contra abuso |

### Base de Datos
| Tecnologia | Version | Uso |
|---|---|---|
| MySQL / MariaDB | 8.0+ / 10.4+ | Base de datos relacional (Compatible con arquitecturas heredadas) |

## Requisitos Previos

- **Node.js** >= 18.x ([descargar](https://nodejs.org/))
- **npm** >= 9.x (incluido con Node.js)
- **MySQL** >= 8.0 ([descargar](https://dev.mysql.com/downloads/mysql/)) 
- Alternativa a MySQL **MariaDB** >= 10.4 ([descargar](https://mariadb.org/download/))

## Instalacion Rapida

```bash
# 1. Clonar el repositorio
git clone https://github.com/marcoib-dev/RecursosHidricosSDE.git
cd RecursosHidricosSDE

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Configurar variables de entorno del backend
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# 4. Inicializar la base de datos
npm run db:init

# 5. Cargar datos de prueba
npm run db:seed

# 6. Instalar dependencias del frontend
cd ../frontend
npm install
```

## Variables de Entorno

Crear un archivo `backend/.env` con las siguientes variables:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=recursos_hidricos_sde

# JWT
JWT_SECRET=tu_clave_secreta_segura
JWT_EXPIRES_IN=7d

# Servidor
PORT=4000
FRONTEND_URL=http://localhost:3000

# Proxies de confianza (1 = un proxy delante, por ejemplo nginx)
TRUST_PROXY=1

# Primer administrador (independiente de SEED_DEMO)
# La contraseña debe tener al menos 12 caracteres.
ADMIN_EMAIL=admin@tu-dominio.gob.ar
ADMIN_PASSWORD=una_password_de_al_menos_12_caracteres
ADMIN_NOMBRE=Administrador General
```

> `ADMIN_EMAIL` y `ADMIN_PASSWORD` solo se usan si la base **no tiene ningún
> administrador**. Nunca se sobrescriben usuarios existentes ni se resetean
> contraseñas. Si falta alguna variable o la contraseña es corta, el backend
> avisa en los logs y no crea nada.

> **Placeholders públicos:** en producción el backend no arranca si
> `JWT_SECRET`, `DB_PASSWORD` o `MYSQL_ROOT_PASSWORD` todavía contienen
> `CAMBIAR` (sin distinguir mayúsculas). Tampoco crea el administrador inicial
> si `ADMIN_PASSWORD` contiene `CAMBIAR` o si `ADMIN_EMAIL` termina en
> `.invalid`; en ese caso deja una advertencia clara en los logs.

> El registro público (`/register`) crea siempre usuarios con rol **Inspector**
> e ignora cualquier rol enviado en la petición. Solo un administrador
> autenticado puede crear usuarios con otros roles desde **Usuarios**.

## Ejecucion

### Desarrollo

Abrir dos terminales:

```bash
# Terminal 1 - Backend (puerto 4000)
cd backend
npm run dev

# Terminal 2 - Frontend (puerto 3000)
cd frontend
npm run dev
```

La aplicacion estara disponible en:
- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/api/health

### Produccion

```bash
# Backend
cd backend
npm start

# Frontend (generar build)
cd frontend
npm run build
npm run preview
```

## Despliegue con Docker

Esta es la forma recomendada para el servidor: no hace falta instalar Node, MySQL ni nginx en la máquina, solo Docker.

### Requisitos

- Docker Engine 24 o superior.
- Docker Compose v2 (`docker compose`, no `docker-compose`).
- Puertos libres: el que se publique como `HTTP_PORT` (80 por defecto).

### 1. Clonar y configurar

```bash
git clone https://github.com/marcoib-dev/RecursosHidricosSDE.git
cd RecursosHidricosSDE

cp .env.produccion.example .env.produccion
```

Editar `.env.produccion` y completar como mínimo:

- `MYSQL_ROOT_PASSWORD` y `DB_PASSWORD`: contraseñas nuevas y distintas. No
  pueden conservar el placeholder `CAMBIAR`; en producción el entrypoint
  aborta con un mensaje claro si lo hacen.
- `JWT_SECRET`: generar uno con
  `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  o `openssl rand -hex 64`. Debe tener al menos 32 caracteres y no puede
  contener `CAMBIAR`.
- `FRONTEND_URL`: dominio o URL pública (por ejemplo `https://recursos-hidricos.midominio.gob.ar`).
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NOMBRE`: primer administrador. La
  contraseña debe tener **al menos 12 caracteres** y no contener `CAMBIAR`.
  `ADMIN_EMAIL` no debe terminar en `.invalid`. Son independientes de
  `SEED_DEMO` y nunca modifican usuarios existentes.
- `TRUST_PROXY`: `1` por defecto (nginx del frontend). Subirlo a `2` si se
  agrega otro proxy delante de nginx (por ejemplo, el del servidor del ITSE).
- `HTTP_PORT`: `80` por defecto; usar `8080` si el servidor ya tiene algo en el 80.

`.env.produccion` está en `.gitignore`: **nunca** se commitea.

### 2. Levantar la aplicación

```bash
docker compose --env-file .env.produccion -f docker-compose.prod.yaml up -d --build
```

La aplicación queda disponible en `http://IP_DEL_SERVIDOR:HTTP_PORT`.

Solo se publica el puerto del frontend. MySQL y el backend quedan en la red interna de Compose; nginx sirve la SPA y reenvía `/api` y `/uploads` al backend. Como el frontend usa rutas relativas, el mismo build funciona con cualquier dominio, subdominio o puerto sin recompilar.

### 3. Crear el primer administrador

Con `SEED_DEMO=false` la base queda vacía, pero el backend crea el primer
administrador al arrancar si están definidos `ADMIN_EMAIL` y `ADMIN_PASSWORD`
(contraseña de 12 caracteres o más, sin `CAMBIAR`, y correo que no termine en
`.invalid`). Es idempotente: si ya existe cualquier usuario con rol
`administrador`, no crea ni modifica nada.

Revisar los logs del backend:

```bash
docker compose --env-file .env.produccion -f docker-compose.prod.yaml logs backend | grep -i administrador
```

Si `ADMIN_PASSWORD` es corta o falta alguna variable, aparece una advertencia
clara (sin mostrar la contraseña) y no se crea ningún usuario. También se puede
ejecutar manualmente:

```bash
docker compose --env-file .env.produccion -f docker-compose.prod.yaml exec backend npm run db:admin
```

### 4. Cargar datos de ejemplo (opcional)

Para una demo o primer ingreso, poner `SEED_DEMO=true` en `.env.produccion` antes del primer arranque y ejecutar el mismo comando. El seed es idempotente: no duplica usuarios ni obras en reinicios.

> ⚠️ **Los usuarios demo tienen contraseñas públicas y conocidas.** Cambiarlas
> desde la aplicación después del primer ingreso. En una instalación real usar
> `SEED_DEMO=false` y el administrador definido con `ADMIN_*`.

También se puede ejecutar manualmente:

```bash
docker compose --env-file .env.produccion -f docker-compose.prod.yaml exec backend npm run db:seed
```

Credenciales de prueba: `admin@recursoshidricos.gob.ar / admin123` (y el resto de la tabla de [Usuarios de Prueba](#usuarios-de-prueba)).

> **Importante:** después del primer ingreso, cambiar las contraseñas de todos los usuarios de prueba desde la aplicación.

### 5. Ver logs

```bash
# Todos los servicios
docker compose --env-file .env.produccion -f docker-compose.prod.yaml logs -f

# Solo backend / frontend / base de datos
docker compose --env-file .env.produccion -f docker-compose.prod.yaml logs -f backend
docker compose --env-file .env.produccion -f docker-compose.prod.yaml logs -f frontend
docker compose --env-file .env.produccion -f docker-compose.prod.yaml logs -f db

# Estado y salud de los contenedores
docker compose --env-file .env.produccion -f docker-compose.prod.yaml ps
```

### 6. Actualizar tras un cambio en el repositorio

```bash
git pull
docker compose --env-file .env.produccion -f docker-compose.prod.yaml up -d --build
```

Docker reconstruye las imágenes, ejecuta el esquema idempotente y reinicia solo lo necesario. Los datos de MySQL y los archivos subidos se conservan en volúmenes.

### 7. Detener

```bash
docker compose --env-file .env.produccion -f docker-compose.prod.yaml down
```

> ⚠️ **`down -v` borra la base de datos y los archivos subidos.** No usar `-v` salvo que se quiera empezar de cero. Para respaldos, ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#backups).

Para el detalle de variables, backups, restauración y resolución de problemas, ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#despliegue-con-docker-recomendado).

## Estructura del Proyecto

```
RecursosHidricosSDE/
├── backend/
│   ├── server.js                 # Servidor Express (punto de entrada)
│   ├── database.sql              # Script SQL completo de la BD
│   ├── Dockerfile                # Imagen de producción (Node 20 Alpine)
│   ├── docker-entrypoint.sh      # Init de esquema + seed opcional
│   ├── .dockerignore
│   ├── package.json
│   ├── src/
│   │   ├── database/
│   │   │   ├── connection.js     # Pool de conexion MySQL
│   │   │   ├── init.js           # Inicializacion de tablas
│   │   │   └── seed.js           # Datos de prueba
│   │   ├── middleware/
│   │   │   ├── auth.js           # Autenticacion JWT
│   │   │   ├── audit.js          # Middleware de auditoria
│   │   │   ├── errorHandler.js   # Manejo global de errores
│   │   │   └── validate.js       # Validacion de datos
│   │   └── routes/
│   │       ├── auth.routes.js
│   │       ├── obra.routes.js
│   │       ├── plant.routes.js
│   │       ├── file.routes.js
│   │       ├── dashboard.routes.js
│   │       └── user.routes.js
│   └── uploads/                  # Archivos subidos (gitignored)
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile                # Build con Vite + nginx
│   ├── nginx.conf                # SPA, proxy /api y /uploads
│   ├── .dockerignore
│   ├── package.json
│   └── src/
│       ├── App.jsx               # Rutas principales
│       ├── main.jsx              # Punto de entrada React
│       ├── index.css             # Estilos globales Tailwind
│       ├── contexts/
│       │   └── AuthContext.jsx   # Contexto de autenticacion
│       ├── services/
│       │   └── api.js            # Cliente HTTP centralizado
│       ├── lib/
│       │   ├── permissions.js    # Matriz de permisos por rol
│       │   └── utils.js          # Utilidades generales
│       ├── hooks/
│       │   ├── useObras.js       # Hook para obras
│       │   └── usePlants.js      # Hook para plantas
│       ├── pages/
│       │   ├── LandingPage.jsx   # Pagina de inicio publica
│       │   ├── LoginPage.jsx     # Inicio de sesion
│       │   ├── RegisterPage.jsx  # Registro de usuarios
│       │   ├── Dashboard.jsx     # Panel principal
│       │   ├── PlantsPage.jsx    # Listado de obras
│       │   ├── PlantDetailPage.jsx # Detalle de obra
│       │   ├── MapPage.jsx       # Mapa interactivo
│       │   ├── UsersPage.jsx     # Gestion de usuarios
│       │   ├── AuditPage.jsx     # Registro de auditoria
│       │   ├── ProfilePage.jsx   # Perfil del usuario
│       │   ├── HelpPage.jsx      # Pagina de ayuda
│       │   └── NotFoundPage.jsx  # Pagina 404
│       └── components/
│           ├── layout/
│           │   └── DashboardLayout.jsx  # Layout con sidebar
│           ├── dashboard/
│           │   ├── StatsCard.jsx
│           │   ├── StatusChart.jsx
│           │   └── RecentActivity.jsx
│           ├── plants/
│           │   ├── PlantCard.jsx
│           │   ├── PlantDialog.jsx
│           │   ├── PlantMap.jsx
│           │   └── FileUpload.jsx
│           └── ui/               # Componentes base (Radix + Tailwind)
│
├── docs/                         # Documentacion detallada
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── ROLES_Y_PERMISOS.md
│   └── DEPLOYMENT.md
│
├── CONTRIBUTING.md
├── CHANGELOG.md
├── docker-compose.prod.yaml      # Orquestación de producción
├── .env.produccion.example      # Plantilla de variables para Docker
├── .gitattributes
├── setup.sh                      # Script de setup automatico (Linux/Mac)
├── SETUP_BD.ps1                  # Script de setup (Windows PowerShell)
├── SETUP_BD.bat                  # Script de setup (Windows CMD)
└── .gitignore
```

> Para una descripcion detallada de la arquitectura, ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Usuarios de Prueba

Despues de ejecutar `npm run db:seed`, estos usuarios estaran disponibles:

| Rol | Correo | Contrasena |
|---|---|---|
| Administrador | admin@recursoshidricos.gob.ar | admin123 |
| Presidente | presidente@recursoshidricos.gob.ar | presidente123 |
| Inspector | inspector@recursoshidricos.gob.ar | inspector123 |
| Dpto. Construccion | construccion@recursoshidricos.gob.ar | depto123 |
| Dpto. Estudios | estudios@recursoshidricos.gob.ar | depto123 |
| Dpto. Conservacion | conservacion@recursoshidricos.gob.ar | depto123 |

## Documentacion Adicional

| Documento | Descripcion |
|---|---|
| [Arquitectura](docs/ARCHITECTURE.md) | Diagrama de arquitectura, flujo de datos y decisiones de diseno |
| [API REST](docs/API.md) | Referencia completa de todos los endpoints |
| [Base de Datos](docs/DATABASE.md) | Modelo entidad-relacion y esquema de tablas |
| [Roles y Permisos](docs/ROLES_Y_PERMISOS.md) | Matriz de permisos por rol |
| [Despliegue](docs/DEPLOYMENT.md) | Guia de configuracion y despliegue en produccion |
| [Contribucion](CONTRIBUTING.md) | Guia para contribuir al proyecto |
| [Changelog](CHANGELOG.md) | Historial de cambios |

## Licencia

Proyecto academico desarrollado para el ITSE (Instituto Tecnologico de Santiago del Estero).
Derechos Reservados 2026
