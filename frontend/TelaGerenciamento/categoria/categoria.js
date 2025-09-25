const API_BASE_URL = 'http://localhost:3001';
let currentCategoriaId = null;
let operacao = null;

const form = document.getElementById('categoriaForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const categoriasTableBody = document.getElementById('categoriasTableBody');
const messageContainer = document.getElementById('messageContainer');

document.addEventListener('DOMContentLoaded', carregarCategorias);

btnBuscar.addEventListener('click', buscarCategoria);
btnIncluir.addEventListener('click', incluirCategoria);
btnAlterar.addEventListener('click', alterarCategoria);
btnExcluir.addEventListener('click', excluirCategoria);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, true);
bloquearCampos(false);

function mostrarMensagem(texto, tipo = 'info') {
  messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
  setTimeout(() => { messageContainer.innerHTML = ''; }, 3000);
}

function bloquearCampos(habilitar) {
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach((input, index) => {
    if (index === 0) input.disabled = habilitar;
    else input.disabled = !habilitar;
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

async function buscarCategoria() {
  const id = searchId.value.trim();
  if (!id) return mostrarMensagem('Digite um ID para buscar', 'warning');

  try {
    const response = await fetch(`${API_BASE_URL}/categoria/${id}`);
    if (response.ok) {
      const categoria = await response.json();
      preencherFormulario(categoria);
      mostrarBotoes(true, false, true, true, false, true);
      mostrarMensagem('Categoria encontrada!', 'success');
    } else if (response.status === 404) {
      limparFormulario();
      searchId.value = id;
      mostrarBotoes(true, true, false, false, false, true);
      mostrarMensagem('Categoria não encontrada. Você pode incluir uma nova.', 'info');
      bloquearCampos(false);
    } else throw new Error();
  } catch {
    mostrarMensagem('Erro ao buscar categoria', 'error');
  }
}

function preencherFormulario(categoria) {
  currentCategoriaId = categoria.idcategoria;
  searchId.value = categoria.idcategoria;
  document.getElementById('nomecategoria').value = categoria.nomecategoria || '';
}

function incluirCategoria() {
  mostrarMensagem('Digite os dados!', 'info');
  currentCategoriaId = searchId.value;
  limparFormulario();
  searchId.value = currentCategoriaId;
  bloquearCampos(true);
  mostrarBotoes(false, false, false, false, true, true);
  document.getElementById('nomecategoria').focus();
  operacao = 'incluir';
}

function alterarCategoria() {
  mostrarMensagem('Digite os dados!', 'info');
  bloquearCampos(true);
  mostrarBotoes(false, false, false, false, true, true);
  document.getElementById('nomecategoria').focus();
  operacao = 'alterar';
}

function excluirCategoria() {
  mostrarMensagem('Excluindo categoria...', 'info');
  currentCategoriaId = searchId.value;
  searchId.disabled = true;
  bloquearCampos(false);
  mostrarBotoes(false, false, false, false, true, true);
  operacao = 'excluir';
}

async function salvarOperacao() {
  const formData = new FormData(form);
  const categoria = { 
    idcategoria: searchId.value, 
    nomecategoria: formData.get('nomecategoria') 
  };

  let response = null;
  try {
    if (operacao === 'incluir') {
      response = await fetch(`${API_BASE_URL}/categoria`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });
    } else if (operacao === 'alterar') {
      response = await fetch(`${API_BASE_URL}/categoria/${currentCategoriaId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });
    } else if (operacao === 'excluir') {
      response = await fetch(`${API_BASE_URL}/categoria/${currentCategoriaId}`, {
        method: 'DELETE'
      });
    }

    if (response.ok) {
      mostrarMensagem(`Operação ${operacao} realizada com sucesso!`, 'success');
      limparFormulario();
      carregarCategorias();
    } else {
      mostrarMensagem('Erro na operação', 'error');
    }
  } catch {
    mostrarMensagem('Erro ao salvar categoria', 'error');
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

async function carregarCategorias() {
  try {
    const response = await fetch(`${API_BASE_URL}/categoria`, { cache: 'no-store' });
    if (response.ok) {
      const categorias = await response.json();
      renderizarTabelaCategorias(categorias);
    } else {
      mostrarMensagem('Erro ao carregar lista de categorias', 'error');
    }
  } catch (err) {
    mostrarMensagem('Erro ao carregar lista de categorias', 'error');
  }
}


function renderizarTabelaCategorias(categorias) {
  categoriasTableBody.innerHTML = '';
  categorias.forEach(cat => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><button class="btn-id" onclick="selecionarCategoria(${cat.idcategoria})">${cat.idcategoria}</button></td>
      <td>${cat.nomecategoria}</td>
    `;
    categoriasTableBody.appendChild(row);
  });
}

async function selecionarCategoria(id) {
  searchId.value = id;
  await buscarCategoria();
}
