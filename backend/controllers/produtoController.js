const { query } = require('../database');


// Listar todos os produtos (JOIN categoria)
exports.listarProdutos = async (req, res) => {
  const sql = `
  SELECT 
    i.iditem,
    i.nomeitem,
    i.estoqueitem,
    i.valorunitario,
    i.imagemitem,
    c.idcategoria,
    c.nomecategoria
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
  SELECT 
    i.iditem,
    i.nomeitem,
    i.estoqueitem,
    i.valorunitario,
    i.imagemitem,
    c.idcategoria,
    c.nomecategoria
  FROM item i
  JOIN categoria c ON i.idcategoria = c.idcategoria
  WHERE i.iditem = $1
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
  try {
    const { nomeitem, estoqueitem, valorunitario, idcategoria } = req.body;
    const imagemitem = req.file ? req.file.filename : req.body.imagemitem;

    const sql = `
      INSERT INTO item (nomeitem, estoqueitem, valorunitario, imagemitem, idcategoria)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING iditem
    `;

    const result = await query(sql, [nomeitem, estoqueitem, valorunitario, imagemitem, idcategoria]);

    res.status(201).json({
      iditem: result.rows[0].iditem,
      nomeitem,
      estoqueitem,
      valorunitario,
      imagemitem,
      idcategoria
    });
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

// Atualizar produto
exports.atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomeitem, estoqueitem, valorunitario, idcategoria, imagemNome } = req.body;
   const imagemitem = req.file ? req.file.filename : req.body.imagemnome;

    const sql = `
      UPDATE item
      SET nomeitem=$1, estoqueitem=$2, valorunitario=$3, imagemitem=$4, idcategoria=$5
      WHERE iditem=$6
    `;

    const result = await query(sql, [
      nomeitem,
      estoqueitem,
      valorunitario,
      imagemitem,
      idcategoria,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({
      iditem: id,
      nomeitem,
      estoqueitem,
      valorunitario,
      imagemitem,
      idcategoria
    });
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
};

// Deletar produto
exports.deletarProduto = async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM item WHERE iditem=$1';
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
