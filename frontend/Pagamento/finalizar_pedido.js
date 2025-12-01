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
  console.log("🔥 carregarProdutos FOI EXECUTADA");

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
   const preco = Number(item.valorunitario);
const totalItem = preco * item.quantidade;
subtotal += totalItem;

lista.innerHTML += `
  <div class="produto-item">
    <div class="produto-info">
      <img src="http://localhost:3001/images/${item.imagemitem}" class="produto-img">
      <div>
        <strong>${item.nomeitem}</strong><br>
        R$ ${preco.toFixed(2)} x ${item.quantidade}
      </div>
    </div>

    <div><strong>R$ ${totalItem.toFixed(2)}</strong></div>
  </div>
`;
  });

  document.getElementById("subtotal").innerText = `R$ ${subtotal.toFixed(2)}`;
  document.getElementById("total").innerText = `R$ ${subtotal.toFixed(2)}`;
}


// ===== MOSTRAR / ESCONDER PIX =====
const select = document.getElementById("formaPagamento");
const pixBox = document.getElementById("pixBox");

select.addEventListener("change", () => {
  if (select.value === "pix") {
    pixBox.style.display = "block";
  } else {
    pixBox.style.display = "none";
  }
});

// Já exibe PIX ao carregar a página
pixBox.style.display = "block";

// ===== BOTÃO COPIAR PIX =====
document.getElementById("btnCopyPix").addEventListener("click", () => {
  const input = document.getElementById("pixKeyInput");
  input.select();
  input.setSelectionRange(0, 99999); // mobile

  navigator.clipboard.writeText(input.value)
    .then(() => {
      alert("Chave PIX copiada!");
    })
    .catch(() => {
      alert("Erro ao copiar a chave.");
    });
});


// ===== FINALIZAR PEDIDO =====
document.getElementById('btnFinalizar').addEventListener('click', async () => {
  const cpf = document.getElementById('cpfCliente').value;
  const forma = select.value;
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
  const total = itens.reduce((s, item) => s + (Number(item.valorunitario) * item.quantidade), 0);



  // 1º Criar pedido
  const pedidoResp = await fetch('http://localhost:3001/pedido', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      datapedido: new Date(),
      idpessoa,
      valortotal: total,
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
       valorunitario: Number(item.valorunitario)

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
