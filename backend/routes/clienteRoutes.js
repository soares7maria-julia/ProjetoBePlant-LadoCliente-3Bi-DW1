const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// CRUD de Cliente
router.get('/', clienteController.listarCliente);      // GET all
router.post('/', clienteController.criarCliente);      // POST new
router.get('/:id', clienteController.obterCliente);    // GET by ID
router.put('/:id', clienteController.atualizarCliente);// PUT update
router.delete('/:id', clienteController.deletarCliente);// DELETE

module.exports = router;
