class Vendedor {
    constructor({ id, nome, email, criado_em, senha }) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.criado_em = criado_em;
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            email: this.email,
            criado_em: this.criado_em,
        };
    }
}

module.exports = Vendedor;
