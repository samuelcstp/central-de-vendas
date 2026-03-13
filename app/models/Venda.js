class Venda {
    constructor({ vendedor_id, cliente, campanha, valor, canal, vendedor_nome }) {
        this.vendedor_id = vendedor_id;
        this.cliente = cliente;
        this.campanha = campanha;
        this.valor = Number(valor);
        this.canal = canal;
        this.vendedor_nome = vendedor_nome;
    }

    toJSON() {
        return {
            vendedor_id: this.vendedor_id,
            vendedor_nome: this.vendedor_nome,
            cliente: this.cliente,
            campanha: this.campanha,
            valor: this.valor,
            canal: this.canal
        };
    }
}

module.exports = Venda;
