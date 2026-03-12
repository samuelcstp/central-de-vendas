const KPI = require('../models/KPI');

async function onNovaVenda(venda) {
    const impressoes = Math.floor(Math.random() * 500 + 100);
    await KPI.update(venda.valor, 0, impressoes, 1);
}

async function getKPIs() {
    const kpi = await KPI.get();
    return kpi.toJSON();
}

async function setKPIs(dados) {
    // Para manter compatibilidade da assinatura da função
}

module.exports = { getKPIs, setKPIs, onNovaVenda };
