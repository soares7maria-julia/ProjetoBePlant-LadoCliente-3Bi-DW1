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

const path = require("path");
const fs = require("fs");

exports.criarProduto = async (req, res) => {
  try {
    const { nomeitem, estoqueitem, valorunitario, idcategoria } = req.body;

    // 1️⃣ cria o produto SEM imagem
    const sqlInsert = `
      INSERT INTO item (nomeitem, estoqueitem, valorunitario, idcategoria)
      VALUES ($1, $2, $3, $4)
      RETURNING iditem
    `;

    const result = await query(sqlInsert, [
      nomeitem,
      estoqueitem,
      valorunitario,
      idcategoria
    ]);

    const iditem = result.rows[0].iditem;

    let imagemitem = null;

    // 2️⃣ se veio imagem, renomeia para <iditem>.png
    if (req.file) {
      const ext = path.extname(req.file.originalname) || ".png";
      imagemitem = `${iditem}${ext}`;

      const pastaDestino = path.join(
        __dirname,
        "..",
        "public",
        "images",
        imagemitem
      );

      fs.renameSync(req.file.path, pastaDestino);

      // 3️⃣ atualiza o produto com o nome correto da imagem
      await query(
        "UPDATE item SET imagemitem = $1 WHERE iditem = $2",
        [imagemitem, iditem]
      );
    }

    res.status(201).json({
      iditem,
      nomeitem,
      estoqueitem,
      valorunitario,
      imagemitem,
      idcategoria
    });

  } catch (err) {
    console.error("Erro ao criar produto:", err);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
};

// Atualizar produto
exports.atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomeitem, estoqueitem, valorunitario, idcategoria } = req.body;

    // atualiza dados do produto (sem imagem)
    const sqlUpdate = `
      UPDATE item
      SET nomeitem=$1, estoqueitem=$2, valorunitario=$3, idcategoria=$4
      WHERE iditem=$5
    `;

    const result = await query(sqlUpdate, [
      nomeitem,
      estoqueitem,
      valorunitario,
      idcategoria,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    let imagemitem = null;

    // se veio imagem nova, renomeia com id
    if (req.file) {
      const ext = path.extname(req.file.originalname) || ".png";
      imagemitem = `${id}${ext}`;

      const pastaDestino = path.join(
        __dirname,
        "..",
        "public",
        "images",
        imagemitem
      );

      fs.renameSync(req.file.path, pastaDestino);

      await query(
        "UPDATE item SET imagemitem = $1 WHERE iditem = $2",
        [imagemitem, id]
      );
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
    console.error("Erro ao atualizar produto:", err);
    res.status(500).json({ error: "Erro ao atualizar produto" });
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
