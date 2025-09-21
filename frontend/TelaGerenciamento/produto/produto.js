const API_BASE_URL = 'http://localhost:3001';
let currentProdutoId = null;
let operacao = null;

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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
  carregarCategorias();
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
  setTimeout(() => { messageContainer.innerHTML = ''; }, 3001);
}

function bloquearCampos(bloquearPrimeiro) {
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    if (index === 0) input.disabled = bloquearPrimeiro;
    else input.disabled = !bloquearPrimeiro;
  });
}

function limparFormulario() { form.reset(); }

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
       console.log("Categorias recebidas:", categorias); // <---- teste

      // Limpa e adiciona a opção padrão
      selectCategoria.innerHTML = '<option value="" disabled selected> selecione uma categoria </option>';

      // Adiciona todas as categorias vindas do backend
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
document.getElementById('imagem').value = produto.imagemitem || '';
selectCategoria.value = produto.idcategoria || '';
  if (produto.idcategoria) {
    selectCategoria.value = produto.idcategoria;
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
  const formData = new FormData(form);
  const produto = {
  idItem: searchId.value,
  nomeItem: formData.get('nome'),
  estoqueItem: parseInt(formData.get('estoque')) || 0,
  valorUnitario: parseFloat(formData.get('valor')) || 0.0,
  imagemItem: formData.get('imagem'),
  idcategoria: parseInt(formData.get('categoria'))
};


  let response = null;
  try {
    if (operacao === 'incluir') {
      response = await fetch(`${API_BASE_URL}/produto`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
      });
    } else if (operacao === 'alterar') {
      response = await fetch(`${API_BASE_URL}/produto/${currentProdutoId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
      });
    } else if (operacao === 'excluir') {
      response = await fetch(`${API_BASE_URL}/produto/${currentProdutoId}`, {
        method: 'DELETE'
      });
    }

    if (response.ok) {
      mostrarMensagem(`Operação ${operacao} realizada com sucesso!`, 'success');
      limparFormulario();
      carregarProdutos();
    } else {
      mostrarMensagem('Erro na operação', 'error');
    }
  } catch (err) {
    mostrarMensagem('Erro ao salvar produto', 'error');
  }

  mostrarBotoes(true, false, false, false, false, true);
  bloquearCampos(false);
  searchId.focus();
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
<td><img src="http://localhost:3001/images/${produto.imagemitem || ''}" 
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
