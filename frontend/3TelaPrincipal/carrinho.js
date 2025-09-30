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

// ===== Atualizar quantidade (PUT) =====
async function atualizarQuantidade(idcarrinho, quantidade) {
  try {
    // Se quantidade for 0, removemos
    if (quantidade <= 0) {
      await removerItem(idcarrinho);
      return;
    }

    const resp = await fetch(`${API_URL}/${idcarrinho}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade })
    });

    if (!resp.ok) {
      // tenta ler mensagem do servidor
      const txt = await resp.text();
      throw new Error(`Erro ao atualizar quantidade: ${txt}`);
    }

    await carregarCarrinho();
  } catch (err) {
    console.error("Erro ao atualizar quantidade:", err);
    alert("Erro ao atualizar quantidade do item.");
  }
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

      // controle de quantidade com botões + e -
      div.innerHTML = `
        <img src="http://localhost:3001/images/${item.imagem || 'sem-imagem.png'}" alt="${item.nome}">
        <div class="info">
          <h3>${item.nome}</h3>
          <p>R$ ${preco.toFixed(2)}</p>
        </div>

        <div class="quantidade" data-id="${item.idcarrinho}">
          <button class="q-decrease" aria-label="Diminuir quantidade" data-id="${item.idcarrinho}">−</button>
          <span class="q-value">${qtd}</span>
          <button class="q-increase" aria-label="Aumentar quantidade" data-id="${item.idcarrinho}">+</button>
        </div>

        <button class="remover-btn" data-id="${item.idcarrinho}" title="Remover item">✖</button>
      `;

      containerItens.appendChild(div);
    });

    totalSpan.textContent = total.toFixed(2);

    // listeners para remover
    containerItens.querySelectorAll(".remover-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const idcarrinho = e.currentTarget.dataset.id;
        if (confirm("Remover item do carrinho?")) {
          await removerItem(idcarrinho);
        }
      });
    });

    // listeners para aumentar/diminuir
    containerItens.querySelectorAll(".q-increase").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const idcarrinho = e.currentTarget.dataset.id;
        // pega o span da quantidade atual
        const wrapper = e.currentTarget.closest(".quantidade");
        const span = wrapper.querySelector(".q-value");
        const atual = parseInt(span.textContent, 10);
        const nova = atual + 1;
        // envia para o servidor
        await atualizarQuantidade(idcarrinho, nova);
      });
    });

    containerItens.querySelectorAll(".q-decrease").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const idcarrinho = e.currentTarget.dataset.id;
        const wrapper = e.currentTarget.closest(".quantidade");
        const span = wrapper.querySelector(".q-value");
        const atual = parseInt(span.textContent, 10);

        if (atual <= 1) {
          // se quiser apagar quando for 1 -> 0, pede confirmação
          if (confirm("Quantidade vai ficar 0. Deseja remover o item?")) {
            await removerItem(idcarrinho);
          }
          return;
        }

        const nova = atual - 1;
        await atualizarQuantidade(idcarrinho, nova);
      });
    });

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
    await carregarCarrinho();
  } catch (err) {
    console.error("Erro ao remover item:", err);
    alert("Erro ao remover o item do carrinho.");
  }
}

// ===== Finalizar compra =====
async function finalizarCompra() {
  const idpessoa = getIdPessoa();
  if (!idpessoa) {
    alert("Você precisa estar logado para finalizar a compra!");
    return;
  }
  try {
    await fetch(`${API_URL}/pessoa/${idpessoa}`, { method: "DELETE" });
    await carregarCarrinho();
    alert("Compra finalizada com sucesso!");
  } catch (err) {
    console.error("Erro ao finalizar compra:", err);
    alert("Erro ao finalizar compra!");
  }
}

// ===== Logout (limpa carrinho + cookie) =====
async function logoutCarrinho() {
  document.cookie = "usuarioLogado=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "../1LoginCliente/login.html";
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
}

// Chamar assim que a página carregar
window.onload = inicializarCarrinho;
