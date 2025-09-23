const { query } = require('../database');

// ================== CADASTRO ==================
exports.cadastrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" });
    }

    // verifica se já existe email
    const check = await query("SELECT idpessoa FROM pessoa WHERE emailpessoa = $1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ erro: "Email já está em uso" });
    }

    // insere em pessoa
    const result = await query(
      `INSERT INTO pessoa (nomepessoa, emailpessoa, senhapessoa)
       VALUES ($1, $2, $3) RETURNING idpessoa, nomepessoa, emailpessoa`,
      [nome, email, senha]
    );
    const pessoa = result.rows[0];

    // insere em cliente
    await query(`INSERT INTO cliente (idpessoa, datacadastro) VALUES ($1, NOW())`, [pessoa.idpessoa]);

    res.status(201).json({ sucesso: true, usuario: pessoa });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ erro: "Erro interno ao cadastrar" });
  }
};

// ================== LOGIN ==================
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

    const result = await query(
      "SELECT idpessoa, nomepessoa, emailpessoa FROM pessoa WHERE emailpessoa = $1 AND senhapessoa = $2",
      [email, senha]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ sucesso: false, erro: "Credenciais inválidas" });
    }

    res.json({ sucesso: true, usuario: result.rows[0] });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro interno ao logar" });
  }
};

// ================== LOGOUT ==================
exports.logout = (req, res) => {
  res.clearCookie("usuarioLogado");
  res.json({ sucesso: true, mensagem: "Logout realizado" });
};
