FROM node:18-alpine

WORKDIR /app

# Copiar package.json primero (para cache de Docker)
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer puerto de Vite (normalmente 5173)
EXPOSE 5173

# Comando para desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]