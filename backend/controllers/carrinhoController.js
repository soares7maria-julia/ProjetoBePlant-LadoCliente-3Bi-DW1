const { query } = require("../database");

// Listar carrinho de uma pessoa
exports.listarCarrinho = async (req, res) => {
  try {
    const { idpessoa } = req.params;
    const result = await query(
      `SELECT 
         c.idcarrinho, 
         c.quantidade, 
         i.nomeitem AS nome, 
         i.valorunitario AS preco, 
         i.imagemitem AS imagem
       FROM carrinho_item c
       JOIN item i ON c.iditem = i.iditem
       WHERE c.idpessoa = $1`,
      [idpessoa]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar carrinho", detalhe: err.message });
  }
};

// Adicionar item ao carrinho
exports.adicionarItem = async (req, res) => {
  try {
    const { idpessoa, iditem, quantidade } = req.body;

    // Verifica se já existe o item no carrinho
    const existe = await query(
      `SELECT * FROM carrinho_item WHERE idpessoa = $1 AND iditem = $2`,
      [idpessoa, iditem]
    );

    if (existe.rows.length > 0) {
      // Se já existir, soma a quantidade
      await query(
        `UPDATE carrinho_item 
         SET quantidade = quantidade + $1 
         WHERE idcarrinho = $2`,
        [quantidade || 1, existe.rows[0].idcarrinho]
      );
    } else {
      // Se não existir, insere
      await query(
        `INSERT INTO carrinho_item (idpessoa, iditem, quantidade) 
         VALUES ($1, $2, $3)`,
        [idpessoa, iditem, quantidade || 1]
      );
    }

    // 🔹 Retorna o carrinho atualizado
    const atualizado = await query(
      `SELECT 
         c.idcarrinho, 
         c.quantidade, 
         i.nomeitem AS nome, 
         i.valorunitario AS preco, 
         i.imagemitem AS imagem
       FROM carrinho_item c
       JOIN item i ON c.iditem = i.iditem
       WHERE c.idpessoa = $1`,
      [idpessoa]
    );

    res.json(atualizado.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao adicionar item", detalhe: err.message });
  }
};

// Atualizar quantidade
exports.atualizarQuantidade = async (req, res) => {
  try {
    const { idcarrinho } = req.params;
    const { quantidade } = req.body;
    await query(
      `UPDATE carrinho_item SET quantidade = $1 WHERE idcarrinho = $2`,
      [quantidade, idcarrinho]
    );
    res.json({ sucesso: true, mensagem: "Quantidade atualizada" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar quantidade", detalhe: err.message });
  }
};

// Remover item
exports.removerItem = async (req, res) => {
  try {
    const { idcarrinho } = req.params;
    await query(`DELETE FROM carrinho_item WHERE idcarrinho = $1`, [idcarrinho]);
    res.json({ sucesso: true, mensagem: "Item removido" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao remover item", detalhe: err.message });
  }
};

// Limpar carrinho de uma pessoa
exports.limparCarrinho = async (req, res) => {
  try {
    const { idpessoa } = req.params;
    await query(`DELETE FROM carrinho_item WHERE idpessoa = $1`, [idpessoa]);
    res.json({ sucesso: true, mensagem: "Carrinho limpo" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao limpar carrinho", detalhe: err.message });
  }
};
