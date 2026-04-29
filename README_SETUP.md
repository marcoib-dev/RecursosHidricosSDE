# 🌊 Recursos Hídricos SDE - Setup y Ejecución

## ⚡ Inicio Rápido

### 1. Verificar que MySQL está ejecutándose

**Windows:**
```powershell
# Opción A: Abrir Services
# Win + R > services.msc > Busca MySQL80 > Start

# Opción B: PowerShell (como Admin)
Start-Service MySQL80

# Opción C: Verificar servicios disponibles
Get-Service | Where-Object {$_.Name -like '*MySQL*'}
```

**Linux/Mac:**
```bash
sudo systemctl start mysql
# O
brew services start mysql
```

### 2. Ejecutar diagnóstico de Base de Datos

```bash
cd backend
node diagnostico-bd.js
```

**Resultado esperado:**
```
✅ Conexión exitosa a MySQL
✅ Base de datos "recursos_hidricos_sde" EXISTE
✅ Se encontraron 6 tablas
✅ Tabla usuarios OK - 6 usuarios registrados
```

### 3. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

### 4. Iniciar los servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Deberías ver:
```
✨ Recursos Hídricos SDE - Backend corriendo en http://localhost:4000
✅ MySQL conectado a "recursos_hidricos_sde"
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Deberías ver:
```
➜ Local: http://localhost:3000/
```

### 5. Acceder a la aplicación

Abre en tu navegador: **http://localhost:3000**

---

## 🔧 Configuración de Base de Datos

### Archivo `.env` (Backend)

Ubicación: `backend/.env`

```properties
# Servidor
PORT=4000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=recursos_hidricos_sde
DB_USER=root
DB_PASSWORD=46141305

# JWT
JWT_SECRET=recursos-hidricos-sde-secret-key-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Archivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**⚠️ IMPORTANTE:** 
- Cambia `DB_PASSWORD` con tu contraseña de MySQL
- En producción, cambia `JWT_SECRET` a algo seguro
- Nunca hagas commit del `.env` con credenciales reales

---

## 🗄️ Comandos de Base de Datos

```bash
cd backend

# Crear/Reiniciar base de datos y tablas
npm run db:init

# Agregar datos de prueba
npm run db:seed

# Ver logs del servidor
npm run dev
```

---

## 🐛 Solucionar Problemas

### ❌ `ECONNREFUSED` - MySQL no está corriendo

```powershell
# Windows
Start-Service MySQL80

# Linux
sudo systemctl start mysql

# Mac
brew services start mysql
```

### ❌ `ER_ACCESS_DENIED_ERROR` - Contraseña incorrecta

1. Verifica la contraseña en `backend/.env`
2. O cambia la contraseña en MySQL:
```bash
mysql -u root -p
# (Ingresa la contraseña actual)
# Dentro de MySQL:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA_NUEVA';
FLUSH PRIVILEGES;
EXIT;
```

### ❌ `ER_BAD_DB_ERROR` - Base de datos no existe

```bash
cd backend
npm run db:init
```

### ❌ Puerto en uso

Si el puerto 3000 o 4000 está en uso:

```powershell
# Windows - Encontrar qué usa el puerto
netstat -ano | findstr :3000

# Cambiar puerto en .env
DB_PORT=3307  # O en vite.config.js para frontend
```

---

## 📁 Estructura del Proyecto

```
RecursosHidricosSDE-main/
├── backend/
│   ├── server.js           # Servidor Express
│   ├── .env                # Configuración (NO hacer commit)
│   ├── database.sql        # Script SQL
│   ├── package.json
│   ├── diagnostico-bd.js   # Script de diagnóstico
│   ├── uploads/            # Archivos subidos
│   └── src/
│       ├── database/       # Conexión y init BD
│       ├── routes/         # Rutas API
│       ├── middleware/     # Middlewares
│       └── controllers/    # Lógica de negocio
│
├── frontend/
│   ├── vite.config.js      # Config Vite
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── pages/          # Páginas
│       ├── components/     # Componentes React
│       ├── contexts/       # Context API (Auth)
│       ├── services/       # API client
│       └── lib/            # Utilidades
│
├── DIAGNOSTICO_BD.md       # Guía de diagnóstico
└── SETUP_BD.ps1            # Script PowerShell setup
```

---

## 👥 Usuarios por defecto (después de `npm run db:seed`)

```
Usuario: admin@sde.com
Contraseña: admin123
Rol: Administrador

Usuario: inspector@sde.com
Contraseña: inspector123
Rol: Inspector

(Ver seed.js para más usuarios)
```

---

## 🚀 Deploy a Producción

### Variables de entorno requeridas:

```env
NODE_ENV=production
PORT=4000

DB_HOST=tu-servidor-mysql.com
DB_PORT=3306
DB_NAME=recursos_hidricos_sde
DB_USER=usuario_prod
DB_PASSWORD=contraseña_super_segura

JWT_SECRET=una-llave-aleatoria-muy-segura
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://tu-dominio.com
```

### Build frontend:
```bash
cd frontend
npm run build
# Esto genera una carpeta `dist` para publicar
```

---

## 📊 API Endpoints

### Auth
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Obras
- `GET /api/obras` - Listar obras
- `POST /api/obras` - Crear obra
- `GET /api/obras/:id` - Obtener obra
- `PUT /api/obras/:id` - Actualizar obra
- `DELETE /api/obras/:id` - Eliminar obra

### Usuarios (Admin)
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios/:id` - Obtener usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas
- `GET /api/dashboard/actividad` - Actividad reciente
- `GET /api/dashboard/estado` - Estados de obras

---

## 📝 Logs y Debugging

### Backend
```bash
# Desarrollo con logs detallados
npm run dev

# Producción
npm start
```

### Frontend
- Abre DevTools: `F12` o `Ctrl+Shift+I`
- Consola: `F12` > `Console`
- Network: `F12` > `Network` (para ver requests a API)

---

## 🆘 Soporte

Si tienes problemas:

1. Ejecuta: `node diagnostico-bd.js`
2. Copia el output
3. Contacta con soporte incluyendo el diagnóstico

---

**Última actualización:** 12 de Abril, 2026
