const VendaRepository = require('../repositories/vendaRepository');
const DadosPorHoraRepository = require('../repositories/dadosPorHoraRepository');
const Venda = require('../models/Venda');
const kpiController = require('./kpiController');
const VendedorRepository = require('../repositories/vendedorRepository');

const vendaController = {
    async registrar(dadosStrOuObj) {
        const dados = typeof dadosStrOuObj === 'string' ? JSON.parse(dadosStrOuObj) : dadosStrOuObj;

        if (dados.vendedor_id && !dados.vendedor_nome) {
            const vendedor = await VendedorRepository.buscarPorId(dados.vendedor_id);
            if (vendedor) dados.vendedor_nome = vendedor.nome;
        }

        const venda = new Venda(dados);

        await VendaRepository.salvar(venda);

        // Ajusta faturamento por hora
        const horaAtual = new Date().getHours() + "h";
        await DadosPorHoraRepository.atualizar(horaAtual, venda.valor);

        // Atualiza KPIs globais
        await kpiController.onNovaVenda(venda);

        return venda;
    },

    async getRecentes(n = 10) {
        const vendasData = await VendaRepository.getRecentes(n);
        return vendasData.map(v => new Venda(v).toJSON());
    },

    async getTopClientes(top = 5) {
        return await VendaRepository.getTopClientes(top);
    },

    async getPorHora() {
        return await DadosPorHoraRepository.getTodos();
    }
};

module.exports = vendaController;
