// ===== Funções auxiliares de cookies =====
function setCookie(name, value, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}

// ===== Carrinho =====
// carrinho.js

function carregarCarrinho() {
  let carrinho = JSON.parse(getCookie("carrinho") || "[]");
  const containerItens = document.getElementById("carrinho-itens");
  const totalSpan = document.getElementById("carrinho-total");
  containerItens.innerHTML = "";

  if (carrinho.length === 0) {
    containerItens.innerHTML = `<p class="carrinho-vazio">O carrinho está vazio.</p>`;
    totalSpan.textContent = "0.00";
    return;
  }

  let total = 0;
  carrinho.forEach(item => {
    total += item.preco * item.quantidade;
    const div = document.createElement("div");
    div.classList.add("carrinho-item");
    div.innerHTML = `
      <span>${item.nome} (x${item.quantidade})</span>
      <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
    `;
    containerItens.appendChild(div);
  });

  totalSpan.textContent = total.toFixed(2);
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

  finalizarBtn.addEventListener("click", () => {
    alert("Compra finalizada com sucesso!");
    setCookie("carrinho", JSON.stringify([]));
    carregarCarrinho();
  });
}

