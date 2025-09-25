// controllers/categoriaController.js
const { query } = require('../database');
const path = require('path');

/**
 * Abre a página de CRUD (se existir frontend em frontend/categoria/categoria.html)
 */
exports.abrirCrudCategoria = (req, res) => {
  console.log('categoriaController - abrirCrudCategoria');
  res.sendFile(path.join(__dirname, '../../frontend/categoria/categoria.html'));
};

/**
 * Lista todas as categorias
 * GET /
 */
exports.listarCategorias = async (req, res) => {
  try {
    const result = await query('SELECT * FROM categoria ORDER BY idcategoria');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Cria uma nova categoria
 * POST /
 * body: { idcategoria? , nomecategoria }
 */
exports.criarCategoria = async (req, res) => {
  try {
    const { idcategoria, nomecategoria } = req.body;

    if (!nomecategoria || nomecategoria.toString().trim() === '') {
      return res.status(400).json({ error: 'nomecategoria é obrigatório' });
    }

    let result;
    if (idcategoria !== undefined && idcategoria !== null && idcategoria !== '') {
      // Se o cliente enviar idcategoria (opcional)
      result = await query(
        'INSERT INTO categoria (idcategoria, nomecategoria) VALUES ($1, $2) RETURNING *',
        [idcategoria, nomecategoria.toString().trim()]
      );
    } else {
      // Deixa o banco atribuir o id (SERIAL / DEFAULT)
      result = await query(
        'INSERT INTO categoria (nomecategoria) VALUES ($1) RETURNING *',
        [nomecategoria.toString().trim()]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);

    // Constraint de duplicidade no Postgres
    if (error && error.code === '23505') {
      return res.status(400).json({ error: 'nomecategoria já existe' });
    }
    if (error && error.code === '23502') {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Obtém uma categoria por ID
 * GET /:id
 */
exports.obterCategoria = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const result = await query('SELECT * FROM categoria WHERE idcategoria = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza uma categoria (apenas nomecategoria)
 * PUT /:id
 * body: { nomecategoria }
 */
exports.atualizarCategoria = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nomecategoria } = req.body;

    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    if (!nomecategoria || nomecategoria.toString().trim() === '') {
      return res.status(400).json({ error: 'nomecategoria é obrigatório' });
    }

    // Verifica existência
    const exist = await query('SELECT 1 FROM categoria WHERE idcategoria = $1', [id]);
    if (exist.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });

    const update = await query(
      'UPDATE categoria SET nomecategoria = $1 WHERE idcategoria = $2 RETURNING *',
      [nomecategoria.toString().trim(), id]
    );

    res.json(update.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    if (error && error.code === '23505') {
      return res.status(400).json({ error: 'nomecategoria já existe' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/// controller.categoria.js (substitua a função atual)
exports.deletarCategoria = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const exist = await query('SELECT 1 FROM categoria WHERE idcategoria = $1', [id]);
    if (exist.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });

    // usa RETURNING para garantir que realmente deletou e conseguir debug
    const result = await query('DELETE FROM categoria WHERE idcategoria = $1 RETURNING idcategoria', [id]);

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Categoria não encontrada ao deletar' });
    }

    // retorna 200 com JSON contendo o id deletado
    return res.status(200).json({ deleted: result.rows[0].idcategoria });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    if (error && error.code === '23503') {
      return res.status(400).json({ error: 'Não é possível deletar categoria com dependências' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
