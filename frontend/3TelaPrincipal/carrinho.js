function carregarCarrinho() {
  let carrinho = JSON.parse(getCookie('carrinho') || '[]');
  let container = document.getElementById("carrinho-itens");
  let total = 0;

  if (!container) return;

  if (carrinho.length === 0) {
    container.innerHTML = '<p class="carrinho-vazio">O carrinho está vazio.</p>';
  } else {
    container.innerHTML = "";
    carrinho.forEach((itemCarrinho, index) => {
      const produto = produtos.find(p => p.id === itemCarrinho.id);
      if (produto) {
        const subtotal = produto.preco * itemCarrinho.quantidade;
        total += subtotal;

        const item = document.createElement("div");
        item.classList.add("carrinho-item");
        item.innerHTML = `
          <img src="${produto.imagem}" alt="${produto.nome}" class="carrinho-img">
          <span class="carrinho-nome">${produto.nome}</span>
          <input type="number" min="1" value="${itemCarrinho.quantidade}" class="carrinho-quantidade" data-index="${index}">
          <span>R$ ${subtotal.toFixed(2)}</span>
          <button class="remover-item" data-index="${index}">✖</button>
        `;
        container.appendChild(item);
      }
    });

    // Remover item
    document.querySelectorAll(".remover-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.dataset.index;
        carrinho.splice(idx, 1);
        setCookie('carrinho', JSON.stringify(carrinho));
        carregarCarrinho();
      });
    });

    // Alterar quantidade
    document.querySelectorAll(".carrinho-quantidade").forEach(input => {
      input.addEventListener("change", (e) => {
        const idx = e.target.dataset.index;
        let qtd = parseInt(e.target.value);
        if (qtd < 1) qtd = 1;
        carrinho[idx].quantidade = qtd;
        setCookie('carrinho', JSON.stringify(carrinho));
        carregarCarrinho();
      });
    });
  }

  document.getElementById("carrinho-total").textContent = total.toFixed(2);
}

// Inicialização
(function initCarrinho() {
  const btnCarrinho = document.getElementById("carrinho-btn");
  const modalCarrinho = document.getElementById("carrinho-modal");
  const fecharCarrinho = document.getElementById("fechar-carrinho");
  const finalizarCompra = document.getElementById("finalizar-compra");

  if (!btnCarrinho || !modalCarrinho) return;

  btnCarrinho.addEventListener("click", () => {
    modalCarrinho.style.display = "block";
    carregarCarrinho();
  });

  fecharCarrinho.addEventListener("click", () => {
    modalCarrinho.style.display = "none";
  });

  finalizarCompra.addEventListener("click", () => {
    alert("Compra finalizada!");
    setCookie('carrinho', JSON.stringify([])); // limpa o carrinho
    carregarCarrinho();
  });
})();
