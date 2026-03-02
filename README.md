# N250 Booking

Sistema di prenotazione basato su sondaggi per la gestione delle presenze settimanali in ufficio (Torino N250).

## Funzionalità

- **Autenticazione**: Login e registrazione utenti
- **Sondaggi Attivi**: Visualizzazione dei sondaggi aperti con possibilità di votare
- **Gestione Capacità**: Ogni opzione ha un numero limitato di posti disponibili
- **Risultati in Tempo Reale**: Visualizzazione immediata dei voti e della disponibilità
- **Dashboard Admin**: Creazione e chiusura sondaggi (solo amministratori)
- **Archivio**: Sondaggi passati organizzati per mese

## Stack Tecnologico

### Frontend
- React 19 + TypeScript
- Tailwind CSS 4
- React Router

### Backend
- Node.js + Express
- SQLite
- JWT per autenticazione

## Struttura

```
├── client/          # Applicazione frontend React
├── server/          # API backend Express
└── docker-compose.yml   # Setup containerizzato
```

## Avvio Rapido

Con Docker:
```bash
docker-compose up
```

Manuale:
```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm run dev
```

## Credenziali Admin

Per creare un utente amministratore, utilizzare lo script:
```bash
cd server
npm run create-admin
```

