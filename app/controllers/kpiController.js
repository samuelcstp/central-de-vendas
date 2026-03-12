const KPIRepository = require('../repositories/kpiRepository');
const KPI = require('../models/KPI');

async function onNovaVenda(venda) {
    // Faturamento = venda.valor
    // Campanhas = 0 (por enquanto não tem regra complexa de campanhas, vamos manter)
    // Vendas hoje = 1
    await KPIRepository.update(venda.valor, 0, 1);
}

async function getKPIs() {
    const kpiData = await KPIRepository.get();
    const kpi = new KPI(kpiData);
    return kpi.toJSON();
}

async function setKPIs(dados) {
    // Para manter compatibilidade
}

module.exports = { getKPIs, setKPIs, onNovaVenda };
