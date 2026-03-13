const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const router = require('./app/routes/routes');
const WsHandler = require('./app/utils/wsHandler');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(router);

const httpServer = http.createServer(app);
// Cria o servidor WebSocket acoplado ao mesmo HTTP server.
const wss = new WebSocketServer({ server: httpServer });
const wsHandler = new WsHandler(wss);
// Deixa o handler disponível para as rotas HTTP (ex.: após POST de venda).
app.locals.wsHandler = wsHandler;

wss.on('connection', (ws) => {
    console.log(`[WS] Cliente conectado. Total: ${wss.clients.size}`);
    // Registra o socket: envia snapshot inicial e configura listeners de mensagens.
    wsHandler.registrar(ws);
});

httpServer.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
