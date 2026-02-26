# Sprint Turin Booker - Docker Deployment

## 📋 Prerequisiti

- Docker e Docker Compose installati
- Porta 80 disponibile sul server

## 🚀 Quick Start

### 1. Configurazione

```bash
# Copia file di esempio e configura JWT secret
cp .env.example .env
nano .env  # Modifica JWT_SECRET con un valore sicuro
```

### 2. Deploy

```bash
# Rendi eseguibili gli script
chmod +x deploy.sh backup.sh restore.sh

# Avvia deploy
./deploy.sh
```

L'applicazione sarà disponibile su `http://localhost` (o IP del server)

## 📦 Struttura

```
sprint-turin-booker/
├── client/               # Frontend React
│   ├── Dockerfile
│   └── nginx.conf       # Configurazione Nginx
├── server/              # Backend Express
│   └── Dockerfile
├── docker-compose.yml   # Orchestrazione servizi
├── deploy.sh           # Script deploy automatico
├── backup.sh           # Script backup database
└── restore.sh          # Script restore database
```

## 🛠️ Comandi Utili

### Deploy e Gestione

```bash
./deploy.sh              # Deploy completo (build + start)
docker compose up -d     # Avvia container in background
docker compose down      # Ferma e rimuove container
docker compose restart   # Riavvia tutti i servizi
docker compose ps        # Stato container
```

### Log e Debug

```bash
docker compose logs -f              # Tutti i log in tempo reale
docker compose logs -f backend      # Solo backend
docker compose logs -f frontend     # Solo frontend
docker compose logs --tail=100      # Ultimi 100 log
```

### Database

```bash
./backup.sh                         # Backup database
./restore.sh backups/database_*.sqlite  # Restore da backup

# Accesso diretto al database
docker compose exec backend sqlite3 database.sqlite
```

### Accesso SSH ai Container

```bash
docker compose exec backend sh      # Shell nel backend
docker compose exec frontend sh     # Shell nel frontend
```

## 🔧 Manutenzione

### Creare Admin User

```bash
docker compose exec backend npm run create-admin admin@example.com password123 Mario Rossi
```

### Aggiornamento Codice

```bash
git pull
./deploy.sh  # Rebuild e restart automatico
```

### Backup Automatico (Cron)

Aggiungi al crontab del server:

```bash
# Backup giornaliero alle 3:00 AM
0 3 * * * cd /path/to/sprint-turin-booker && ./backup.sh >> logs/backup.log 2>&1
```

## 🔒 Sicurezza

1. **JWT_SECRET**: Cambia il valore in `.env` con una stringa random lunga
2. **Firewall**: Apri solo porta 80 (o 443 se usi HTTPS)
3. **HTTPS**: Per produzione, aggiungi Nginx con Let's Encrypt davanti a Docker
4. **Backup**: Esegui backup regolari e testali periodicamente

## 📊 Monitoring

### Resource Usage

```bash
docker stats  # CPU, RAM, Network in tempo reale
```

### Container Health

```bash
docker compose ps  # Vedi stato health check
```

## 🐛 Troubleshooting

### Container non parte

```bash
docker compose logs backend   # Controlla errori
docker compose down -v        # Reset completo (attenzione: cancella volume)
./deploy.sh                   # Riprova deploy
```

### Database corrotto

```bash
./restore.sh backups/database_YYYYMMDD_HHMMSS.sqlite
```

### Porta 80 occupata

Modifica `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Usa porta 8080 invece di 80
```

## 📈 Scalabilità

Per gestire più traffico, modifica `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      replicas: 3  # 3 istanze backend
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## 🌐 Accesso Esterno

### Opzione 1: Nginx Reverse Proxy (Consigliato)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Opzione 2: Bind diretto

In `docker-compose.yml` cambia:
```yaml
ports:
  - "0.0.0.0:80:80"  # Espone su tutte le interfacce
```

## 📞 Support

Per problemi o domande, controlla:
1. Log dei container: `docker compose logs`
2. Stato servizi: `docker compose ps`
3. Risorse: `docker stats`
