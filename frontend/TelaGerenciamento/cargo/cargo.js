const API_BASE_URL = 'http://localhost:3001'; // ajuste se necessário
let currentCargoId = null;
let operacaoCargo = null;

const formCargo = document.getElementById('cargoForm');
const searchIdCargo = document.getElementById('searchIdCargo');
const btnBuscarCargo = document.getElementById('btnBuscarCargo');
const btnIncluirCargo = document.getElementById('btnIncluirCargo');
const btnAlterarCargo = document.getElementById('btnAlterarCargo');
const btnExcluirCargo = document.getElementById('btnExcluirCargo');
const btnSalvarCargo = document.getElementById('btnSalvarCargo');
const btnCancelarCargo = document.getElementById('btnCancelarCargo');
const cargosTableBody = document.getElementById('cargosTableBody');
const messageContainerCargo = document.getElementById('messageContainerCargo');

document.addEventListener('DOMContentLoaded', carregarCargos);

btnBuscarCargo.addEventListener('click', buscarCargo);
btnIncluirCargo.addEventListener('click', incluirCargo);
btnAlterarCargo.addEventListener('click', alterarCargo);
btnExcluirCargo.addEventListener('click', excluirCargo);
btnSalvarCargo.addEventListener('click', salvarOperacaoCargo);
btnCancelarCargo.addEventListener('click', cancelarOperacaoCargo);

mostrarBotoesCargo(true, false, false, false, true, true);
bloquearCamposCargo(false);

function mostrarMensagemCargo(texto, tipo = 'info') {
  messageContainerCargo.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
  setTimeout(() => { messageContainerCargo.innerHTML = ''; }, 3000);
}

function bloquearCamposCargo(habilitar) {
  const inputs = formCargo.querySelectorAll('input');
  inputs.forEach((input, index) => {
    if (index === 0) {
      input.disabled = habilitar; // searchId segue lógica
    } else {
      input.disabled = !habilitar;
    }
  });
}

function limparFormularioCargo() {
  formCargo.reset();
}

function mostrarBotoesCargo(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
  btnBuscarCargo.style.display = btBuscar ? 'inline-block' : 'none';
  btnIncluirCargo.style.display = btIncluir ? 'inline-block' : 'none';
  btnAlterarCargo.style.display = btAlterar ? 'inline-block' : 'none';
  btnExcluirCargo.style.display = btExcluir ? 'inline-block' : 'none';
  btnSalvarCargo.style.display = btSalvar ? 'inline-block' : 'none';
  btnCancelarCargo.style.display = btCancelar ? 'inline-block' : 'none';
}

async function buscarCargo() {
  const id = searchIdCargo.value.trim();
  if (!id) return mostrarMensagemCargo('Digite um ID para buscar', 'warning');

  try {
    const response = await fetch(`${API_BASE_URL}/cargo/${id}`);
    if (response.ok) {
      const cargo = await response.json();
      preencherFormularioCargo(cargo);
      mostrarBotoesCargo(true, false, true, true, false, true);
      mostrarMensagemCargo('Cargo encontrado!', 'success');
    } else if (response.status === 404) {
      limparFormularioCargo();
      searchIdCargo.value = id;
      mostrarBotoesCargo(true, true, false, false, false, true);
      mostrarMensagemCargo('Cargo não encontrado. Você pode incluir um novo.', 'info');
      bloquearCamposCargo(false);
    } else throw new Error('Erro ao buscar cargo');
  } catch (err) {
    mostrarMensagemCargo('Erro ao buscar cargo', 'error');
  }
}


function preencherFormularioCargo(cargo) {
  currentCargoId = cargo.idcargo;
  searchIdCargo.value = cargo.idcargo;
  document.getElementById('nomecargo').value = cargo.nomecargo || '';
}


function incluirCargo() {
  mostrarMensagemCargo('Digite os dados!', 'info');
  currentCargoId = searchIdCargo.value;
  limparFormularioCargo();
  searchIdCargo.value = currentCargoId;
  bloquearCamposCargo(true);
  mostrarBotoesCargo(false, false, false, false, true, true);
  document.getElementById('nomecargo').focus();
  operacaoCargo = 'incluir';
}


