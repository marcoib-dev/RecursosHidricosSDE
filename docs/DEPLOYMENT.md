# Guia de Despliegue y Configuracion

## Requisitos del Servidor

### Software Requerido

| Software | Version Minima | Proposito |
|---|---|---|
| Node.js | 18.x | Runtime para backend y build de frontend (solo despliegue manual) |
| npm | 9.x | Gestor de paquetes (solo despliegue manual) |
| MySQL | 8.0 | Base de datos (solo despliegue manual) |
| Docker Engine | 24.x | **Recomendado:** contenedores de backend, frontend y base |
| Docker Compose | v2 | Orquestación del despliegue con Docker |

> Para el despliegue con Docker no hace falta instalar Node, npm, MySQL ni nginx en el servidor. Ver [Despliegue con Docker](#despliegue-con-docker-recomendado).


### Recursos Minimos Recomendados

| Recurso | Desarrollo | Produccion |
|---|---|---|
| CPU | 1 core | 2 cores |
| RAM | 1 GB | 2 GB |
| Disco | 1 GB | 10 GB (incluye uploads) |

## Configuracion Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/marcoib-dev/RecursosHidricosSDE.git
cd RecursosHidricosSDE
```

### 2. Configurar MySQL

Asegurarse de que MySQL este corriendo y crear la base de datos:

```bash
# Opcion A: Usar el script SQL directamente
mysql -u root -p < backend/database.sql

# Opcion B: Usar el script de inicializacion de Node.js
cd backend
npm install
npm run db:init
npm run db:seed
```

### 3. Variables de Entorno

Crear el archivo `backend/.env`:

```env
# ─── Base de Datos ───────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=recursos_hidricos_sde

# ─── Autenticacion ──────────────────────────
JWT_SECRET=clave_secreta_aleatoria_larga_y_segura
JWT_EXPIRES_IN=7d

# ─── Servidor ───────────────────────────────
PORT=4000
FRONTEND_URL=http://localhost:3000
```

> **Importante para produccion:** Generar un `JWT_SECRET` seguro:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 4. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Verificar la Base de Datos

```bash
cd backend
node diagnostico-bd.js
```

El script verificara:
- Conexion a MySQL
- Existencia de la base de datos
- Creacion de tablas (6 tablas)
- Datos de prueba

## Ejecucion en Desarrollo

```bash
# Terminal 1 - Backend (hot reload con --watch)
cd backend
npm run dev

# Terminal 2 - Frontend (HMR con Vite)
cd frontend
npm run dev
```

**URLs de desarrollo:**
- Frontend: http://localhost:3000
- API: http://localhost:4000/api
- Health Check: http://localhost:4000/api/health

### Script de Setup Automatico

Para Linux/Mac:
```bash
bash setup.sh
```

Para Windows (PowerShell):
```powershell
.\SETUP_BD.ps1
```

Para Windows (CMD):
```cmd
SETUP_BD.bat
```

## Despliegue con Docker (Recomendado)

El repositorio incluye todo lo necesario para desplegar sin instalar Node, MySQL ni nginx en el servidor:

| Archivo | Función |
|---|---|
| `docker-compose.prod.yaml` | Orquesta `db` (MySQL 8), `backend` (Node/Express) y `frontend` (nginx). |
| `backend/Dockerfile` | Build multi-stage sobre `node:20-alpine`; instala dependencias con `npm ci --omit=dev`, compila `bcrypt` en la etapa de build y ejecuta como usuario `node`. |
| `backend/docker-entrypoint.sh` | Espera/inicializa el esquema y, si `SEED_DEMO=true`, carga los datos de ejemplo. |
| `frontend/Dockerfile` | Build multi-stage: Vite genera `dist/` y nginx lo sirve. |
| `frontend/nginx.conf` | Fallback de SPA, proxy de `/api` y `/uploads`, límite de subida y cache de assets. |
| `.env.produccion.example` | Plantilla de variables; se copia a `.env.produccion` (ignorado por git). |

### Requisitos

- Docker Engine 24 o superior.
- Docker Compose v2 (`docker compose`).
- `HTTP_PORT` libre (80 por defecto; 8080 si el 80 está ocupado).
- 2 GB de RAM recomendados (MySQL + Node + nginx).

### Arquitectura del despliegue

```
Navegador
   │  HTTP :HTTP_PORT
   ▼
frontend (nginx)
   ├── /            → dist/ de React (SPA, fallback a index.html)
   ├── /api/...     → proxy → backend:4000
   └── /uploads/... → proxy → backend:4000
                                  │
                                  ▼
                              db:3306 (MySQL 8)
```

- Solo el servicio `frontend` publica un puerto en el host.
- `backend` y `db` solo son accesibles dentro de la red de Compose.
- El frontend usa rutas relativas (`/api`), así que no hay que recompilar si cambia el dominio, el subdominio o el puerto.
- El backend confía en un único proxy (`trust proxy = 1`), por lo que `req.ip` y el rate limit funcionan con la IP real del cliente detrás de nginx.

### 1. Clonar y crear el archivo de entorno

```bash
git clone https://github.com/marcoib-dev/RecursosHidricosSDE.git
cd RecursosHidricosSDE

cp .env.produccion.example .env.produccion
chmod 600 .env.produccion
```

Completar `.env.produccion`:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | Sí | Contraseña del root de MySQL. Solo para administración interna. |
| `DB_NAME` | Sí | Nombre de la base (`recursos_hidricos_sde`). |
| `DB_USER` | Sí | Usuario de la aplicación. La imagen de MySQL lo crea la primera vez. No puede ser `root`. |
| `DB_PASSWORD` | Sí | Contraseña del usuario de la aplicación. |
| `DB_HOST` / `DB_PORT` | Sí | `db` / `3306` dentro de Compose. |
| `JWT_SECRET` | Sí | Clave de firma de tokens. Generar una nueva (ver abajo). |
| `JWT_EXPIRES_IN` | No | Duración del token (`7d` por defecto). |
| `FRONTEND_URL` | Sí | URL pública, usada por CORS (ej. `https://recursos-hidricos.midominio.gob.ar`). |
| `HTTP_PORT` | No | Puerto publicado en el host (`80` por defecto). |
| `SEED_DEMO` | No | `true` carga usuarios/obras de ejemplo; `false` deja solo el esquema. |

Generar el secreto JWT:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# alternativa sin Node:
openssl rand -hex 64
```

> **Nunca** commitear `.env.produccion`. Ya está incluido en `.gitignore`.
> Si la contraseña contiene `$`, `#`, espacios u otros caracteres especiales, entrecomillarla en el archivo de entorno.

### 2. Levantar el stack

```bash
docker compose --env-file .env.produccion -f docker-compose.prod.yaml up -d --build
```

Verificar:

```bash
docker compose --env-file .env.produccion -f docker-compose.prod.yaml ps
curl http://localhost:${HTTP_PORT:-80}/api/health
```

La respuesta esperada del health check es `{"status":"ok","database":"connected",...}`.

### 3. Inicialización de la base de datos

**Decisión:** el esquema lo crea `backend/src/database/init.mjs` desde el entrypoint del backend, **no** se monta `backend/database.sql` en `/docker-entrypoint-initdb.d`.

Motivos:

1. `database.sql` contiene inserts de usuarios y obras de ejemplo. Montarlo haría que **siempre** se carguen datos demo, incluso en producción.
2. Los hashes de contraseña de `database.sql` corresponden a valores de ejemplo que no permiten un login real; el seed de Node genera hashes válidos con `bcrypt`.
3. `init.mjs` es idempotente (`CREATE TABLE IF NOT EXISTS`, ignora índices existentes) y se puede ejecutar en cada arranque sin duplicar nada.
4. La imagen de MySQL ya crea la base con `MYSQL_DATABASE`; `init.mjs` se conecta directo a ella y solo intenta crearla si no existe.

> Limitación: `init.mjs` crea tablas faltantes, pero no es un sistema de migraciones. Si en el futuro cambia una columna existente, habrá que agregar una migración explícita.

### 4. Datos de ejemplo (opcional)

Opción A — antes del primer arranque: poner `SEED_DEMO=true` en `.env.produccion` y ejecutar `up -d --build`.

Opción B — con el stack ya levantado:

```bash
docker compose --env-file .env.produccion -f docker-compose.prod.yaml exec backend npm run db:seed
```

El seed es idempotente:

- Los usuarios se insertan con `INSERT IGNORE` (no se pisan contraseñas existentes).
- Cada obra demo se busca por nombre antes de insertarla.
- Se puede ejecutar en cada reinicio con `SEED_DEMO=true` sin duplicar registros.

Credenciales de prueba: `admin@recursoshidricos.gob.ar / admin123`, `presidente@... / presidente123`, `inspector@... / inspector123`, departamentos `/ depto123`.

> **Cambiar todas las contraseñas de prueba después del primer ingreso.**

Para desactivar el seed en arranques posteriores, volver a `SEED_DEMO=false` y aplicar con `up -d`.

### 5. Logs y estado

```bash
# Seguir todos los logs
docker compose --env-file .env.produccion -f docker-compose.prod.yaml logs -f

# Un servicio concreto
docker compose --env-file .env.produccion -f docker-compose.prod.yaml logs -f backend
docker compose --env-file .env.produccion -f docker-compose.prod.yaml logs -f db

# Estado de salud
docker compose --env-file .env.produccion -f docker-compose.prod.yaml ps
docker inspect --format '{{.State.Health.Status}}' $(docker compose --env-file .env.produccion -f docker-compose.prod.yaml ps -q backend)
```

### 6. Actualizar el despliegue

```bash
git pull
docker compose --env-file .env.produccion -f docker-compose.prod.yaml up -d --build
```

- Se reconstruyen las imágenes con el código nuevo.
- El entrypoint vuelve a ejecutar `init.mjs` (idempotente).
- Los volúmenes `mysql_data` y `uploads_data` se conservan.
- Si cambió `nginx.conf`, el contenedor de frontend se recrea con la nueva configuración.

### 7. Detener o eliminar

```bash
# Detener conservando datos
docker compose --env-file .env.produccion -f docker-compose.prod.yaml down

# Detener y ELIMINAR base de datos + archivos subidos
docker compose --env-file .env.produccion -f docker-compose.prod.yaml down -v
```

> ⚠️ **`down -v` borra los volúmenes `mysql_data` y `uploads_data`.** No existe recuperación sin un backup previo.

### 8. Backups y restauración

Backup de la base:

```bash
docker compose --env-file .env.produccion -f docker-compose.prod.yaml exec -T db \
  sh -c 'exec mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

Backup de los archivos subidos:

```bash
docker run --rm \
  -v recursos-hidricos-sde_uploads_data:/data:ro \
  -v "$PWD":/backup \
  alpine sh -c 'tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /data .'
```

Restaurar la base:

```bash
cat backup_20260101_020000.sql | \
docker compose --env-file .env.produccion -f docker-compose.prod.yaml exec -T db \
  sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
```

### 9. Resolución de problemas

| Síntoma | Causa probable / solución |
|---|---|
| `502 Bad Gateway` después de actualizar | Recrear el frontend: `docker compose ... up -d --force-recreate frontend`. nginx resuelve `backend` dinámicamente, pero un reinicio fuerza la reconexión. |
| `Access denied for user 'rh_app'` | Se cambió `DB_PASSWORD` después de crear el volumen. MySQL solo aplica `MYSQL_USER`/`MYSQL_PASSWORD` la primera vez. Restaurar la contraseña anterior o cambiarla dentro de MySQL. |
| El puerto 80 está ocupado | Cambiar `HTTP_PORT=8080` en `.env.produccion` y ejecutar `up -d`. |
| No aparecen los datos demo | `SEED_DEMO=true` en `.env.produccion`, luego `up -d`; revisar `logs backend`. También se puede ejecutar el seed manualmente. |
| Los archivos subidos no persisten | Verificar que exista el volumen `recursos-hidricos-sde_uploads_data` y que no se haya usado `down -v`. |
| Error de permisos en `uploads/` con bind mount | El contenedor corre como usuario `node` (UID 1000): `sudo chown -R 1000:1000 ./uploads`. Con volúmenes nombrados no hace falta. |
| Cambios en `.env.produccion` no se aplican | Ejecutar `up -d` (Compose recrea si cambian las variables). |

### 10. Seguridad

- [ ] Contraseñas de MySQL y `JWT_SECRET` nuevas y únicas por instalación.
- [ ] `SEED_DEMO=false` en producción real.
- [ ] Cambiar contraseñas de usuarios de prueba tras el primer ingreso.
- [ ] Publicar solo `HTTP_PORT`; no exponer 3306 ni 4000.
- [ ] Configurar HTTPS con un reverse proxy delante (Caddy, Traefik, nginx del host) apuntando a `HTTP_PORT`.
- [ ] Backups programados de base y uploads.
- [ ] Mantener `.env.produccion` fuera del repositorio y con permisos `600`.

## Despliegue en Produccion

### Build del Frontend

```bash
cd frontend
npm run build
```

Esto genera la carpeta `frontend/dist/` con los archivos estaticos optimizados.

### Opciones de Despliegue del Frontend

#### Opcion 1: Servir con Vite Preview

```bash
cd frontend
npm run preview
```

#### Opcion 2: Servir con Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /ruta/al/proyecto/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:4000;
    }
}
```

#### Opcion 3: Servir con Express (mismo servidor)

Se puede configurar Express para servir los archivos estaticos del frontend:

```javascript
// En server.js, agregar al final de las rutas:
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});
```

### Backend en Produccion

```bash
cd backend
npm start
```

Para mantener el proceso corriendo, usar un process manager:

#### Con PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar la aplicacion
cd backend
pm2 start server.js --name "recursos-hidricos-api"

# Monitorear
pm2 logs recursos-hidricos-api
pm2 monit

# Configurar auto-start
pm2 startup
pm2 save
```

#### Con systemd (Linux)

Crear `/etc/systemd/system/recursos-hidricos.service`:

```ini
[Unit]
Description=Recursos Hidricos SDE - API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/ruta/al/proyecto/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable recursos-hidricos
sudo systemctl start recursos-hidricos
sudo systemctl status recursos-hidricos
```

## Seguridad en Produccion

### Checklist

- [ ] Cambiar `JWT_SECRET` a un valor aleatorio seguro
- [ ] No exponer el puerto de MySQL (3306) al publico
- [ ] Configurar HTTPS con certificado SSL
- [ ] Restringir CORS a tu dominio de produccion
- [ ] Cambiar contrasenas de usuarios de prueba
- [ ] Configurar backups automaticos de MySQL
- [ ] Habilitar firewall (ufw/iptables)
- [ ] Configurar rate limiting mas estricto si es necesario
- [ ] Revisar que `.env` no este commiteado

### Variables de Entorno en Produccion

```env
DB_HOST=tu-servidor-mysql
DB_PORT=3306
DB_USER=recursos_app
DB_PASSWORD=contrasena_segura_de_produccion
DB_NAME=recursos_hidricos_sde

JWT_SECRET=clave_aleatoria_de_64_caracteres_minimo
JWT_EXPIRES_IN=24h

PORT=4000
FRONTEND_URL=https://tu-dominio.com
```

## Backups

### Backup de Base de Datos

```bash
# Backup completo
mysqldump -u root -p recursos_hidricos_sde > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
mysql -u root -p recursos_hidricos_sde < backup_20260412_103000.sql
```

### Backup de Archivos Subidos

```bash
# Copiar directorio de uploads
cp -r backend/uploads/ /ruta/de/backup/uploads_$(date +%Y%m%d)/
```

### Cron Job para Backups Automaticos

```bash
# Editar crontab
crontab -e

# Backup diario a las 2:00 AM
0 2 * * * mysqldump -u root -p'password' recursos_hidricos_sde > /backups/db_$(date +\%Y\%m\%d).sql
```

## Puertos Utilizados

| Puerto | Servicio | Configurable |
|---|---|---|
| 3000 | Frontend (Vite dev server) | `frontend/vite.config.js` o `--port` |
| 4000 | Backend (Express API) | Variable `PORT` en `.env` |
| 3306 | MySQL | Variable `DB_PORT` en `.env` |

## Troubleshooting

### El backend no conecta a MySQL

1. Verificar que MySQL este corriendo: `sudo systemctl status mysql`
2. Verificar credenciales en `.env`
3. Ejecutar diagnostico: `node backend/diagnostico-bd.js`

### Error CORS al conectar frontend con backend

1. Verificar que `FRONTEND_URL` en `.env` coincida con la URL del frontend
2. En desarrollo, asegurarse de que ambos servidores esten corriendo

### Error "Token expirado"

1. El token JWT tiene una duracion configurable (`JWT_EXPIRES_IN`)
2. El frontend redirige automaticamente a `/login` al expirar
3. Para produccion, considerar reducir el tiempo de expiracion (ej: `24h`)

### El frontend muestra pantalla en blanco

1. Verificar la consola del navegador (F12)
2. Asegurarse de que el backend este corriendo en el puerto correcto
3. Verificar que `API_BASE` en `frontend/src/services/api.js` apunte al backend correcto
