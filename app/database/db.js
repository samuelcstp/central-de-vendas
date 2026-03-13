const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// verfica se o diretório do database existe
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
    // Tabela de Vendedores
    db.run(`
        CREATE TABLE IF NOT EXISTS vendedores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela de Vendas
    db.run(`
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendedor_id INTEGER,
            cliente TEXT NOT NULL,
            campanha TEXT NOT NULL,
            valor REAL NOT NULL,
            canal TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vendedor_id) REFERENCES vendedores(id)
        )
    `);

    // Tabela de KPIs
    db.run(`
        CREATE TABLE IF NOT EXISTS kpis (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            faturamento REAL DEFAULT 0,
            vendas_hoje INTEGER DEFAULT 0,
            ticket_medio REAL DEFAULT 0,
            delta_faturamento TEXT DEFAULT '',
            delta_vendas_hoje TEXT DEFAULT '',
            delta_ticket_medio TEXT DEFAULT ''
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
