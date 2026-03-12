const { OPEN } = require('ws');
const vendaController = require('../controllers/vendaController');
const kpiController = require('../controllers/kpiController');
const Notificador = require('./Notificador');

class WsHandler {
    constructor(wss) {
        this.wss = wss;
    }

    async registrar(ws) {
        try {
            const kpis = await kpiController.getKPIs();
            const porHora = await vendaController.getPorHora();
            const topClientes = await vendaController.getTopClientes();
            const vendas = await vendaController.getRecentes(10);

            this.enviarPara(ws, {
                type: 'init',
                kpis,
                porHora,
                topClientes,
                vendas,
            });
        } catch (err) {
            console.error('Erro ao buscar dados iniciais:', err);
        }

        this.broadcast({ type: 'usuarios', count: this.wss.clients.size });

        ws.on('message', async (raw) => {
            let msg;
            try { msg = JSON.parse(raw); }
            catch { return; }

            if (msg.type === 'venda') {
                try {
                    const venda = await vendaController.registrar(msg.venda);
                    Notificador.log('Nova venda registrada do cliente: ' + venda.cliente);

                    const kpisAtualizados = await kpiController.getKPIs();
                    const topClientesAtualizados = await vendaController.getTopClientes();
                    const porHoraAtualizado = await vendaController.getPorHora();

                    this.broadcast({
                        type: 'venda',
                        venda: venda.toJSON(),
                        kpis: kpisAtualizados,
                        topClientes: topClientesAtualizados,
                        porHora: porHoraAtualizado,
                    });
                } catch (err) {
                    console.error('Erro ao processar nova venda:', err);
                }
            }
        });

        ws.on('close', () => {
            this.broadcast({ type: 'usuarios', count: this.wss.clients.size });
        });
    }

    broadcast(payload) {
        const data = JSON.stringify(payload);
        this.wss.clients.forEach(cliente => {
            if (cliente.readyState === OPEN) cliente.send(data);
        });
    }

    enviarPara(ws, payload) {
        if (ws.readyState === OPEN) ws.send(JSON.stringify(payload));
    }
}

module.exports = WsHandler;
