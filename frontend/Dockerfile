FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
ARG VITE_SENTRY_DSN
ARG VITE_APP_VERSION
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_APP_VERSION=$VITE_APP_VERSION

RUN npm run build

# ── Serveur Nginx léger ───────────────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
