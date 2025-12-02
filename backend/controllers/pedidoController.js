const { query } = require("../database");

// ======================================
// CREATE — Criar pedido
// ======================================
exports.criarPedido = async (req, res) => {
  try {
    const { datapedido, idpessoa, valortotal } = req.body;

    const result = await query(
      `INSERT INTO pedido (datapedido, idpessoa, valortotal)
       VALUES ($1, $2, $3)
       RETURNING idpedido`,
      [datapedido, idpessoa, valortotal]
    );

    res.json({ idpedido: result.rows[0].idpedido });

  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ erro: "Erro ao criar pedido." });
  }
};

// ======================================
// READ — Listar todos pedidos
// ======================================
exports.listarPedidos = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM pedido ORDER BY idpedido DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    res.status(500).json({ erro: "Erro ao listar pedidos." });
  }
};

// ======================================
// READ — Buscar por ID
// ======================================
exports.buscarPedidoPorId = async (req, res) => {
  try {
    const { idpedido } = req.params;

    const result = await query(
      `SELECT * FROM pedido WHERE idpedido = $1`,
      [idpedido]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ erro: "Erro ao buscar pedido." });
  }
};

// ======================================
// READ — Pedidos de uma pessoa
// ======================================
exports.pedidosPorPessoa = async (req, res) => {
  try {
    const { idpessoa } = req.params;

    const result = await query(
      `SELECT * FROM pedido WHERE idpessoa = $1 ORDER BY idpedido DESC`,
      [idpessoa]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Erro ao listar pedidos por pessoa:", error);
    res.status(500).json({ erro: "Erro ao listar pedidos por pessoa." });
  }
};

// ======================================
// UPDATE — Atualizar pedido
// ======================================
exports.atualizarPedido = async (req, res) => {
  try {
    const { idpedido } = req.params;
    const { datapedido, idpessoa, valortotal } = req.body;

    await query(
      `UPDATE pedido 
       SET datapedido = $1, idpessoa = $2, valortotal = $3
       WHERE idpedido = $4`,
      [datapedido, idpessoa, valortotal, idpedido]
    );

    res.json({ sucesso: true, mensagem: "Pedido atualizado com sucesso" });

  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    res.status(500).json({ erro: "Erro ao atualizar pedido." });
  }
};

// DELETE — Excluir pedido
exports.deletarPedido = async (req, res) => {
  try {
    const { idpedido } = req.params;

    // 1️⃣ Deletar itens do pedido primeiro
    await query(`DELETE FROM pedido_item WHERE idpedido = $1`, [idpedido]);

    // 2️⃣ Agora sim deletar o pedido
    await query(`DELETE FROM pedido WHERE idpedido = $1`, [idpedido]);

    res.json({ sucesso: true, mensagem: "Pedido e itens deletados com sucesso" });

  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    res.status(500).json({ erro: "Erro ao deletar pedido." });
  }
};
