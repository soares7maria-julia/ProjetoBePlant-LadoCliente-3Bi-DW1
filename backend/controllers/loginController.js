const { query } = require('../database');

// ================== CADASTRO ==================
exports.cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, cpf, endereco } = req.body;

    if (!nome || !email || !senha || !cpf || !endereco) {
      return res.status(400).json({ erro: "Nome, email, senha, CPF e endereço são obrigatórios" });
    }

    // Verifica se já existe pessoa com esse email
    const check = await query(
      "SELECT idpessoa FROM pessoa WHERE emailpessoa = $1",
      [email]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ erro: "Email já está em uso" });
    }

    // Cria pessoa
    const result = await query(
      `INSERT INTO pessoa (cpfpessoa, nomepessoa, emailpessoa, senhapessoa, enderecopessoa)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING idpessoa, nomepessoa, emailpessoa, cpfpessoa, enderecopessoa`,
      [cpf, nome, email, senha, endereco]   // ⚠️ ideal: criptografar senha com bcrypt
    );

    const pessoa = result.rows[0];

    // Cria cliente vinculado
    await query(
      `INSERT INTO cliente (idpessoa, datacadastro)
       VALUES ($1, NOW())`,
      [pessoa.idpessoa]
    );

    // Retorna dados para frontend
    res.status(201).json({
      sucesso: true,
      usuario: pessoa
    });

  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ erro: "Erro interno ao cadastrar" });
  }
};
