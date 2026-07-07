FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# ── Dépendances ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ── Image finale ─────────────────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

RUN mkdir -p uploads/cvs uploads/documents uploads/avatars

# Utilisateur non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
