// ---------------------------- HELPERS PARA COOKIES ----------------------------
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
}

function getCookieValue(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// Função única para pegar o usuário logado
function getUsuarioLogadoFromCookie() {
  const match = document.cookie.match(/(?:^|; )usuarioLogado=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// ---------------------------- ESTADO DA APLICAÇÃO ----------------------------
let todosProdutos = [];
let categoriaAtiva = "todas";
let termoPesquisa = "";

// ---------------------------- PRODUTOS ----------------------------
async function carregarProdutos() {
  try {
    const resposta = await fetch("http://localhost:3001/produto");
    if (!resposta.ok) throw new Error("Erro ao buscar produtos");
    todosProdutos = await resposta.json();
    renderizarProdutos();
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

function renderizarProdutos() {
  const produtosFiltrados = filtrarProdutos();

  const containerAlgumas = document.getElementById("algumas-coisas");
  const containerOutras = document.getElementById("outras-coisas");

  containerAlgumas.innerHTML = "";
  containerOutras.innerHTML = "";

  produtosFiltrados.forEach(produto => {
    const card = criarCardProduto(produto);

    if (produto.idcategoria === 1) {
      containerAlgumas.innerHTML += card;
    } else {
      containerOutras.innerHTML += card;
    }
  });
}

function filtrarProdutos() {
  return todosProdutos.filter(produto => {
    const matchCategoria =
      categoriaAtiva === "todas" ||
      produto.nomecategoria.toLowerCase() === categoriaAtiva;
    const matchPesquisa = produto.nomeitem
      .toLowerCase()
      .includes(termoPesquisa.toLowerCase());
    return matchCategoria && matchPesquisa;
  });
}

function criarCardProduto(produto) {
  return `
    <div class="produto-card">
      <img src="http://localhost:3001/images/${produto.imagemitem || 'sem-imagem.png'}"
           alt="${produto.nomeitem}"
           onerror="this.src='https://via.placeholder.com/300x200/4a7c59/ffffff?text=🌱'">
      <h3>${produto.nomeitem}</h3>
      <p class="preco">R$ ${parseFloat(produto.valorunitario).toFixed(2)}</p>
      <button onclick="adicionarAoCarrinho(${produto.iditem})">Adicionar ao Carrinho</button>
    </div>
  `;
}

// ---------------------------- CARRINHO ----------------------------
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}

function adicionarAoCarrinho(id) {
  let carrinho = JSON.parse(getCookie("carrinho") || "[]");

  const produto = todosProdutos.find(p => p.iditem === id);

  if (!produto) {
    alert("Produto não encontrado!");
    return;
  }

  const itemExistente = carrinho.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      id: id,
      nome: produto.nomeitem,
      preco: parseFloat(produto.valorunitario),
      quantidade: 1
    });
  }

  setCookie("carrinho", JSON.stringify(carrinho));
  alert(`${produto.nomeitem} adicionado ao carrinho!`);
}

// ---------------------------- LOGIN ----------------------------
function verificarLogin() {
  const usuario = getUsuarioLogadoFromCookie();
  if (usuario) {
    mostrarUsuarioLogado(usuario);
  }
}

function login(usuario) {
  const nome = usuario.NOMEPESSOA || usuario.nome || usuario.NOME;
  if (nome) {
    setCookie("usuarioLogado", nome);
    mostrarUsuarioLogado(nome);
  }
}

function logout() {
  document.cookie = "usuarioLogado=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.getElementById("login-btn").style.display = "block";
  document.getElementById("nickname").style.display = "none";
  document.getElementById("logout-btn").style.display = "none";
}

function mostrarUsuarioLogado(username) {
  document.getElementById("login-btn").style.display = "none";
  document.getElementById("nickname").textContent = username; // ou username.toUpperCase()
  document.getElementById("nickname").style.display = "block";
  document.getElementById("logout-btn").style.display = "block";
}

// ---------------------------- CATEGORIAS ----------------------------
async function carregarCategorias() {
  try {
    const res = await fetch("http://localhost:3001/categoria");
    const categorias = await res.json();
    const container = document.querySelector(".category-items");

    container.innerHTML = `<button class="category-btn active" data-category="todas">Todas</button>`;

    categorias.forEach(cat => {
      const btn = document.createElement("button");
      btn.classList.add("category-btn");
      btn.dataset.category = cat.nomecategoria.toLowerCase();
      btn.textContent = cat.nomecategoria;
      container.appendChild(btn);
    });

    configurarEventos();
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
  }
}

// ---------------------------- EVENTOS ----------------------------
function configurarEventos() {
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      categoriaAtiva = this.dataset.category;
      renderizarProdutos();
    });
  });

  const searchInput = document.getElementById("search-input");
  const searchBtn = document.querySelector(".search-btn");

  searchInput.addEventListener("input", function() {
    termoPesquisa = this.value;
    renderizarProdutos();
  });

  searchBtn.addEventListener("click", function() {
    termoPesquisa = searchInput.value;
    renderizarProdutos();
  });

  searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      termoPesquisa = this.value;
      renderizarProdutos();
    }
  });

  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  loginBtn.addEventListener("click", () => {
    window.location.href = "../1LoginCliente/login.html";
  });

  logoutBtn.addEventListener("click", logout);
}

// ---------------------------- SIDEBAR ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  const closeSidebar = document.getElementById("close-sidebar");

  menuToggle.addEventListener("click", () => {
    sidebar.style.width = "250px";
  });

  closeSidebar.addEventListener("click", e => {
    e.preventDefault();
    sidebar.style.width = "0";
  });

  window.addEventListener("click", e => {
    if (e.target !== sidebar && e.target !== menuToggle && !sidebar.contains(e.target)) {
      sidebar.style.width = "0";
    }
  });

  carregarCategorias();
  carregarProdutos();
  verificarLogin(); // garante que o nome aparece no carregamento
});
