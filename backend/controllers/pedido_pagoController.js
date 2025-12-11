const db = require('../database');

// ===============================
// REGISTRAR PAGAMENTO (PIX)
// ===============================
exports.registrarPagamento = async (req, res) => {
  try {
    const { idpedido, idpessoa, valortotal, formapagamento } = req.body;

    // Validação
    if (!idpedido || !idpessoa || !valortotal || !formapagamento) {
      return res.status(400).json({ erro: 'Dados incompletos para registrar pagamento.' });
    }

    // Inserção no banco
    const query = `
      INSERT INTO pedido_pago (idpedido, idpessoa, datapagamento, valortotal, formapagamento)
      VALUES ($1, $2, NOW(), $3, $4);
    `;

    const valores = [
      idpedido,
      idpessoa,
      valortotal,
      formapagamento
    ];

    await db.query(query, valores);

    res.json({
      mensagem: "Pagamento registrado com sucesso!",
      idpedido,
      idpessoa,
      totalPago: valortotal
    });

  } catch (err) {
    console.error("Erro ao registrar pagamento:", err);

    // Caso tente pagar duas vezes o mesmo pedido (PK duplicada)
    if (err.code === '23505') {
      return res.status(400).json({ erro: "Este pedido já possui pagamento registrado." });
    }

    res.status(500).json({ erro: "Erro interno ao registrar pagamento." });
  }
};
