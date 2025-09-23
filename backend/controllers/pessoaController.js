const { query } = require('../database');

// ================== LISTAR TODAS ==================
exports.listarPessoas = async (req, res) => {
  try {
    const result = await query(`
      SELECT p.idpessoa,
             p.nomepessoa,
             p.emailpessoa,
             p.cpfpessoa,
             p.enderecopessoa,
             COALESCE(c.nomecargo, 'Cliente') AS cargo
      FROM pessoa p
      LEFT JOIN funcionario f ON f.idpessoa = p.idpessoa
      LEFT JOIN cargo c ON c.idcargo = f.fkcargo
      ORDER BY p.idpessoa
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao listar pessoas:", err);
    res.status(500).json({ erro: "Erro interno ao listar pessoas" });
  }
};

// ================== OBTER POR ID ==================
exports.obterPessoa = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT p.idpessoa,
             p.nomepessoa,
             p.emailpessoa,
             p.cpfpessoa,
             p.enderecopessoa,
             p.senhapessoa,
             COALESCE(c.nomecargo, 'Cliente') AS cargo,
             f.fkcargo
      FROM pessoa p
      LEFT JOIN funcionario f ON f.idpessoa = p.idpessoa
      LEFT JOIN cargo c ON c.idcargo = f.fkcargo
      WHERE p.idpessoa = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Pessoa não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao obter pessoa:", err);
    res.status(500).json({ erro: "Erro interno ao obter pessoa" });
  }
};


// ================== CRIAR ==================
exports.criarPessoa = async (req, res) => {
  try {
    const { cpfpessoa, nomepessoa, emailpessoa, senhapessoa, enderecopessoa } = req.body;

    if (!nomepessoa || !emailpessoa || !senhapessoa) {
      return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" });
    }

    const result = await query(
      `INSERT INTO pessoa (cpfpessoa, nomepessoa, emailpessoa, senhapessoa, enderecopessoa)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cpfpessoa || null, nomepessoa, emailpessoa, senhapessoa, enderecopessoa || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar pessoa:", err);
    res.status(500).json({ erro: "Erro interno ao criar pessoa" });
  }
};

// ================== ATUALIZAR ==================
exports.atualizarPessoa = async (req, res) => {
  try {
    const { id } = req.params;
    const { cpfpessoa, nomepessoa, emailpessoa, senhapessoa, enderecopessoa } = req.body;

    const result = await query(
      `UPDATE pessoa
       SET cpfpessoa = $1, nomepessoa = $2, emailpessoa = $3, senhapessoa = $4, enderecopessoa = $5
       WHERE idpessoa = $6
       RETURNING *`,
      [cpfpessoa || null, nomepessoa, emailpessoa, senhapessoa, enderecopessoa || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Pessoa não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar pessoa:", err);
    res.status(500).json({ erro: "Erro interno ao atualizar pessoa" });
  }
};

// ================== DELETAR ==================
exports.deletarPessoa = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query("DELETE FROM pessoa WHERE idpessoa = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Pessoa não encontrada" });
    }
    res.json({ sucesso: true, mensagem: "Pessoa deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar pessoa:", err);
    res.status(500).json({ erro: "Erro interno ao deletar pessoa" });
  }
};
// ================== ABRIR CRUD ==================
exports.abrirCrudPessoa = (req, res) => {
  res.json({ message: "Tela de CRUD de Pessoa funcionando 🚀" });
};
