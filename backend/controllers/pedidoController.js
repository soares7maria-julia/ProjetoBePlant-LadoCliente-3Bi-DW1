const { query } = require("../database");

exports.criarPedido = async (req, res) => {
  console.log("🔥 criarPedido RECEBEU:", req.body);

  try {
    const { datapedido, idpessoa, valortotal, formapagamento } = req.body;

    const result = await query(
      `INSERT INTO pedido (datapedido, idpessoa, valortotal, formapagamento)
       VALUES ($1, $2, $3, $4)
       RETURNING idpedido`,
      [datapedido, idpessoa, valortotal, formapagamento]
    );

    res.json({ idpedido: result.rows[0].idpedido });

  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ erro: "Erro ao criar pedido." });
  }
};
