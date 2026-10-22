#!/bin/sh
set -e

# ─── Inicialización de la base de datos ──────────────
# init.mjs es idempotente: crea solo lo que falta y no inserta datos.
# Se reintenta por si MySQL tarda unos segundos más en aceptar conexiones
# (el healthcheck de Compose ayuda, pero esto cubre reinicios del motor).
echo "⏳ Inicializando esquema de base de datos..."
intentos=0
until node src/database/init.mjs; do
  intentos=$((intentos + 1))
  if [ "$intentos" -ge 30 ]; then
    echo "❌ No se pudo inicializar la base de datos después de 30 intentos." >&2
    exit 1
  fi
  echo "   Reintentando en 3 segundos ($intentos/30)..."
  sleep 3
done

# ─── Datos de ejemplo (opcional) ────────────────────
# seed.mjs es idempotente: verifica cada obra por nombre y no duplica
# registros aunque el contenedor se reinicie con SEED_DEMO=true.
if [ "${SEED_DEMO:-false}" = "true" ]; then
  echo "🌱 SEED_DEMO=true: cargando datos de ejemplo..."
  node src/database/seed.mjs
fi

echo "🚀 Iniciando backend..."
exec "$@"
