const { query } = require("../database");

exports.criarPedidoItem = async (req, res) => {
  try {
    const { idpedido, iditem, quantidade, valorunitario } = req.body;

    await query(
      `INSERT INTO pedido_item (idpedido, iditem, quantidade, valorunitario)
       VALUES ($1, $2, $3, $4)`,
      [idpedido, iditem, quantidade, valorunitario]
    );

    res.json({ mensagem: "Item adicionado ao pedido!" });

  } catch (error) {
    console.error("Erro ao criar item do pedido:", error);
    res.status(500).json({ erro: "Erro ao adicionar item ao pedido." });
  }
};
