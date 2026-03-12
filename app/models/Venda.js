class Venda {
    constructor({ vendedor_id, cliente, campanha, valor, canal, emoji = '📢', vendedor_nome, criado_em }) {
        this.vendedor_id = vendedor_id;
        this.cliente = cliente;
        this.campanha = campanha;
        this.valor = Number(valor);
        this.canal = canal;
        this.emoji = emoji;
        // Use supplied date or calculate new one
        this.criadoEm = criado_em ? new Date(criado_em) : new Date();
        this.vendedor_nome = vendedor_nome; // Added via JOIN
    }

    toJSON() {
        return {
            vendedor_id: this.vendedor_id,
            vendedor_nome: this.vendedor_nome,
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
