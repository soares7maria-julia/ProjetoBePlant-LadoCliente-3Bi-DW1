const { query } = require('../database');

// Listar todos os cargos
exports.listarCargo = async (req, res) => {
  try {
    const result = await query('SELECT * FROM cargo ORDER BY idcargo');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar cargos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo cargo
exports.criarCargo = async (req, res) => {
  try {
    const { idcargo, nomecargo } = req.body;

    const result = await query(
      'INSERT INTO cargo (idcargo, nomecargo) VALUES ($1, $2) RETURNING *',
      [idcargo, nomecargo]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cargo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter cargo por ID
exports.obterCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query('SELECT * FROM cargo WHERE idcargo = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter cargo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar cargo
exports.atualizarCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nomecargo } = req.body;

    // Verifica se existe
    const existing = await query('SELECT * FROM cargo WHERE idcargo = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }

    // Atualiza
    const updateResult = await query(
      'UPDATE cargo SET nomecargo = $1 WHERE idcargo = $2 RETURNING *',
      [nomecargo, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar cargo
exports.deletarCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verifica se existe
    const existing = await query('SELECT * FROM cargo WHERE idcargo = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }

    await query('DELETE FROM cargo WHERE idcargo = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cargo:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar cargo com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
