const VendedorRepository = require('../repositories/vendedorRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_central_vendas_123';

const authController = {
    async register(req, res) {
        const { nome, email, senha } = req.body;
        try {
            if (!nome || !email || !senha) {
                return res.status(400).json({ error: 'Preencha todos os campos.' });
            }

            const vendedorExistente = await VendedorRepository.buscarPorEmail(email);
            if (vendedorExistente) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            const vendedor = await VendedorRepository.criar(nome, email, senha);

            const token = jwt.sign({ id: vendedor.id, email: vendedor.email, nome: vendedor.nome }, JWT_SECRET, { expiresIn: '30m' });

            res.status(201).json({ token, vendedor });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao registrar vendedor' });
        }
    },

    async login(req, res) {
        const { email, senha } = req.body;
        try {

            const vendedor = await VendedorRepository.buscarPorEmail(email);
            if (!vendedor) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const isMatch = await bcrypt.compare(senha, vendedor.senha);
            if (!isMatch) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const token = jwt.sign({ id: vendedor.id, email: vendedor.email, nome: vendedor.nome }, JWT_SECRET, { expiresIn: '30m' });

            res.json({ token, vendedor: { id: vendedor.id, nome: vendedor.nome, email: vendedor.email } });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao fazer login' });
        }
    }
};

module.exports = authController;