async function excluirCargo(idcargo = currentCargoId) {
  // tenta pegar id a partir do parâmetro, do currentCargoId ou do campo de busca
  const idRaw = idcargo ?? currentCargoId ?? searchIdCargo.value;
  const id = parseInt(idRaw, 10);

  if (isNaN(id)) {
    mostrarMensagemCargo("ID inválido para exclusão.", "warning");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir este cargo?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/cargo/${id}`, { method: "DELETE" });

    // Se o servidor retornar JSON, lê; senão ignora
    let data = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { data = await res.json(); } catch(e) { data = null; }
    }

    if (res.ok) {
      mostrarMensagemCargo((data && (data.message || data.msg)) || "Cargo excluído com sucesso!", "success");
      carregarCargos(); // atualiza lista
      limparFormularioCargo();
      mostrarBotoesCargo(true, false, false, false, false, true);
      currentCargoId = null;
    } else if (res.status === 404) {
      mostrarMensagemCargo((data && (data.error || data.message)) || "Cargo não encontrado.", "warning");
    } else {
      // tenta mostrar mensagem do servidor, senão mensagem genérica
      const serverMsg = (data && (data.error || data.message)) || `Erro ao excluir cargo (status ${res.status})`;
      mostrarMensagemCargo(serverMsg, "error");
    }
  } catch (err) {
    console.error("Erro ao excluir:", err);
    mostrarMensagemCargo("Erro de conexão ao excluir cargo", "error");
  }
}


function alterarCargo() {
  mostrarMensagemCargo('Digite os dados!', 'info');
  bloquearCamposCargo(true);
  mostrarBotoesCargo(false, false, false, false, true, true);
  document.getElementById('nomecargo').focus();
  operacaoCargo = 'alterar';
}


async function salvarOperacaoCargo() {
  const cargo = {
    idcargo: searchIdCargo.value,
    nomecargo: document.getElementById('nomecargo').value
  };

  let response = null;
  try {
    if (operacaoCargo === 'incluir') {
      response = await fetch(`${API_BASE_URL}/cargo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cargo)
      });
    } else if (operacaoCargo === 'alterar') {
      response = await fetch(`${API_BASE_URL}/cargo/${currentCargoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cargo)
      });
    } 
    if (response && response.ok) {
      mostrarMensagemCargo(`Operação ${operacaoCargo} realizada com sucesso!`, 'success');
      limparFormularioCargo();
      carregarCargos();
    } else {
      mostrarMensagemCargo('Erro na operação', 'error');
    }
  } catch (err) {
    mostrarMensagemCargo('Erro ao salvar cargo', 'error');
  }

  mostrarBotoesCargo(true, false, false, false, false, true);
  bloquearCamposCargo(false);
  searchIdCargo.focus();
}

function cancelarOperacaoCargo() {
  limparFormularioCargo();
  mostrarBotoesCargo(true, false, false, false, false, true);
  bloquearCamposCargo(false);
  searchIdCargo.focus();
  mostrarMensagemCargo('Operação cancelada', 'info');
}

async function carregarCargos() {
  try {
    const response = await fetch(`${API_BASE_URL}/cargo`);
    if (response.ok) {
      const cargos = await response.json();
      renderizarTabelaCargos(cargos);
    }
  } catch (err) {
    mostrarMensagemCargo('Erro ao carregar lista de cargos', 'error');
  }
}

function renderizarTabelaCargos(cargos) {
  cargosTableBody.innerHTML = '';
  cargos.forEach(cargo => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><button class="btn-id" onclick="selecionarCargo(${cargo.idcargo})">${cargo.idcargo}</button></td>
      <td>${cargo.nomecargo}</td>
    `;
    cargosTableBody.appendChild(row);
  });
}

async function selecionarCargo(id) {
  searchIdCargo.value = id;
  await buscarCargo();
}
