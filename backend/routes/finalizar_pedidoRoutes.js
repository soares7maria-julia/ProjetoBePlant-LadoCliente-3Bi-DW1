const express = require("express");
const router = express.Router();

// Carrega o controller PRIMEIRO
const controller = require("../controllers/finalizar_pedidoController");

// Depois disso você pode logar:
console.log("Carregando controller FINALIZAR:", controller);

// Rota teste
router.get("/:idpessoa", controller.listarCarrinhoParaFinalizar);

module.exports = router;
