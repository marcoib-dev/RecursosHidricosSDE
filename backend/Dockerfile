# syntax=docker/dockerfile:1

# ─── Etapa de dependencias ───────────────────────────
# bcrypt es un módulo nativo. En Alpine (musl) no siempre hay
# binario precompilado, así que instalamos las herramientas de
# compilación únicamente en esta etapa.
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache --virtual .build-deps \
      build-base \
      python3

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Imagen final ────────────────────────────────────
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node server.js ./
COPY --chown=node:node src ./src
COPY --chown=node:node docker-entrypoint.sh ./

# uploads/ queda propiedad de "node": al montarse por primera vez un
# volumen nombrado vacío, Docker hereda estos permisos.
RUN chmod +x ./docker-entrypoint.sh \
    && mkdir -p /app/uploads \
    && chown -R node:node /app/uploads

USER node

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
