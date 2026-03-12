class KPI {
    constructor({ faturamento = 0, campanhas = 0, vendas_hoje = 0, ticket_medio = 0, delta_faturamento = '', delta_campanhas = '', delta_vendas_hoje = '', delta_ticket_medio = '' } = {}) {
        this.faturamento = faturamento;
        this.campanhas = campanhas;
        this.vendasHoje = vendas_hoje;
        this.ticketMedio = ticket_medio;
        this.deltaFaturamento = delta_faturamento;
        this.deltaCampanhas = delta_campanhas;
        this.deltaVendasHoje = delta_vendas_hoje;
        this.deltaTicketMedio = delta_ticket_medio;
    }

    toJSON() {
        return {
            faturamento: this.faturamento,
            campanhas: this.campanhas,
            vendasHoje: this.vendasHoje,
            ticketMedio: this.ticketMedio,
            deltaFaturamento: this.deltaFaturamento,
            deltaCampanhas: this.deltaCampanhas,
            deltaVendasHoje: this.deltaVendasHoje,
            deltaTicketMedio: this.deltaTicketMedio,
        };
    }
}

module.exports = KPI;
