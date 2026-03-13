const { OPEN } = require('ws');
const jwt = require('jsonwebtoken');
const vendaController = require('../controllers/vendaController');
const kpiController = require('../controllers/kpiController');
const Notificador = require('./Notificador');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_central_vendas_123';

class WsHandler {
    constructor(wss) {
        this.wss = wss;
        this.usuariosAtivos = new Map(); // ws -> vendedor_id autenticado
    }

    async registrar(ws) {
        // Ao conectar, envia um snapshot inicial só para esse cliente.
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

        this.broadcastCountUsuarios();

        ws.on('message', async (raw) => {
            let msg;
            try { msg = JSON.parse(raw); }
            catch { return; }

            if (msg.type === 'auth') {
                try {
                    // Cliente envia o token via WS para identificar o vendedor.
                    const decoded = jwt.verify(msg.token, JWT_SECRET);
                    this.usuariosAtivos.set(ws, decoded.id);
                    this.broadcastCountUsuarios();
                } catch (err) {
                    // Token inválido, ignorar ou fechar
                    console.error('WS auth error:', err.message);
                }
            } else if (msg.type === 'venda') {
                try {
                    // Venda recebida pelo WS: registra e dispara broadcast para todos.
                    const venda = await vendaController.registrar(msg.venda);
                    await this.emitirNovaVenda(venda);
                } catch (err) {
                    console.error('Erro ao processar nova venda via WS:', err);
                }
            }
        });

        ws.on('close', () => {
            this.usuariosAtivos.delete(ws);
            this.broadcastCountUsuarios();
        });
    }

    broadcastCountUsuarios() {
        const uniqueIds = new Set(this.usuariosAtivos.values());
        // Broadcast do total de usuários online para todos os clientes conectados.
        this.broadcast({ type: 'usuarios', count: uniqueIds.size });
    }

    async emitirNovaVenda(venda) {
        Notificador.log('Nova venda registrada do cliente: ' + venda.cliente);

        const kpisAtualizados = await kpiController.getKPIs();
        const topClientesAtualizados = await vendaController.getTopClientes();
        const porHoraAtualizado = await vendaController.getPorHora();

        // Broadcast do evento de venda e KPIs atualizados para TODOS os clientes WS.
        this.broadcast({
            type: 'venda',
            venda: typeof venda.toJSON === 'function' ? venda.toJSON() : venda,
            kpis: kpisAtualizados,
            topClientes: topClientesAtualizados,
            porHora: porHoraAtualizado,
        });
    }

    broadcast(payload) {
        const data = JSON.stringify(payload);
        // Envia para todos os sockets abertos (broadcast real).
        this.wss.clients.forEach(cliente => {
            if (cliente.readyState === OPEN) cliente.send(data);
        });
    }

    enviarPara(ws, payload) {
        // Envio direcionado (apenas um cliente).
        if (ws.readyState === OPEN) ws.send(JSON.stringify(payload));
    }
}

module.exports = WsHandler;
