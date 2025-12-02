const express = require("express");
const router = express.Router();
const controller = require("../controllers/finalizarCarrinhoController");

router.post("/:idpessoa", controller.finalizarCarrinho);

module.exports = router;
