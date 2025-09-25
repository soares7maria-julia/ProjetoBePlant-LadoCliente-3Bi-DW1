const { query } = require('../database');

// Listar funcionários (inclui salario)
exports.listarFuncionario = async (req, res) => {
  try {
    const result = await query(`
      SELECT f.idpessoa, f.fkcargo, f.salario, c.nomecargo
      FROM funcionario f
      LEFT JOIN cargo c ON c.idcargo = f.fkcargo
      ORDER BY f.idpessoa
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar funcionário (salario opcional)
exports.criarFuncionario = async (req, res) => {
  try {
    const { idpessoa, fkcargo, salario } = req.body;
    const result = await query(
      'INSERT INTO funcionario (idpessoa, fkcargo, salario) VALUES ($1, $2, $3) RETURNING *',
      [idpessoa, fkcargo || null, salario || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter funcionário por idpessoa
exports.obterFuncionario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await query(
      `SELECT f.idpessoa, f.fkcargo, f.salario, c.nomecargo
       FROM funcionario f
       LEFT JOIN cargo c ON c.idcargo = f.fkcargo
       WHERE f.idpessoa = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


// Atualizar funcionário (cargo e salário)
exports.atualizarFuncionario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { fkcargo, salario } = req.body;

    const result = await query(
      `UPDATE funcionario 
       SET fkcargo = $1, salario = $2 
       WHERE idpessoa = $3 
       RETURNING *`,
      [fkcargo || null, salario || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar funcionário
exports.deletarFuncionario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await query(
      'DELETE FROM funcionario WHERE idpessoa = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
