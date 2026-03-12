const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret_central_vendas_123';

function authMiddleware(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.vendedor = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Token inválido.' });
    }
}

module.exports = authMiddleware;
