// ===== Helpers (mesmos do carrinho.js) =====
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



// ===== CARREGAR ITENS DO CARRINHO =====
async function carregarProdutos() {
  const idpessoa = getIdPessoa();
  if (!idpessoa) {
    alert("Você precisa estar logado!");
    return;
  }

  const lista = document.getElementById("lista-produtos");
  lista.innerHTML = "";

  const resp = await fetch(`http://localhost:3001/api/finalizar/${idpessoa}`);
  const itens = await resp.json();

  let subtotal = 0;

  itens.forEach(item => {
    const totalItem = item.preco * item.quantidade;
    subtotal += totalItem;

    lista.innerHTML += `
      <div class="produto-item">
        <div class="produto-info">
          <img src="http://localhost:3001/images/${item.imagem}" class="produto-img">
          <div>
            <strong>${item.nome}</strong><br>
            R$ ${item.preco.toFixed(2)} x ${item.quantidade}
          </div>
        </div>

        <div><strong>R$ ${totalItem.toFixed(2)}</strong></div>
      </div>
    `;
  });

  document.getElementById("subtotal").innerText = `R$ ${subtotal.toFixed(2)}`;
  document.getElementById("total").innerText = `R$ ${subtotal.toFixed(2)}`;
}



// ===== CARREGAR FORMAS DE PAGAMENTO =====
fetch('http://localhost:3001/formapagamento')
  .then(r => r.json())
  .then(dados => {
    const select = document.getElementById('formaPagamento');

    if (dados.length === 0) {
      select.innerHTML = '<option>Nenhuma forma cadastrada</option>';
      return;
    }

    dados.forEach(fp => {
      const op = document.createElement('option');
      op.value = fp.idformapagamento;
      op.textContent = fp.nome;
      select.appendChild(op);
    });
  })
  .catch(() => {
    document.getElementById('formaPagamento').innerHTML = '<option>Erro ao carregar</option>';
  });



// ===== FINALIZAR PEDIDO =====
document.getElementById('btnFinalizar').addEventListener('click', async () => {
  const cpf = document.getElementById('cpfCliente').value;
  const forma = document.getElementById('formaPagamento').value;
  const obs = document.getElementById('obs').value;
  const idpessoa = getIdPessoa();

  if (!cpf.trim()) return alert('Informe o CPF');
  if (!forma) return alert('Escolha a forma de pagamento');

  // Buscar os itens do carrinho novamente
  const itens = await fetch(`http://localhost:3001/api/finalizar/${idpessoa}`).then(r => r.json());

  if (itens.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  // Calcular total
  const total = itens.reduce((s, item) => s + (item.preco * item.quantidade), 0);


  // 1º Criar pedido
  const pedidoResp = await fetch('http://localhost:3001/pedido', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      datapedido: new Date(),
      idpessoa,
      valortotal: total,
      observacoes: obs,
      formapagamento: forma
    })
  });

  const pedido = await pedidoResp.json();


  // 2º Criar itens do pedido
  for (const item of itens) {
    await fetch('http://localhost:3001/pedido_item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idpedido: pedido.idpedido,
        iditem: item.iditem,
        quantidade: item.quantidade,
        valorunitario: item.preco
      })
    });
  }


  // 3º Limpar carrinho do usuário
  await fetch(`http://localhost:3001/api/carrinho/pessoa/${idpessoa}`, {
    method: "DELETE"
  });


  alert('Pedido finalizado com sucesso!');
  window.location.href = '/menu.html';
});


// Inicializar página
carregarProdutos();
