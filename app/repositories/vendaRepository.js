const db = require('../database/db');

class VendaRepository {
    static async salvar(venda) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO vendas (vendedor_id, cliente, campanha, valor, canal, emoji, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.run(sql, [venda.vendedor_id, venda.cliente, venda.campanha, venda.valor, venda.canal, venda.emoji, venda.criadoEm.toISOString()], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    static async getRecentes(n = 10) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT vendas.*, vendedores.nome as vendedor_nome FROM vendas LEFT JOIN vendedores ON vendas.vendedor_id = vendedores.id ORDER BY vendas.criado_em DESC LIMIT ?`, [n], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
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
}

module.exports = VendaRepository;
