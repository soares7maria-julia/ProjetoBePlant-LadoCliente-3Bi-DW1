const API_BASE_URL = 'http://localhost:3001';
let currentProdutoId = null;
let operacao = null;
let currentImagemNome = null; // <-- guarda o nome do arquivo existente

const form = document.getElementById('produtoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const produtosTableBody = document.getElementById('produtosTableBody');
const messageContainer = document.getElementById('messageContainer');
const selectCategoria = document.getElementById('categoria');
const imagemInput = document.getElementById('imagem');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
  carregarCategorias();

  // Eventos para permitir colar/arrastar imagem (registrados uma vez)
  imagemInput.addEventListener('paste', (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imagemInput.files = dataTransfer.files;
      }
    }
  });

  imagemInput.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  imagemInput.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      imagemInput.files = e.dataTransfer.files;
    }
  });
});

btnBuscar.addEventListener('click', buscarProduto);
btnIncluir.addEventListener('click', incluirProduto);
btnAlterar.addEventListener('click', alterarProduto);
btnExcluir.addEventListener('click', excluirProduto);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, true);
bloquearCampos(false);

function mostrarMensagem(texto, tipo = 'info') {
  messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
  setTimeout(() => { messageContainer.innerHTML = ''; }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    if (index === 0) input.disabled = bloquearPrimeiro;
    else input.disabled = !bloquearPrimeiro;
  });
}

function limparFormulario() {
  form.reset();
  // remove preview se existir
  const prev = document.getElementById('imagemPreview');
  if (prev) prev.remove();
  currentImagemNome = null;
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
  btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
  btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
  btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
  btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
  btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
  btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

async function carregarCategorias() {
  try {
    const response = await fetch(`${API_BASE_URL}/categoria`);
    if (response.ok) {
      const categorias = await response.json();
      selectCategoria.innerHTML = '<option value="" disabled selected> selecione uma categoria </option>';
      categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.idcategoria;
        option.textContent = cat.nomecategoria;
        selectCategoria.appendChild(option);
      });
    }
  } catch (err) {
    mostrarMensagem('Erro ao carregar categorias', 'error');
  }
}

async function buscarProduto() {
  const id = searchId.value.trim();
  if (!id) return mostrarMensagem('Digite um ID para buscar', 'warning');

  try {
    const response = await fetch(`${API_BASE_URL}/produto/${id}`);
    if (response.ok) {
      const produto = await response.json();
      preencherFormulario(produto);
      mostrarBotoes(true, false, true, true, false, true);
      mostrarMensagem('Produto encontrado!', 'success');
    } else if (response.status === 404) {
      limparFormulario();
      searchId.value = id;
      mostrarBotoes(true, true, false, false, false, true);
      mostrarMensagem('Produto não encontrado. Você pode incluir um novo.', 'info');
      bloquearCampos(false);
    } else throw new Error('Erro ao buscar produto');
  } catch (err) {
    mostrarMensagem('Erro ao buscar produto', 'error');
  }
}

function preencherFormulario(produto) {
  currentProdutoId = produto.iditem;
  searchId.value = produto.iditem;
  document.getElementById('nome').value = produto.nomeitem || '';
  document.getElementById('estoque').value = produto.estoqueitem || '';
  document.getElementById('valor').value = produto.valorunitario || '';
  selectCategoria.value = produto.idcategoria || '';

  // guarda o nome da imagem corrente (se houver)
  currentImagemNome = produto.imagemitem || null;

  // exibe preview da imagem atual
  if (produto.imagemitem) {
    let preview = document.getElementById('imagemPreview');
    if (!preview) {
      preview = document.createElement('img');
      preview.id = 'imagemPreview';
      preview.style.maxWidth = '120px';
      preview.style.marginTop = '10px';
      imagemInput.insertAdjacentElement('afterend', preview);
    }
    preview.src = `${API_BASE_URL}/images/${produto.imagemitem}`;
    preview.alt = produto.nomeitem || 'imagem do produto';
    preview.dataset.filename = produto.imagemitem;
  } else {
    // se não tem imagem, remove preview se houver
    const prev = document.getElementById('imagemPreview');
    if (prev) prev.remove();
  }
}

