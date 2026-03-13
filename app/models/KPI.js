class KPI {
    constructor({ faturamento = 0, vendas_hoje = 0, ticket_medio = 0, delta_faturamento = '', delta_vendas_hoje = '', delta_ticket_medio = '' } = {}) {
        this.faturamento = faturamento;
        this.vendasHoje = vendas_hoje;
        this.ticketMedio = ticket_medio;
        this.deltaFaturamento = delta_faturamento;
        this.deltaVendasHoje = delta_vendas_hoje;
        this.deltaTicketMedio = delta_ticket_medio;
    }

    toJSON() {
        return {
            faturamento: this.faturamento,
            vendasHoje: this.vendasHoje,
            ticketMedio: this.ticketMedio,
            deltaFaturamento: this.deltaFaturamento,
            deltaVendasHoje: this.deltaVendasHoje,
            deltaTicketMedio: this.deltaTicketMedio,
        };
    }
}

module.exports = KPI;
