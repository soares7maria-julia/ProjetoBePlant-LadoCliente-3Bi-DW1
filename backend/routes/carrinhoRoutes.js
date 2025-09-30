const express = require("express");
const router = express.Router();
const carrinhoController = require("../controllers/carrinhoController");

// Rotas do carrinho
router.get("/:idpessoa", carrinhoController.listarCarrinho);
router.post("/", carrinhoController.adicionarItem);
router.put("/:idcarrinho", carrinhoController.atualizarQuantidade);
router.delete("/:idcarrinho", carrinhoController.removerItem);
router.delete("/pessoa/:idpessoa", carrinhoController.limparCarrinho);

module.exports = router;
