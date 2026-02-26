# Frontend Dockerfile - Multi-stage build
FROM node:24-alpine AS builder

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm ci

# Copia codice sorgente
COPY . .

# Build production
RUN npm run build

# Stage 2: Nginx per servire il frontend
FROM nginx:alpine

# Copia build dal builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configurazione nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Espone porta 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
