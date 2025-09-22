const API_BASE_URL = 'http://localhost:3001'; // ajuste para sua porta do backend
let currentPessoaId = null;
let operacao = null;

const form = document.getElementById('pessoaForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const pessoasTableBody = document.getElementById('pessoasTableBody');
const messageContainer = document.getElementById('messageContainer');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarPessoas();

  const chkFuncionario = document.getElementById('chkFuncionario');
  const cargoSelect = document.getElementById('cargopessoa');
    carregarCargos(); // <<< adiciona esta linha


  // estado inicial: select habilitado só se checkbox marcado
  cargoSelect.disabled = !chkFuncionario.checked;

  // controla habilitação do select quando o checkbox muda
  chkFuncionario.addEventListener('change', () => {
    cargoSelect.disabled = !chkFuncionario.checked;
    if (!chkFuncionario.checked) {
      cargoSelect.value = ""; // limpa se desmarcar
    }
  });
});

async function carregarCargos() {
  try {
    const response = await fetch(`${API_BASE_URL}/cargo`);
    if (response.ok) {
      const cargos = await response.json();
      const cargoSelect = document.getElementById('cargopessoa');
      cargoSelect.innerHTML = '<option value="">Selecione um cargo</option>';

      cargos.forEach(cargo => {
        const option = document.createElement('option');
        option.value = cargo.idcargo;   // se você quiser salvar o ID
        option.textContent = cargo.nomecargo;
        cargoSelect.appendChild(option);
      });
    }
  } catch (err) {
    console.error('Erro ao carregar cargos:', err);
  }
}

btnBuscar.addEventListener('click', buscarPessoa);
btnIncluir.addEventListener('click', incluirPessoa);
btnAlterar.addEventListener('click', alterarPessoa);
btnExcluir.addEventListener('click', excluirPessoa);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, true);
bloquearCampos(false);

function mostrarMensagem(texto, tipo = 'info') {
  messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
  setTimeout(() => { messageContainer.innerHTML = ''; }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
  // percorre inputs/selects mas mantém checkbox sempre clicável
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach((input, index) => {
    if (index === 0) {
      // primeiro input (searchId) segue a lógica antiga
      input.disabled = bloquearPrimeiro;
    } else {
      // não desabilitar o checkbox (#chkFuncionario)
      if (input.id === 'chkFuncionario') {
        input.disabled = false;
      } else {
        input.disabled = !bloquearPrimeiro;
      }
    }
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

async function buscarPessoa() {
  const id = searchId.value.trim();
  if (!id) return mostrarMensagem('Digite um ID para buscar', 'warning');

  try {
    const response = await fetch(`${API_BASE_URL}/pessoa/${id}`);
    if (response.ok) {
      const pessoa = await response.json();
      preencherFormulario(pessoa);
      mostrarBotoes(true, false, true, true, false, true);
      mostrarMensagem('Pessoa encontrada!', 'success');
    } else if (response.status === 404) {
      limparFormulario();
      searchId.value = id;
      mostrarBotoes(true, true, false, false, false, true);
      mostrarMensagem('Pessoa não encontrada. Você pode incluir uma nova.', 'info');
      bloquearCampos(false);
    } else throw new Error('Erro ao buscar pessoa');
  } catch (err) {
    mostrarMensagem('Erro ao buscar pessoa', 'error');
  }
}

function preencherFormulario(pessoa) {
  currentPessoaId = pessoa.idpessoa;
  searchId.value = pessoa.idpessoa;
  document.getElementById('nomepessoa').value = pessoa.nomepessoa || '';
  document.getElementById('emailpessoa').value = pessoa.emailpessoa || '';
  document.getElementById('cpfpessoa').value = pessoa.cpfpessoa || '';
  document.getElementById('senhapessoa').value = ''; // senha não volta por segurança

  const chkFuncionario = document.getElementById('chkFuncionario');
  const cargoSelect = document.getElementById('cargopessoa');

  if (pessoa.cargopessoa) {
    chkFuncionario.checked = true;
    cargoSelect.disabled = false;
    cargoSelect.value = pessoa.cargopessoa;
  } else {
    chkFuncionario.checked = false;
    cargoSelect.disabled = true;
    cargoSelect.value = "";
  }
}

function incluirPessoa() {
  mostrarMensagem('Digite os dados!', 'info');
  currentPessoaId = searchId.value;
  limparFormulario();
  searchId.value = currentPessoaId;
  bloquearCampos(true);
  mostrarBotoes(false, false, false, false, true, true);
  document.getElementById('nomepessoa').focus();
  operacao = 'incluir';
}

function alterarPessoa() {
  mostrarMensagem('Digite os dados!', 'info');
  bloquearCampos(true);
  mostrarBotoes(false, false, false, false, true, true);
  document.getElementById('nomepessoa').focus();
  operacao = 'alterar';
}

function excluirPessoa() {
  mostrarMensagem('Excluindo pessoa...', 'info');
  currentPessoaId = searchId.value;
  searchId.disabled = true;
  bloquearCampos(false);
  mostrarBotoes(false, false, false, false, true, true);
  operacao = 'excluir';
}

async function salvarOperacao() {
  const pessoa = {
    idpessoa: searchId.value,
    nomepessoa: document.getElementById('nomepessoa').value,
    emailpessoa: document.getElementById('emailpessoa').value,
    cpfpessoa: document.getElementById('cpfpessoa').value,
    senhapessoa: document.getElementById('senhapessoa').value,
    cargopessoa: document.getElementById('chkFuncionario').checked
      ? document.getElementById('cargopessoa').value
      : ""
  };

  let response = null;
  try {
    if (operacao === 'incluir') {
      response = await fetch(`${API_BASE_URL}/pessoa`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pessoa)
      });
    } else if (operacao === 'alterar') {
      response = await fetch(`${API_BASE_URL}/pessoa/${currentPessoaId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pessoa)
      });
    } else if (operacao === 'excluir') {
      response = await fetch(`${API_BASE_URL}/pessoa/${currentPessoaId}`, {
        method: 'DELETE'
      });
    }

    if (response && response.ok) {
      mostrarMensagem(`Operação ${operacao} realizada com sucesso!`, 'success');
      limparFormulario();
      carregarPessoas();
    } else {
      mostrarMensagem('Erro na operação', 'error');
    }
  } catch (err) {
    mostrarMensagem('Erro ao salvar pessoa', 'error');
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

async function carregarPessoas() {
  try {
    const response = await fetch(`${API_BASE_URL}/pessoa`);
    if (response.ok) {
      const pessoas = await response.json();
      renderizarTabelaPessoas(pessoas);
    }
  } catch (err) {
    mostrarMensagem('Erro ao carregar lista de pessoas', 'error');
  }
}

function renderizarTabelaPessoas(pessoas) {
  pessoasTableBody.innerHTML = '';
  pessoas.forEach(pessoa => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><button class="btn-id" onclick="selecionarPessoa(${pessoa.idpessoa})">${pessoa.idpessoa}</button></td>
      <td>${pessoa.nomepessoa}</td>
      <td>${pessoa.emailpessoa}</td>
      <td>${pessoa.cpfpessoa || ''}</td>
      <td>${pessoa.cargopessoa || ''}</td>
    `;
    pessoasTableBody.appendChild(row);
  });
}

async function selecionarPessoa(id) {
  searchId.value = id;
  await buscarPessoa();
}
