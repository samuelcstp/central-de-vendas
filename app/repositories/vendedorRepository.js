const db = require('../database/db');
const bcrypt = require('bcryptjs');

class VendedorRepository {
    static async criar(nome, email, senhaPlain) {
        return new Promise(async (resolve, reject) => {
            try {
                const salt = await bcrypt.genSalt(10);
                const senhaHash = await bcrypt.hash(senhaPlain, salt);

                const sql = `INSERT INTO vendedores (nome, email, senha) VALUES (?, ?, ?)`;
                db.run(sql, [nome, email, senhaHash], function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, nome, email });
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    static async buscarPorEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM vendedores WHERE email = ?`, [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async buscarPorId(id) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT id, nome, email FROM vendedores WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
}

module.exports = VendedorRepository;
