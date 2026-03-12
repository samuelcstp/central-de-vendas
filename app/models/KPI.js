const db = require('../database/db');

class KPI {
    constructor({ faturamento = 0, campanhas = 0, impressoes = 0, conversoes = 0, delta_faturamento = '', delta_campanhas = '', delta_impressoes = '', delta_conversoes = '' } = {}) {
        this.faturamento = faturamento;
        this.campanhas = campanhas;
        this.impressoes = impressoes;
        this.conversoes = conversoes;
        this.deltaFaturamento = delta_faturamento;
        this.deltaCampanhas = delta_campanhas;
        this.deltaImpressoes = delta_impressoes;
        this.deltaConversoes = delta_conversoes;
    }

    static async get() {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM kpis WHERE id = 1`, (err, row) => {
                if (err) reject(err);
                else resolve(new KPI(row || {}));
            });
        });
    }

    static async update(faturamento = 0, campanhas = 0, impressoes = 0, conversoes = 0) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE kpis SET faturamento = faturamento + ?, campanhas = campanhas + ?, impressoes = impressoes + ?, conversoes = conversoes + ? WHERE id = 1`,
                [faturamento, campanhas, impressoes, conversoes], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
    }

    toJSON() {
        return {
            faturamento: this.faturamento,
            campanhas: this.campanhas,
            impressoes: this.impressoes,
            conversoes: this.conversoes,
            deltaFaturamento: this.deltaFaturamento,
            deltaCampanhas: this.deltaCampanhas,
            deltaImpressoes: this.deltaImpressoes,
            deltaConversoes: this.deltaConversoes,
        };
    }
}

module.exports = KPI;
