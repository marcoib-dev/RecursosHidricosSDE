# 📋 GUÍA DE DIAGNÓSTICO Y SOLUCIÓN - BASE DE DATOS

## Estado Actual ✅

**Diagnóstico realizado:** 12 de Abril, 2026

```
✅ MySQL conectado correctamente
✅ Base de datos "recursos_hidricos_sde" EXISTE
✅ 6 tablas creadas:
   - usuarios (6 registros)
   - obras
   - plantas
   - pozos
   - archivos_obra
   - auditoria
```

---

## 🔴 Si la Base de Datos NO funciona

### PASO 1: Verificar que MySQL está ejecutándose

#### En Windows:
```powershell
# Opción A: Abrir Services
# Presiona: Win + R
# Escribe: services.msc
# Busca "MySQL80" o similar y verifica que esté "Running"

# Opción B: Por línea de comandos
Get-Service MySQL* | Select-Object Name, Status

# Si el servicio está detenido, inicia:
Start-Service MySQL80
# (Reemplaza MySQL80 con el nombre exacto del servicio)
```

#### En Linux/Mac:
```bash
# Verificar estado
sudo service mysql status
# O
brew services list | grep mysql

# Si no está corriendo:
sudo service mysql start
# O
brew services start mysql
```

---

### PASO 2: Verificar credenciales en `.env`

Abre el archivo `backend/.env`:

```properties
DB_HOST=localhost      # ✓ Correcto para máquina local
DB_PORT=3306          # ✓ Puerto estándar MySQL
DB_NAME=recursos_hidricos_sde
DB_USER=root          # Verifica que sea el usuario correcto
DB_PASSWORD=46141305  # ⚠️ CAMBIAR ESTA CONTRASEÑA
```

**⚠️ IMPORTANTE:** La contraseña `46141305` es un ejemplo. Si tu MySQL tiene otra contraseña, actualiza `.env`:

```bash
# Conéctate a MySQL como root y verifica/cambia contraseña:
mysql -u root -p
# Ingresa tu contraseña actual

# Para cambiar la contraseña (dentro de MySQL):
ALTER USER 'root'@'localhost' IDENTIFIED BY '46141305';
FLUSH PRIVILEGES;
EXIT;
```

---

### PASO 3: Diagnosticar el problema

Ejecuta en la carpeta `backend`:

```bash
node diagnostico-bd.js
```

**Posibles resultados:**

#### ❌ Error: `connect ECONNREFUSED`
**Problema:** MySQL no está ejecutándose
**Solución:**
```bash
# Windows
net start MySQL80

# Linux
sudo systemctl start mysql

# Mac
brew services start mysql
```

#### ❌ Error: `ER_ACCESS_DENIED_ERROR`
**Problema:** Contraseña incorrecta
**Solución:**
1. Verifica la contraseña en `.env`
2. O conéctate a MySQL y cambia:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA_AQUI';
```

#### ❌ Error: `ER_BAD_DB_ERROR` (Database doesn't exist)
**Problema:** Base de datos no existe
**Solución:**
```bash
cd backend
npm run db:init
```

#### ❌ Error: `ENOTFOUND` (Host not found)
**Problema:** Host incorrecto en `.env`
**Solución:**
- Cambia `DB_HOST` a `127.0.0.1` en lugar de `localhost`
- O instala MySQL en la máquina local

---

### PASO 4: Crear/Reiniciar la Base de Datos

```bash
cd backend

# Crear la base de datos y tablas
npm run db:init

# (Opcional) Agregar datos de prueba
npm run db:seed
```

---

### PASO 5: Verificar que todo funciona

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Debería ver:
# ✨ Recursos Hídricos SDE - Backend corriendo en http://localhost:4000
# ✅ MySQL conectado a "recursos_hidricos_sde"

# Terminal 2 - Frontend
cd frontend
npm run dev

# Debería ver:
# ➜ Local: http://localhost:3000/
```

Abre en navegador: **http://localhost:3000**

---

## 🛠️ Troubleshooting Avanzado

### MySQL no aparece en Services

```powershell
# Buscar todos los servicios MySQL
Get-Service | Where-Object {$_.Name -like '*MySQL*'}

# Resultado esperado:
# Status   Name                DisplayName
# ------   ----                -----------
# Running  MySQL80             MySQL80
```

Si no aparece, MySQL no está instalado. Descárgalo de: https://dev.mysql.com/downloads/mysql/

### Error de puerto ocupado

Si el puerto 3306 está en uso:
```powershell
# Encontrar qué usa el puerto 3306
netstat -ano | findstr :3306

# Cambiar puerto en .env
DB_PORT=3307  # O cualquier otro puerto disponible

# Reiniciar MySQL en ese puerto
```

### Restaurar base de datos desde SQL

```bash
# Ejecutar el script SQL directamente
mysql -u root -p recursos_hidricos_sde < database.sql

# O desde dentro de MySQL:
mysql -u root -p
USE recursos_hidricos_sde;
SOURCE database.sql;
```

---

## 📝 Resumen de Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `backend/.env` | Configuración de conexión a BD |
| `backend/database.sql` | Script SQL para crear tablas |
| `backend/diagnostico-bd.js` | Script para diagnosticar problemas |
| `backend/src/database/init.js` | Script para inicializar BD desde Node.js |
| `backend/src/database/seed.js` | Script para agregar datos de prueba |

---

## ✅ Checklist Final

- [ ] MySQL está ejecutándose
- [ ] Las credenciales en `.env` son correctas
- [ ] La base de datos `recursos_hidricos_sde` existe
- [ ] Las 6 tablas están creadas
- [ ] El backend inicia sin errores
- [ ] El frontend carga en http://localhost:3000
- [ ] Puedes hacer login (usuario por defecto después de seed)

---

## 📞 Si aún no funciona

Contacta con el soporte técnico con el resultado de:
```bash
node diagnostico-bd.js
```

Copia y pega todo el output del diagnóstico.

---

**Última actualización:** 12 de Abril, 2026
