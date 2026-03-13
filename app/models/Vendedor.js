class Vendedor {
    constructor({ id, nome, email, senha }) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            email: this.email,
        };
    }
}

module.exports = Vendedor;
