const Venda = require('../models/Venda');
const DadosPorHora = require('../models/DadosPorHora');
const kpiController = require('./kpiController');

async function registrar(dados) {
    const venda = new Venda(dados);
    await Venda.salvar(venda);

    await kpiController.onNovaVenda(venda);

    const hora = `${venda.criadoEm.getHours().toString().padStart(2, '0')}h`;
    await DadosPorHora.atualizar(hora, venda.valor);

    return venda;
}

async function getRecentes(n = 10) {
    return await Venda.getRecentes(n);
}

async function getTopClientes(top = 5) {
    return await Venda.getTopClientes(top);
}

async function getPorHora() {
    return await DadosPorHora.getTodos();
}

module.exports = { registrar, getRecentes, getTopClientes, getPorHora };
