#!/bin/bash

# Script di restore database SQLite
# Uso: ./restore.sh <backup_file>

set -e

if [ $# -eq 0 ]; then
    echo "❌ Specifica il file di backup da ripristinare"
    echo "Uso: ./restore.sh <backup_file>"
    echo ""
    echo "Backup disponibili:"
    ls -lh ./backups/database_*.sqlite 2>/dev/null || echo "Nessun backup trovato"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ File non trovato: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  ATTENZIONE: Stai per sovrascrivere il database corrente!"
echo "File di backup: $BACKUP_FILE"
read -p "Sei sicuro? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Operazione annullata."
    exit 0
fi

echo "🔄 Ripristino database in corso..."

# Stop backend
docker compose stop backend

# Copia backup nel container
docker compose cp "$BACKUP_FILE" backend:/app/database.sqlite

# Riavvia backend
docker compose start backend

echo "✅ Database ripristinato con successo!"
echo "🔍 Verifica con: docker compose logs backend"
