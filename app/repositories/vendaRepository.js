const db = require('../database/db');

class VendaRepository {
    static async salvar(venda) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO vendas (vendedor_id, cliente, campanha, valor, canal) VALUES (?, ?, ?, ?, ?)`;
            db.run(sql, [venda.vendedor_id, venda.cliente, venda.campanha, venda.valor, venda.canal], function (err) {
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
            db.all(`
                SELECT 
                    v.cliente as nome, 
                    SUM(v.valor) as valor, 
                    MAX(vd.nome) as vendedor_nome 
                FROM vendas v 
                LEFT JOIN vendedores vd ON v.vendedor_id = vd.id 
                GROUP BY v.cliente 
                ORDER BY valor DESC 
                LIMIT ?
            `, [top], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = VendaRepository;
