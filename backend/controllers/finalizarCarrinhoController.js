const { query } = require("../database");

exports.finalizarCarrinho = async (req, res) => {
  try {
    const { idpessoa } = req.params;

    // 1. Buscar itens do carrinho
    const itens = await query(
      `SELECT c.iditem, c.quantidade, i.valorunitario
       FROM carrinho_item c
       JOIN item i ON c.iditem = i.iditem
       WHERE c.idpessoa = $1`,
      [idpessoa]
    );

    if (itens.rows.length === 0) {
      return res.status(400).json({ erro: "Carrinho vazio." });
    }

    // 2. Calcular total
    let total = 0;
    itens.rows.forEach(i => {
      total += Number(i.valorunitario) * Number(i.quantidade);
    });

    // 3. Criar pedido
    const pedido = await query(
      `INSERT INTO pedido (datapedido, idpessoa, valortotal)
       VALUES (NOW(), $1, $2)
       RETURNING idpedido`,
      [idpessoa, total]
    );

    const idpedido = pedido.rows[0].idpedido;

    // 4. Inserir itens do pedido
    for (const item of itens.rows) {
      await query(
        `INSERT INTO pedido_item (idpedido, iditem, quantidade, valorunitario)
         VALUES ($1, $2, $3, $4)`,
        [
          idpedido,
          item.iditem,
          item.quantidade,
          item.valorunitario
        ]
      );
    }

    res.json({ sucesso: true, idpedido, total });

  } catch (err) {
    console.error("Erro ao finalizar carrinho:", err);
    res.status(500).json({ erro: "Erro ao finalizar carrinho." });
  }
};
