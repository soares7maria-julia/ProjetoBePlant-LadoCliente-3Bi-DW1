const loginForm = document.getElementById("loginForm");
const btnCadastrar = document.getElementById("btnCadastrar");
const senhaInput = document.getElementById("senha");
const togglePassword = document.getElementById("togglePassword");

// Mostrar/esconder senha
togglePassword.addEventListener("click", function () {
  const type = senhaInput.getAttribute("type") === "password" ? "text" : "password";
  senhaInput.setAttribute("type", type);
  this.textContent = type === "password" ? "👁" : "🙈";
});

// Enviar login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.email.value.trim();
  const senha = loginForm.senha.value.trim();

  if (!email) {
    alert("Por favor, insira o e-mail.");
    return;
  }
  if (!senha) {
    alert("Por favor, insira a senha.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();
if (data.sucesso) {
  console.log("Resposta de login:", data); // debug: veja o que o servidor retornou


  if (data.usuario) {
  // Salva o objeto inteiro (idpessoa, nomepessoa, emailpessoa...)
  document.cookie = `usuarioLogado=${encodeURIComponent(JSON.stringify(data.usuario))}; path=/; max-age=3600`;
}

  window.location.href = "../3TelaPrincipal/menu.html";
} else {
  alert(data.erro || "Credenciais inválidas");
}
  } catch (err) {
    console.error("Erro ao tentar login:", err);
    alert("Erro de conexão. Tente novamente mais tarde.");
  }
});



// Ir para cadastro
btnCadastrar.addEventListener("click", () => {
  window.location.href = "../2CadastroCliente/CadastroCliente.html"; // ajuste conforme sua estrutura
});
