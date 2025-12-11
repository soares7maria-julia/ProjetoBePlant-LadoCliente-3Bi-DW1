// ===============================
// CONTROLLER pedido_item – BePlant
// ===============================

const { query } = require('../database');

// -----------------------------------------
// LISTAR ITENS DE UM PEDIDO
// -----------------------------------------
exports.listarItensPorPedido = async (req, res) => {
  const { idpedido } = req.params;

  try {
    const sql = `
      SELECT 
        pitem.idpedido,
        pitem.iditem,
        i.nomeitem,
        pitem.quantidade,
        pitem.valorunitario
      FROM pedido_item pitem
      JOIN item i ON i.iditem = pitem.iditem
      WHERE pitem.idpedido = $1
      ORDER BY pitem.iditem
    `;

    const result = await query(sql, [idpedido]);
    res.json(result.rows);

  } catch (err) {
    console.error("Erro ao listar itens:", err);
    res.status(500).json({ error: "Erro ao listar itens do pedido" });
  }
};

// -----------------------------------------
// CRIAR UM ITEM NO PEDIDO
// -----------------------------------------
exports.criarItem = async (req, res) => {
  try {
    const { idpedido, iditem, quantidade, valorunitario } = req.body;

    const sql = `
      INSERT INTO pedido_item (idpedido, iditem, quantidade, valorunitario)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await query(sql, [
      idpedido,
      iditem,
      quantidade,
      valorunitario
    ]);

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("Erro ao criar item:", err);
    res.status(500).json({ error: "Erro ao criar item no pedido" });
  }
};

// -----------------------------------------
// ATUALIZAR UM ITEM ESPECÍFICO
// -----------------------------------------
exports.atualizarItem = async (req, res) => {
  try {
    const { idpedido, iditem } = req.params;
    const { quantidade, valorunitario } = req.body;

    const sql = `
      UPDATE pedido_item
      SET quantidade = $1, valorunitario = $2
      WHERE idpedido = $3 AND iditem = $4
      RETURNING *
    `;

    const result = await query(sql, [
      quantidade,
      valorunitario,
      idpedido,
      iditem
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Erro ao atualizar item:", err);
    res.status(500).json({ error: "Erro ao atualizar item" });
  }
};

// -----------------------------------------
// DELETAR ITEM ESPECÍFICO DE UM PEDIDO
// -----------------------------------------
exports.deletarItem = async (req, res) => {
  try {
    const { idpedido, iditem } = req.params;

    const sql = `
      DELETE FROM pedido_item
      WHERE idpedido = $1 AND iditem = $2
      RETURNING *
    `;

    const result = await query(sql, [idpedido, iditem]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    res.json({ message: "Item removido com sucesso." });

  } catch (err) {
    console.error("Erro ao excluir item:", err);
    res.status(500).json({ error: "Erro ao excluir item do pedido" });
  }
};
