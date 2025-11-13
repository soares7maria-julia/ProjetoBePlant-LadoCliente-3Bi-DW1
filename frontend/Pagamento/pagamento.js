// Preenche anos automaticamente
const anoSelect = document.getElementById('anoExpiracao');
const anoAtual = new Date().getFullYear();
for (let i = 0; i < 10; i++) {
  const option = document.createElement('option');
  option.value = anoAtual + i;
  option.text = anoAtual + i;
  anoSelect.appendChild(option);
}

// Exibe o valor do carrinho se disponível
function getCookie(nome) {
  const cookies = document.cookie.split("; ");
  for (const c of cookies) {
    const [key, value] = c.split("=");
    if (key === nome) return value;
  }
  return null;
}

const valor = getCookie("valorCompra");

const valorElemento = document.getElementById('valorCompra');
if (valor) {
  valorElemento.textContent = `Valor total: R$ ${parseFloat(valor).toFixed(2)}`;
} else {
  valorElemento.textContent = "Valor da compra não encontrado.";
}


// Formata o número do cartão em tempo real
document.getElementById('numeroCartao').addEventListener('input', (e) => {
  e.target.value = e.target.value
    .replace(/\D/g, '')
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
});

// Envio simulado
document.getElementById('formPagamento').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Pagamento processado com sucesso! 🌿');
 document.cookie = "valorCompra=; path=/; max-age=0";

});
