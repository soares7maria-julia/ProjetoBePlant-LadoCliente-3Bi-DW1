const { query } = require('../database');

// Listar todos os clientes
exports.listarCliente = async (req, res) => {
  try {
    const result = await query(`
      SELECT idpessoa, datacadastro
      FROM cliente
      ORDER BY idpessoa
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo cliente
exports.criarCliente = async (req, res) => {
  try {
    const { idpessoa } = req.body;
    const result = await query(
      'INSERT INTO cliente (idpessoa, datacadastro) VALUES ($1, NOW()) RETURNING *',
      [idpessoa]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter cliente
exports.obterCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await query(
      'SELECT idpessoa, datacadastro FROM cliente WHERE idpessoa = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar cliente (somente data)
exports.atualizarCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { datacadastro } = req.body;
    const result = await query(
      'UPDATE cliente SET datacadastro = $1 WHERE idpessoa = $2 RETURNING *',
      [datacadastro, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar cliente
exports.deletarCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await query('DELETE FROM cliente WHERE idpessoa = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
