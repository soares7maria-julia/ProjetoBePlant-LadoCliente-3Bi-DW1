const express = require("express");
const router = express.Router();
const controller = require("../controllers/pedidoController");

// === CREATE ===
router.post("/", controller.criarPedido);

// === READ ===
router.get("/", controller.listarPedidos);                    // lista todos

router.get("/pessoa/:idpessoa", controller.pedidosPorPessoa); // lista por pessoa

router.get("/:idpedido", controller.buscarPedidoPorId);       // busca por ID (sempre por último)

// === UPDATE ===
router.put("/:idpedido", controller.atualizarPedido);

// === DELETE ===
router.delete("/:idpedido", controller.deletarPedido);

module.exports = router;
