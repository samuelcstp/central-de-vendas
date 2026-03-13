const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
    try {
        const dados = { ...req.body, vendedor_id: req.vendedor.id, vendedor_nome: req.vendedor.nome };
        const venda = await vendaController.registrar(dados);

        // Após salvar a venda via HTTP, dispara broadcast para TODOS os clientes WS conectados.
        if (req.app.locals.wsHandler) {
            req.app.locals.wsHandler.emitirNovaVenda(venda);
        }

        res.status(201).json(venda);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao registrar venda.' });
    }
});

module.exports = router;
