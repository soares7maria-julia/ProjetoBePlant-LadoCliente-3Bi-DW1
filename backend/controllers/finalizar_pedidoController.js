const { query } = require("../database");

exports.listarCarrinhoParaFinalizar = async (req, res) => {
  const { idpessoa } = req.params;

  try {
    const result = await query(`
      SELECT 
        ci.idcarrinho,
        ci.quantidade,
        i.iditem,
        i.nomeitem,
        i.valorunitario,
        i.imagemitem
      FROM carrinho_item ci
      JOIN item i ON ci.iditem = i.iditem
      WHERE ci.idpessoa = $1
      ORDER BY ci.idcarrinho
    `, [idpessoa]);

    res.json(result.rows);

  } catch (err) {
    console.error("Erro ao carregar carrinho para finalizar:", err);
    res.status(500).json({ erro: "Erro ao carregar carrinho." });
  }
};
