const { query } = require('../database');

// Listar todos os produtos (JOIN categoria)
exports.listarProdutos = async (req, res) => {
  const sql = `
    SELECT i.idItem, i.nomeItem, i.estoqueItem, i.valorUnitario, i.imagemItem,
           c.idcategoria, c.nomecategoria
    FROM item i
    JOIN categoria c ON i.idcategoria = c.idcategoria
  `;
  try {
    const result = await query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

// Obter produto por ID
exports.obterProduto = async (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT i.idItem, i.nomeItem, i.estoqueItem, i.valorUnitario, i.imagemItem,
           c.idcategoria, c.nomecategoria
    FROM item i
    JOIN categoria c ON i.idcategoria = c.idcategoria
    WHERE i.idItem = $1
  `;
  try {
    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

// Criar novo produto
exports.criarProduto = async (req, res) => {
  const { nomeItem, estoqueItem, valorUnitario, imagemItem, idcategoria } = req.body;
  const sql = `
    INSERT INTO item (nomeItem, estoqueItem, valorUnitario, imagemItem, idcategoria)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING idItem
  `;
  try {
    const result = await query(sql, [nomeItem, estoqueItem, valorUnitario, imagemItem, idcategoria]);
    res.status(201).json({ idItem: result.rows[0].iditem, ...req.body });
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

// Atualizar produto
exports.atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const { nomeItem, estoqueItem, valorUnitario, imagemItem, idcategoria } = req.body;
  const sql = `
    UPDATE item
    SET nomeItem=$1, estoqueItem=$2, valorUnitario=$3, imagemItem=$4, idcategoria=$5
    WHERE idItem=$6
  `;
  try {
    const result = await query(sql, [nomeItem, estoqueItem, valorUnitario, imagemItem, idcategoria, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({ idItem: id, ...req.body });
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
};

// Deletar produto
exports.deletarProduto = async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM item WHERE idItem=$1';
  try {
    const result = await query(sql, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar produto:', err);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};
