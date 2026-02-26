#!/bin/bash

# Script di backup database SQLite
# Uso: ./backup.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/database_$TIMESTAMP.sqlite"

echo "💾 Avvio backup database..."

# Crea directory backup se non esiste
mkdir -p "$BACKUP_DIR"

# Copia database dal container
echo "📦 Copiando database dal container..."
docker compose exec backend cp database.sqlite database_backup.sqlite
docker compose cp backend:/app/database_backup.sqlite "$BACKUP_FILE"

# Verifica backup
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup completato: $BACKUP_FILE ($SIZE)"
    
    # Mantieni solo ultimi 7 backup
    echo "🧹 Rimuovendo backup vecchi (mantengo ultimi 7)..."
    ls -t "$BACKUP_DIR"/database_*.sqlite | tail -n +8 | xargs -r rm
    
    echo "📋 Backup disponibili:"
    ls -lh "$BACKUP_DIR"/database_*.sqlite
else
    echo "❌ Errore durante il backup!"
    exit 1
fi
