const express = require('express');
const router = express.Router();
const pedidoPagoController = require('../controllers/pedido_pagoController');

router.post('/', pedidoPagoController.registrarPagamento);

module.exports = router;
