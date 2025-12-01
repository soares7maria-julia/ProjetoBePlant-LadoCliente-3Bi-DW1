const express = require("express");
const router = express.Router();
const controller = require("../controllers/pedido_itemController");

// Criar item do pedido
router.post("/", controller.criarPedidoItem);

module.exports = router;
