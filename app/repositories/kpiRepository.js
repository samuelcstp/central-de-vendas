const db = require('../database/db');

class KPIRepository {
    static async get() {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM kpis WHERE id = 1`, (err, row) => {
                if (err) reject(err);
                else resolve(row || {});
            });
        });
    }

    static async update(faturamento = 0, vendas_hoje = 0) {
        return new Promise((resolve, reject) => {
            db.run(`
                UPDATE kpis 
                SET faturamento = faturamento + ?, 
                    vendas_hoje = vendas_hoje + ? 
                WHERE id = 1
            `, [faturamento, vendas_hoje], function (err) {
                if (err) reject(err);
                else {
                    db.run(`UPDATE kpis SET ticket_medio = CASE WHEN vendas_hoje > 0 THEN faturamento / vendas_hoje ELSE 0 END WHERE id = 1`, [], (err2) => {
                        if (err2) reject(err2);
                        else resolve();
                    });
                }
            });
        });
    }
}

module.exports = KPIRepository;
