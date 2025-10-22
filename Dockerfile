# ---- Build stage ----
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Build-time configuration for Vite (will be embedded in the bundle)
# These can be overridden via docker build args in docker-compose.yml
ARG VITE_API_BASE_URL
ARG VITE_API_TOKEN
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_TOKEN=${VITE_API_TOKEN}

COPY . .
RUN npm run build

# ---- Production stage ----
FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

# Minimal SPA fallback (optional). If you have a custom nginx.conf, copy it instead.
RUN printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]