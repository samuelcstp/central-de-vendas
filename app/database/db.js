const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Ensure database directory exists
const dbDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'data.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Initialize tables
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT NOT NULL,
            campanha TEXT NOT NULL,
            valor REAL NOT NULL,
            canal TEXT NOT NULL,
            emoji TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS kpis (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            faturamento REAL DEFAULT 0,
            campanhas INTEGER DEFAULT 0,
            impressoes INTEGER DEFAULT 0,
            conversoes INTEGER DEFAULT 0,
            delta_faturamento TEXT DEFAULT '',
            delta_campanhas TEXT DEFAULT '',
            delta_impressoes TEXT DEFAULT '',
            delta_conversoes TEXT DEFAULT ''
        )
    `, (err) => {
        if (!err) {
            // Seed KPI se não existir
            db.get(`SELECT id FROM kpis WHERE id = 1`, (err, row) => {
                if (!row) {
                    db.run(`INSERT INTO kpis (id) VALUES (1)`);
                }
            });
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS dados_por_hora (
            hora TEXT PRIMARY KEY,
            valor REAL DEFAULT 0
        )
    `);
});

module.exports = db;
