const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');

// CRUD de Funcionário
router.get('/', funcionarioController.listarFuncionario);
router.post('/', funcionarioController.criarFuncionario);
router.get('/:id', funcionarioController.obterFuncionario);
router.put('/:id', funcionarioController.atualizarFuncionario);
router.delete('/:id', funcionarioController.deletarFuncionario);

module.exports = router;
