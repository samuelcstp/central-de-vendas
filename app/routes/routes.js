const express = require('express');
const path = require('path');
const authRoutes = require('./authRoutes');
const vendaRoutes = require('./vendaRoutes');

const router = express.Router();

router.use(express.json());

router.use('/api/auth', authRoutes);
router.use('/api/vendas', vendaRoutes);

router.use(express.static(path.join(__dirname, '../../view')));

module.exports = router;
