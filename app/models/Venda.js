const db = require('../database/db');

class Venda {
    constructor({ cliente, campanha, valor, canal, emoji = '📢' }) {
        this.cliente = cliente;
        this.campanha = campanha;
        this.valor = Number(valor);
        this.canal = canal;
        this.emoji = emoji;
        this.criadoEm = new Date();
    }

    static async salvar(venda) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO vendas (cliente, campanha, valor, canal, emoji, criado_em) VALUES (?, ?, ?, ?, ?, ?)`;
            db.run(sql, [venda.cliente, venda.campanha, venda.valor, venda.canal, venda.emoji, venda.criadoEm.toISOString()], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    static async getRecentes(n = 10) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM vendas ORDER BY criado_em DESC LIMIT ?`, [n], (err, rows) => {
                if (err) reject(err);
                else {
                    const vendas = rows.map(r => new Venda(r));
                    resolve(vendas.map(v => v.toJSON()));
                }
            });
        });
    }

    static async getTopClientes(top = 5) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT cliente as nome, SUM(valor) as valor FROM vendas GROUP BY cliente ORDER BY valor DESC LIMIT ?`, [top], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    toJSON() {
        return {
            cliente: this.cliente,
            campanha: this.campanha,
            valor: this.valor,
            canal: this.canal,
            emoji: this.emoji,
            criadoEm: this.criadoEm
        };
    }
}

module.exports = Venda;
