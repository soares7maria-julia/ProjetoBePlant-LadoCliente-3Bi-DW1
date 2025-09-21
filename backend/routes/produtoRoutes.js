const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

// Rotas de CRUD para produtos
router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.obterProduto);
router.post('/', produtoController.criarProduto);
router.put('/:id', produtoController.atualizarProduto);
router.delete('/:id', produtoController.deletarProduto);

module.exports = router;
