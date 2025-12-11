const express = require('express');
const router = express.Router();
const itemCtrl = require('../controllers/pedido_itemController');

// LISTAR ITENS DE UM PEDIDO
router.get('/:idpedido', itemCtrl.listarItensPorPedido);

// CRIAR ITEM
router.post('/', itemCtrl.criarItem);

// ATUALIZAR ITEM
router.put('/:idpedido/:iditem', itemCtrl.atualizarItem);

// DELETAR ITEM
router.delete('/:idpedido/:iditem', itemCtrl.deletarItem);

module.exports = router;
