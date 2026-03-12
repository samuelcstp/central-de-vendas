class DadosPorHora {
    constructor({ hora, valor }) {
        this.hora = hora;
        this.valor = valor;
    }

    toJSON() {
        return {
            hora: this.hora,
            valor: this.valor
        };
    }
}

module.exports = DadosPorHora;
