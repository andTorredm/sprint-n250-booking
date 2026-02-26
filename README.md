# Sprint Turin Booker

Sistema di prenotazione posti ufficio tramite sondaggi settimanali.

Due progetti separati: **client** (frontend) e **server** (backend).

## Struttura Progetto

```
sprint-turin-booker/
├── client/          # Frontend React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
└── server/          # Backend Express + SQLite
    ├── routes/
    ├── middleware/
    ├── .env
    └── package.json
```

## Funzionalità

- **Autenticazione**: Registrazione e login con nome, cognome, email e password
- **Ruoli**: VOTER (tutti gli utenti) e ADMIN
- **Sondaggi settimanali**: L'admin può creare nuovi sondaggi ogni venerdì
- **Votazione multipla**: Gli utenti possono selezionare più opzioni
- **Voti pubblici**: Tutti possono vedere chi ha votato cosa
- **Timestamp**: Ogni voto ha un timestamp per determinare l'ordine di prenotazione
- **Modifica voto**: Gli utenti possono modificare il proprio voto, i timestamp delle opzioni non cambiate rimangono invariati
- **Chiusura sondaggi**: L'admin può chiudere i sondaggi quando necessario
- **Dark/Light mode**: Supporto automatico per il tema di sistema

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- SQLite (database.sqlite)
- JWT per autenticazione
- bcryptjs per hashing password

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS v4
- shadcn/ui

## Setup

### 1. Installazione dipendenze

Installa le dipendenze per ogni progetto:

```bash
# Client
cd client
npm install

# Server
cd server
npm install
```

### 2. Configurazione ambiente

Il file `server/.env` è già configurato con valori di default:
```env
PORT=3001
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**⚠️ IMPORTANTE**: Cambia `JWT_SECRET` in produzione!

### 3. Avvio applicazione

Devi aprire **due terminali separati**:

**Terminale 1 - Client:**
```bash
cd client
npm run dev
```

**Terminale 2 - Server:**
```bash
cd server
npm run dev
```

L'applicazione sarà disponibile su:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Struttura Database

### users
- `id`: INTEGER PRIMARY KEY
- `email`: TEXT UNIQUE
- `password`: TEXT (hashed)
- `firstName`: TEXT
- `lastName`: TEXT
- `role`: TEXT ('VOTER' | 'ADMIN')
- `createdAt`: DATETIME

### polls
- `id`: INTEGER PRIMARY KEY
- `title`: TEXT
- `description`: TEXT
- `createdBy`: INTEGER (FK -> users)
- `createdAt`: DATETIME
- `closedAt`: DATETIME (nullable)

### poll_options
- `id`: INTEGER PRIMARY KEY
- `pollId`: INTEGER (FK -> polls)
- `optionText`: TEXT

### votes
- `id`: INTEGER PRIMARY KEY
- `userId`: INTEGER (FK -> users)
- `pollId`: INTEGER (FK -> polls)
- `optionId`: INTEGER (FK -> poll_options)
- `timestamp`: DATETIME
- UNIQUE(userId, pollId, optionId)

## API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione nuovo utente
- `POST /api/auth/login` - Login

### Sondaggi
- `GET /api/polls` - Lista tutti i sondaggi (richiede auth)
- `GET /api/polls/:id` - Dettaglio sondaggio con voti (richiede auth)
- `POST /api/polls` - Crea nuovo sondaggio (solo ADMIN)
- `PUT /api/polls/:id/close` - Chiudi sondaggio (solo ADMIN)

### Voti
- `POST /api/votes` - Vota o modifica voto (richiede auth)
- `GET /api/votes/:pollId/my-votes` - Ottieni i propri voti per un sondaggio (richiede auth)

## Funzionalità Principali

### Per VOTER
1. Registrati/Accedi
2. Visualizza i sondaggi aperti e chiusi
3. Vota selezionando multiple opzioni
4. Modifica il tuo voto (i timestamp delle opzioni invariate non cambiano)
5. Vedi i voti pubblici di tutti con timestamp

### Per ADMIN
Tutte le funzionalità di VOTER, più:
1. Crea nuovi sondaggi con titolo, descrizione e opzioni
2. Chiudi sondaggi quando necessario

## Primo Accesso

Al primo avvio, registra un utente. Tutti gli utenti sono VOTER di default.

### Creare un utente ADMIN

Usa lo script dedicato dal terminale:

```bash
cd server
npm run create-admin <email> <password> <firstName> <lastName>
```

**Esempio:**
```bash
npm run create-admin admin@example.com mypassword Mario Rossi
```

Alternativamente, modifica manualmente il database:
```bash
cd server
sqlite3 database.sqlite
UPDATE users SET role = 'ADMIN' WHERE email = 'tua-email@example.com';
.quit
```

## Note

- Il database SQLite viene creato automaticamente al primo avvio in `server/database.sqlite`
- I voti sono pubblici: tutti possono vedere chi ha votato cosa
- I timestamp garantiscono l'ordine delle prenotazioni (first-come-first-served)
- Quando modifichi un voto, solo le nuove selezioni ottengono un nuovo timestamp
- Il token JWT ha validità di 7 giorni

## Build per Produzione

### Client
```bash
cd client
npm run build
```
Il frontend compilato sarà disponibile in `client/dist/`.

### Server
```bash
cd server
npm run build
```
Il backend compilato sarà disponibile in `server/dist/`.

Per il backend in produzione, considera l'uso di PM2 o Docker per gestire il processo Node.js.
