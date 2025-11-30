// controllers/finalizar_pedidoController.js
const { query } = require("../database");

exports.listarCarrinhoParaFinalizar = async (req, res) => {
  const { idpessoa } = req.params;

  try {
    const result = await query(`
      SELECT c.idcarrinho, c.quantidade, i.iditem, i.nome, i.preco, i.imagem
      FROM carrinho c
      JOIN item i ON c.iditem = i.iditem
      WHERE c.idpessoa = $1
      ORDER BY c.idcarrinho
    `, [idpessoa]);

    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao carregar carrinho para finalizar:", err);
    res.status(500).json({ erro: "Erro ao carregar carrinho." });
  }
};