function incluirProduto() {
  mostrarMensagem('Digite os dados!', 'info');
  currentProdutoId = searchId.value;
  limparFormulario();
  searchId.value = currentProdutoId;
  bloquearCampos(true);
  mostrarBotoes(false, false, false, false, true, true);
  document.getElementById('nome').focus();
  operacao = 'incluir';
}

function alterarProduto() {
  mostrarMensagem('Digite os dados!', 'info');
  bloquearCampos(true);
  mostrarBotoes(false, false, false, false, true, true);
  document.getElementById('nome').focus();
  operacao = 'alterar';
}

function excluirProduto() {
  mostrarMensagem('Excluindo produto...', 'info');
  currentProdutoId = searchId.value;
  searchId.disabled = true;
  bloquearCampos(false);
  mostrarBotoes(false, false, false, false, true, true);
  operacao = 'excluir';
}

async function salvarOperacao() {
  const formData = new FormData();
  formData.append('iditem', searchId.value);
  formData.append('nomeitem', document.getElementById('nome').value);
  formData.append('estoqueitem', document.getElementById('estoque').value);
  formData.append('valorunitario', document.getElementById('valor').value);
  formData.append('idcategoria', document.getElementById('categoria').value);

  const file = imagemInput.files[0];
  if (file) {
    // se o usuário selecionou novo arquivo, manda ele
    formData.append('imagemitem', file);
  } else if (operacao === 'alterar' && currentImagemNome) {
    // se for alteração e NÃO houve novo arquivo, informa o nome atual para o backend
    // assim o backend sabe para manter a imagem antiga
    formData.append('imagemnome', currentImagemNome);
  }

  let url = `${API_BASE_URL}/produto`;
  let method = 'POST';

  if (operacao === 'alterar') {
    url = `${API_BASE_URL}/produto/${currentProdutoId}`;
    method = 'PUT';
  } else if (operacao === 'excluir') {
    url = `${API_BASE_URL}/produto/${currentProdutoId}`;
    method = 'DELETE';
  }

  try {
    const response = await fetch(url, {
      method,
      body: operacao === 'excluir' ? undefined : formData
    });

    if (response.ok) {
      mostrarMensagem(`Operação ${operacao} realizada com sucesso!`, 'success');
      limparFormulario();
      await carregarProdutos();
      cancelarOperacao(); // volta pro estado inicial
    } else {
      mostrarMensagem('Erro na operação', 'error');
    }
  } catch (err) {
    mostrarMensagem('Erro ao salvar produto', 'error');
  }
}

function cancelarOperacao() {
  limparFormulario();
  mostrarBotoes(true, false, false, false, false, true);
  bloquearCampos(false);
  searchId.focus();
  mostrarMensagem('Operação cancelada', 'info');
}

async function carregarProdutos() {
  try {
    const response = await fetch(`${API_BASE_URL}/produto`);
    if (response.ok) {
      const produtos = await response.json();
      renderizarTabelaProdutos(produtos);
    }
  } catch (err) {
    mostrarMensagem('Erro ao carregar lista de produtos', 'error');
  }
}

function renderizarTabelaProdutos(produtos) {
  produtosTableBody.innerHTML = '';
  produtos.forEach(produto => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><button class="btn-id" onclick="selecionarProduto(${produto.iditem})">${produto.iditem}</button></td>
      <td>${produto.nomeitem}</td>
      <td>${produto.estoqueitem}</td>
      <td>${produto.valorunitario}</td>
      <td><img src="${API_BASE_URL}/images/${produto.imagemitem || 'sem-imagem.png'}" 
               alt="Imagem" style="max-width:80px; border-radius:6px;"></td>
      <td>${produto.nomecategoria || ''}</td>
    `;
    produtosTableBody.appendChild(row);
  });
}

async function selecionarProduto(id) {
  searchId.value = id;
  await buscarProduto();
}
