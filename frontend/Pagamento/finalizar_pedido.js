// ===============================
// Helpers
// ===============================
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

function getCookie(nome) {
  const cookies = document.cookie.split("; ").map(c => c.split("="));
  const encontrado = cookies.find(([key]) => key === nome);
  return encontrado ? decodeURIComponent(encontrado[1]) : null;
}


// ===============================
// Carregar itens da compra
// ===============================
async function carregarProdutos() {
  console.log("🔥 carregarProdutos() executada");

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


// ===============================
// PIX — mostrar / esconder
// ===============================
const select = document.getElementById("formaPagamento");
const pixBox = document.getElementById("pixBox");

select.addEventListener("change", () => {
  if (select.value === "pix") {
    pixBox.style.display = "block";
  } else {
    pixBox.style.display = "none";
  }
});

// Inicialmente escondido
pixBox.style.display = "none";


// ===============================
// Copiar chave PIX
// ===============================
document.getElementById("btnCopyPix").addEventListener("click", () => {
  const input = document.getElementById("pixKeyInput");
  input.select();
  input.setSelectionRange(0, 99999);

  navigator.clipboard.writeText(input.value)
    .then(() => alert("Chave PIX copiada!"))
    .catch(() => alert("Erro ao copiar a chave."));
});


// ===============================
// Confirmar Pedido → Registrar pagamento + limpar carrinho
// ===============================
document.getElementById("btnFinalizar").addEventListener("click", async () => {

  const idpessoa = getIdPessoa();
  if (!idpessoa) return alert("Erro ao identificar usuário!");

  // Pega idpedido criado no carrinho
  const idpedido = getCookie("idpedido");
  const total = getCookie("valorCompra");

  if (!idpedido || !total) {
    return alert("Erro: pedido não encontrado!");
  }

  // Verificar forma de pagamento (só PIX)
  if (select.value !== "pix") {
    return alert("Selecione PIX para prosseguir");
  }

  try {
    // ===========================
    // 1️⃣ Registrar pagamento
    // ===========================
    const pagamentoResp = await fetch("http://localhost:3001/pedido_pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idpedido,
        idpessoa,
        valortotal: total,
        formapagamento: "PIX"
      })
    });

    const pagamentoDados = await pagamentoResp.json();

    if (!pagamentoResp.ok) {
      console.error("Erro pagamento:", pagamentoDados);
      return alert("Erro ao registrar pagamento.");
    }


    // ===========================
    // 2️⃣ Limpar carrinho SOMENTE AGORA
    // ===========================
    await fetch(`http://localhost:3001/api/carrinho/pessoa/${idpessoa}`, {
      method: "DELETE"
    });

    alert("Pedido finalizado com sucesso!");

    // Opcional: apagar cookies usados
    document.cookie = "idpedido=; Max-Age=0; path=/;";
    document.cookie = "valorCompra=; Max-Age=0; path=/;";

    // Voltar ao menu
    window.location.href = "../3TelaPrincipal/menu.html";

  } catch (err) {
    console.error("Erro ao finalizar pedido:", err);
    alert("Erro interno ao finalizar pedido.");
  }

});


// ===============================
// Inicializar tela
// ===============================
carregarProdutos();
