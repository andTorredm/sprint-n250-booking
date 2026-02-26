# Backend Dockerfile
FROM node:24-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa tutte le dipendenze (incluse dev per compilare TypeScript)
RUN npm ci

# Copia codice sorgente
COPY . .

# Compila TypeScript
RUN npm run build

# Rimuovi devDependencies dopo la build
RUN npm prune --production

# Espone porta backend
EXPOSE 3001

# Comando di avvio
CMD ["node", "dist/index.js"]
