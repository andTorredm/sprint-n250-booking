#!/bin/bash

# Script di deploy per Sprint Turin Booker
# Uso: ./deploy.sh

set -e

echo "🚀 Avvio deploy Sprint Turin Booker..."

# Avviso se .env non esiste (opzionale per locale, obbligatorio per produzione)
if [ ! -f .env ]; then
    echo "⚠️  File .env non trovato. Verrà usato JWT_SECRET di default (solo per test locale!)"
    echo "⚠️  Per produzione: cp .env.example .env e configura un JWT_SECRET sicuro"
    echo ""
fi

# Stop container esistenti
echo "🛑 Stopping existing containers..."
docker compose down

# Build nuove immagini
echo "🔨 Building Docker images..."
docker compose build --no-cache

# Avvia container
echo "▶️  Starting containers..."
docker compose up -d

# Attendi che i servizi siano pronti
echo "⏳ Waiting for services to be ready..."
sleep 10

# Controlla stato
echo "📊 Checking container status..."
docker compose ps

echo ""
echo "✅ Deploy completato!"
echo "📱 Frontend disponibile su: http://localhost"
echo "🔧 API backend disponibile su: http://localhost/api"
echo ""
echo "Comandi utili:"
echo "  docker compose logs -f              # Vedi tutti i log"
echo "  docker compose logs -f backend      # Vedi log backend"
echo "  docker compose logs -f frontend     # Vedi log frontend"
echo "  docker compose restart              # Riavvia tutto"
echo "  docker compose down                 # Ferma tutto"
echo "  ./backup.sh                         # Backup database"
