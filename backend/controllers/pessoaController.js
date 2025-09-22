const { query } = require('../database');

// Abrir CRUD (se usar render de página)
exports.abrirCrudPessoa = async (req, res) => {
  try {
    res.render('pessoa'); // ajuste se precisar
  } catch (error) {
    console.error('Erro ao abrir CRUD de pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar todas as pessoas
exports.listarPessoas = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pessoa ORDER BY idpessoa ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter pessoa por ID
exports.obterPessoa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await query('SELECT * FROM pessoa WHERE idpessoa = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova pessoa
exports.criarPessoa = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { nomepessoa, emailpessoa, senhapessoa, cpfpessoa, enderecopessoa } = req.body;

    if (!nomepessoa || !emailpessoa || !senhapessoa) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const result = await query(
      `INSERT INTO pessoa (nomepessoa, emailpessoa, senhapessoa, cpfpessoa, enderecopessoa)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nomepessoa, emailpessoa, senhapessoa, cpfpessoa, enderecopessoa]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);

    if (error.code === '23505' && error.constraint === 'pessoa_emailpessoa_key') {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    if (error.code === '23502') {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar pessoa
exports.atualizarPessoa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nomepessoa, emailpessoa, senhapessoa, cpfpessoa, enderecopessoa } = req.body;

    const existingPersonResult = await query('SELECT * FROM pessoa WHERE idpessoa = $1', [id]);
    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    const updateResult = await query(
      `UPDATE pessoa 
       SET nomepessoa = $1, emailpessoa = $2, senhapessoa = $3, cpfpessoa = $4, enderecopessoa = $5
       WHERE idpessoa = $6 RETURNING *`,
      [nomepessoa, emailpessoa, senhapessoa, cpfpessoa, enderecopessoa, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar pessoa
exports.deletarPessoa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await query('DELETE FROM pessoa WHERE idpessoa = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar senha
exports.atualizarSenha = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nova_senha } = req.body;

    if (!nova_senha) {
      return res.status(400).json({ error: 'Nova senha é obrigatória' });
    }

    const updateResult = await query(
      `UPDATE pessoa 
       SET senhapessoa = $1
       WHERE idpessoa = $2
       RETURNING idpessoa, nomepessoa, emailpessoa, cpfpessoa, enderecopessoa`,
      [nova_senha, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
