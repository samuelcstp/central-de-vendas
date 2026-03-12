const db = require('../database/db');

class DadosPorHora {
    static async atualizar(hora, valor) {
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO dados_por_hora (hora, valor) VALUES (?, ?) ON CONFLICT(hora) DO UPDATE SET valor = valor + ?`,
                [hora, valor, valor], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
    }

    static async getTodos() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT hora, valor FROM dados_por_hora ORDER BY hora ASC`, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = DadosPorHora;
