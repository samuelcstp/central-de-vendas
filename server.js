const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const router = require('./app/routes/routes');
const WsHandler = require('./app/utils/wsHandler');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(router);

const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });
const wsHandler = new WsHandler(wss);

wss.on('connection', (ws) => {
    console.log(`[WS] Cliente conectado. Total: ${wss.clients.size}`);
    wsHandler.registrar(ws);
});

httpServer.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
