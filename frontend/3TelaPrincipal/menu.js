// Dados dos produtos expandidos
const produtos = [
  // Algumas Coisas
  { id: 1, nome: "Samambaia", preco: 25.00, imagem: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "algumas" },
  { id: 2, nome: "Cacto Pequeno", preco: 15.00, imagem: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "algumas" },
  { id: 3, nome: "Orquídea Branca", preco: 45.00, imagem: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "algumas" },
  { id: 4, nome: "Vaso Cerâmica", preco: 35.00, imagem: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "algumas" },
  { id: 5, nome: "Suculenta Mix", preco: 20.00, imagem: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "algumas" },
  { id: 6, nome: "Regador Verde", preco: 28.00, imagem: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "algumas" },
  { id: 7, nome: "Fertilizante", preco: 18.00, imagem: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "algumas" },
  
  // Outras Coisas
  { id: 8, nome: "Monstera Deliciosa", preco: 65.00, imagem: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "outras" },
  { id: 9, nome: "Vaso Suspenso", preco: 42.00, imagem: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "outras" },
  { id: 10, nome: "Kit Sementes", preco: 12.00, imagem: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "outras" },
  { id: 11, nome: "Pá de Jardim", preco: 22.00, imagem: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "outras" },
  { id: 12, nome: "Violeta Africana", preco: 30.00, imagem: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "outras" },
  { id: 13, nome: "Vaso Decorativo", preco: 55.00, imagem: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=200&fit=crop", categoria: "Plantas Ornamentais", secao: "outras" }
];

// Estado da aplicação
let categoriaAtiva = 'todas';
let termoPesquisa = '';
function getUsuarioLogado() {
  const match = document.cookie.match(/(^| )usuarioLogado=([^;]+)/);
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch {
      return null;
    }
  }
  return null;
}

let usuarioLogado = getUsuarioLogado();

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  inicializarApp();
});

function inicializarApp() {
  carregarCategorias().then(() => {
    carregarProdutos();  // já usa as categorias
    verificarLogin();
  });
}


// Carregar produtos nas seções
function carregarProdutos() {
  const produtosFiltrados = filtrarProdutos();
  
  // Carregar "Algumas Coisas"
  const containerAlgumas = document.getElementById('algumas-coisas');
  const produtosAlgumas = produtosFiltrados.filter(p => p.secao === 'algumas');
  containerAlgumas.innerHTML = produtosAlgumas.map(criarCardProduto).join('');
  
  // Carregar "Outras Coisas"
  const containerOutras = document.getElementById('outras-coisas');
  const produtosOutras = produtosFiltrados.filter(p => p.secao === 'outras');
  containerOutras.innerHTML = produtosOutras.map(criarCardProduto).join('');
}

// Filtrar produtos por categoria e pesquisa
function filtrarProdutos() {
  return produtos.filter(produto => {
    const matchCategoria = categoriaAtiva === 'todas' || produto.categoria === categoriaAtiva;
    const matchPesquisa = produto.nome.toLowerCase().includes(termoPesquisa.toLowerCase());
    return matchCategoria && matchPesquisa;
  });
}

// Criar card do produto
function criarCardProduto(produto) {
  return `
    <div class="produto-card">
      <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='https://via.placeholder.com/300x200/4a7c59/ffffff?text=🌱'">
      <h3>${produto.nome}</h3>
      <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
      <button onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
    </div>
  `;
}

// Configurar eventos
// Configurar eventos
function configurarEventos() {
  // Botões de categoria
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Remover classe active de todos os botões
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      // Adicionar classe active ao botão clicado
      this.classList.add('active');
      
      categoriaAtiva = this.dataset.category;
      carregarProdutos();
    });
  });

  // Pesquisa
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.querySelector('.search-btn');
  
  searchInput.addEventListener('input', function() {
    termoPesquisa = this.value;
    carregarProdutos();
  });
  
  searchBtn.addEventListener('click', function() {
    termoPesquisa = searchInput.value;
    carregarProdutos();
  });
  
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      termoPesquisa = this.value;
      carregarProdutos();
    }
  });

  // Login / Logout
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  loginBtn.addEventListener('click', () => {
    window.location.href = "../1LoginCliente/login.html"; // redireciona para a tela de login
  });

  logoutBtn.addEventListener('click', logout);
}


// Funções de login
function verificarLogin() {
  if (usuarioLogado) {
    mostrarUsuarioLogado(usuarioLogado);
  }
}

function login(username) {
  usuarioLogado = username;
  localStorage.setItem('usuarioLogado', username);
  mostrarUsuarioLogado(username);
}

function logout() {
  usuarioLogado = null;
  localStorage.removeItem('usuarioLogado');
  document.getElementById('login-btn').style.display = 'block';
  document.getElementById('nickname').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'none';
}

function mostrarUsuarioLogado(username) {
  document.getElementById('login-btn').style.display = 'none';
  document.getElementById('nickname').textContent = username.toUpperCase();
  document.getElementById('nickname').style.display = 'block';
  document.getElementById('logout-btn').style.display = 'block';
}

// Função do carrinho (mantida da versão original)
function adicionarAoCarrinho(id) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  carrinho.push(id);
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  
  // Feedback visual melhorado
  const produto = produtos.find(p => p.id === id);
  if (produto) {
    alert(`${produto.nome} adicionado ao carrinho!`);
  }
}


// Sidebar menu as tres barrinhas
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  const closeSidebar = document.getElementById("close-sidebar");

  menuToggle.addEventListener("click", () => {
    sidebar.style.width = "250px"; // abre
  });

  closeSidebar.addEventListener("click", (e) => {
    e.preventDefault();
    sidebar.style.width = "0"; // fecha
  });

  window.addEventListener("click", (e) => {
    if (e.target !== sidebar && e.target !== menuToggle && !sidebar.contains(e.target)) {
      sidebar.style.width = "0";
    }
  });
});

async function carregarCategorias() {
  try {
    const res = await fetch("http://localhost:3001/categoria"); // ajuste a porta se precisar
    const categorias = await res.json();
    const container = document.querySelector(".category-items");

    // sempre começa com "Todas"
    container.innerHTML = `<button class="category-btn active" data-category="todas">Todas</button>`;

    categorias.forEach(cat => {
      const btn = document.createElement("button");
      btn.classList.add("category-btn");
      btn.dataset.category = cat.nomecategoria.toLowerCase();
      btn.textContent = cat.nomecategoria;
      container.appendChild(btn);
    });

    configurarEventos(); // reativa eventos de clique
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
  }
}

