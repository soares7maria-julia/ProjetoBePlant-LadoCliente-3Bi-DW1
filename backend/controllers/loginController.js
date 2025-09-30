const { query } = require('../database');

// ================== CADASTRO ==================
// ================== CADASTRO ==================
exports.cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, cpf, endereco } = req.body;

    if (!nome || !email || !senha || !cpf || !endereco) {
      return res.status(400).json({ erro: "Nome, email, senha, CPF e endereço são obrigatórios" });
    }

    // Verifica duplicados
    const check = await query(
      "SELECT idpessoa FROM pessoa WHERE emailpessoa = $1 OR cpfpessoa = $2",
      [email, cpf]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ erro: "Email ou CPF já estão em uso" });
    }

    // Cria pessoa
    const result = await query(
      `INSERT INTO pessoa (cpfpessoa, nomepessoa, emailpessoa, senhapessoa, enderecopessoa)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING idpessoa, nomepessoa, emailpessoa, cpfpessoa, enderecopessoa`,
      [cpf, nome, email, senha, endereco]
    );

    const pessoa = result.rows[0];

    // Cria cliente vinculado
    await query(
      `INSERT INTO cliente (idpessoa, datacadastro)
       VALUES ($1, NOW())`,
      [pessoa.idpessoa]
    );

    // 🔹 Grava cookie igual ao login
    res.cookie("usuarioLogado", JSON.stringify(pessoa), {
      httpOnly: false, // precisa ser false porque o front lê o cookie
      maxAge: 3600 * 1000, // 1h
      path: "/"
    });

    // Retorna também no body
    res.status(201).json({
      sucesso: true,
      usuario: pessoa
    });

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

    const usuario = result.rows[0];

// 🔹 Grava cookie no navegador
res.cookie("usuarioLogado", JSON.stringify(usuario), {
  httpOnly: false, // precisa ser false porque seu carrinho.js lê o cookie no navegador
  maxAge: 24 * 60 * 60 * 1000, // 1 dia
  path: "/"
});

// 🔹 Continua retornando no body também (caso queira usar no front)
res.json({ sucesso: true, usuario });


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
