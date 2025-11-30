// ===== Configuração =====
const API_URL = "http://localhost:3001/api/carrinho";

// ===== Helpers =====
function getUsuarioLogado() {
  const cookie = document.cookie
    .split("; ")
    .find(row => row.startsWith("usuarioLogado="));
  if (!cookie) return null;
  try {
    return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
  } catch (e) {
    return null;
  }
}

function getIdPessoa() {
  const usuario = getUsuarioLogado();
  return usuario ? usuario.idpessoa : null;
}

// ===== Adicionar item ao carrinho =====
async function adicionarAoCarrinho(iditem) {
  const idpessoa = getIdPessoa();
  if (!idpessoa) {
    alert("⚠️ Você precisa estar logado para adicionar itens ao carrinho!");
    return;
  }

  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idpessoa, iditem, quantidade: 1 })
    });

    if (!resp.ok) throw new Error("Erro ao adicionar item");

    await carregarCarrinho();
    alert("Item adicionado ao carrinho!");
  } catch (err) {
    console.error("Erro ao adicionar:", err);
    alert("Erro ao adicionar ao carrinho!");
  }
}

// ===== Atualizar quantidade =====
async function atualizarQuantidade(idcarrinho, novaQtd) {
  try {
    if (novaQtd <= 0) {
      await removerItem(idcarrinho);
      return;
    }

    const resp = await fetch(`${API_URL}/${idcarrinho}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade: novaQtd })
    });

    if (!resp.ok) throw new Error("Erro ao atualizar quantidade");

    // Atualiza apenas o valor mostrado, sem recarregar tudo
    const itemEl = document.querySelector(`.carrinho-item[data-id="${idcarrinho}"]`);
    if (itemEl) {
      const qtdSpan = itemEl.querySelector(".q-value");
      qtdSpan.textContent = novaQtd;

      const preco = parseFloat(itemEl.dataset.preco);
      itemEl.querySelector(".subtotal").textContent = `R$ ${(preco * novaQtd).toFixed(2)}`;

      atualizarTotal();
    }
  } catch (err) {
    console.error("Erro ao atualizar quantidade:", err);
    alert("Erro ao atualizar quantidade do item.");
  }
}

// ===== Atualizar total =====
function atualizarTotal() {
  let total = 0;
  document.querySelectorAll(".carrinho-item").forEach(div => {
    const preco = parseFloat(div.dataset.preco);
    const qtd = parseInt(div.querySelector(".q-value").textContent, 10);
    total += preco * qtd;
  });
  document.getElementById("carrinho-total").textContent = total.toFixed(2);
}

// ===== Carregar carrinho =====
async function carregarCarrinho() {
  const idpessoa = getIdPessoa();
  const containerItens = document.getElementById("carrinho-itens");
  const totalSpan = document.getElementById("carrinho-total");
  containerItens.innerHTML = "";

  if (!idpessoa) {
    containerItens.innerHTML = `<p class="carrinho-vazio">Faça login para ver seu carrinho.</p>`;
    totalSpan.textContent = "0.00";
    return;
  }

  try {
    const resp = await fetch(`${API_URL}/${idpessoa}`);
    if (!resp.ok) throw new Error("Erro ao carregar carrinho");

    const carrinho = await resp.json();
    if (!carrinho || carrinho.length === 0) {
      containerItens.innerHTML = `<p class="carrinho-vazio">O carrinho está vazio.</p>`;
      totalSpan.textContent = "0.00";
      return;
    }

    let total = 0;
    carrinho.forEach(item => {
      const preco = parseFloat(item.preco || 0);
      const qtd = parseInt(item.quantidade || 1, 10);
      total += preco * qtd;

      const div = document.createElement("div");
      div.classList.add("carrinho-item");
      div.dataset.id = item.idcarrinho;
      div.dataset.preco = preco;

      div.innerHTML = `
        <img src="http://localhost:3001/images/${item.imagem || 'sem-imagem.png'}" alt="${item.nome}">
        <div class="info">
          <h3>${item.nome}</h3>
          <p>R$ ${preco.toFixed(2)}</p>
        </div>

        <div class="quantidade">
          <button class="q-decrease">−</button>
          <span class="q-value">${qtd}</span>
          <button class="q-increase">+</button>
        </div>

        <p class="subtotal">R$ ${(preco * qtd).toFixed(2)}</p>
        <button class="remover-btn">✖</button>
      `;

      // Eventos locais
      const btnMais = div.querySelector(".q-increase");
      const btnMenos = div.querySelector(".q-decrease");
      const btnRemover = div.querySelector(".remover-btn");

      btnMais.addEventListener("click", async () => {
        const atual = parseInt(div.querySelector(".q-value").textContent, 10);
        await atualizarQuantidade(item.idcarrinho, atual + 1);
      });

      btnMenos.addEventListener("click", async () => {
        const atual = parseInt(div.querySelector(".q-value").textContent, 10);
        if (atual <= 1) {
          if (confirm("Deseja remover este item?")) await removerItem(item.idcarrinho);
        } else {
          await atualizarQuantidade(item.idcarrinho, atual - 1);
        }
      });

      btnRemover.addEventListener("click", async () => {
        if (confirm("Remover item do carrinho?")) {
          await removerItem(item.idcarrinho);
        }
      });

      containerItens.appendChild(div);
    });

    totalSpan.textContent = total.toFixed(2);
  } catch (err) {
    console.error("Erro ao carregar carrinho:", err);
    containerItens.innerHTML = `<p class="carrinho-vazio">Erro ao carregar carrinho.</p>`;
    totalSpan.textContent = "0.00";
  }
}

// ===== Remover item =====
async function removerItem(idcarrinho) {
  try {
    const resp = await fetch(`${API_URL}/${idcarrinho}`, { method: "DELETE" });
    if (!resp.ok) throw new Error("Erro ao remover item");
    const div = document.querySelector(`.carrinho-item[data-id="${idcarrinho}"]`);
    if (div) div.remove();
    atualizarTotal();
  } catch (err) {
    console.error("Erro ao remover item:", err);
    alert("Erro ao remover o item do carrinho.");
  }
}

// ===== Limpar carrinho =====
async function limparCarrinho() {
  const idpessoa = getIdPessoa();
  if (!idpessoa) {
    alert("Nenhum carrinho para limpar (faça login).");
    return;
  }
  if (!confirm("Tem certeza que deseja limpar todo o carrinho?")) return;

  try {
    const resp = await fetch(`${API_URL}/pessoa/${idpessoa}`, { method: "DELETE" });
    if (!resp.ok) throw new Error("Erro ao limpar carrinho");
    document.getElementById("carrinho-itens").innerHTML = `<p class="carrinho-vazio">O carrinho está vazio.</p>`;
    document.getElementById("carrinho-total").textContent = "0.00";
  } catch (err) {
    console.error("Erro ao limpar carrinho:", err);
    alert("Erro ao limpar carrinho.");
  }
}

// ===== Finalizar compra =====
async function finalizarCompra() {
  const idpessoa = getIdPessoa();
  if (!idpessoa) {
    alert("Você precisa estar logado para finalizar a compra!");
    return;
  }

  // pega o total atual do carrinho
  const total = document.getElementById("carrinho-total").textContent;

  // salva o total em cookie (dura 1 hora)
  document.cookie = `valorCompra=${total}; path=/; max-age=3600`;

  // fecha modal
  document.getElementById("carrinho-modal").style.display = "none";

  // redireciona corretamente
  
window.location.href = "../Pagamento/finalizar_pedido.html";

}


// ===== Inicialização =====
function inicializarCarrinho() {
  const btnCarrinho = document.getElementById("carrinho-btn");
  const modalCarrinho = document.getElementById("carrinho-modal");
  const fecharCarrinho = document.getElementById("fechar-carrinho");
  const finalizarBtn = document.getElementById("finalizar-compra");

  if (!btnCarrinho || !modalCarrinho) {
    console.error("⚠️ Elementos do carrinho não encontrados!");
    return;
  }

  btnCarrinho.addEventListener("click", () => {
    modalCarrinho.style.display = "block";
    carregarCarrinho();
  });

  fecharCarrinho.addEventListener("click", () => {
    modalCarrinho.style.display = "none";
  });

  finalizarBtn.addEventListener("click", finalizarCompra);

   const limparBtn = document.getElementById("limpar-carrinho");
  if (limparBtn) limparBtn.addEventListener("click", limparCarrinho);

}

// Chamar ao carregar página
window.onload = inicializarCarrinho;
