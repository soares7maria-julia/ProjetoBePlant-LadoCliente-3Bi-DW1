const cadastroForm = document.getElementById("cadastroForm");
const btnLogin = document.getElementById("btnLogin");
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const passwordError = document.getElementById("passwordError");

// Funcionalidade de mostrar/esconder senha
togglePassword.addEventListener("click", function() {
    const type = senhaInput.getAttribute("type") === "password" ? "text" : "password";
    senhaInput.setAttribute("type", type);
    
    // Alterna o ícone
    this.textContent = type === "password" ? "👁" : "🙈";
});

// Funcionalidade de mostrar/esconder confirmar senha
toggleConfirmPassword.addEventListener("click", function() {
    const type = confirmarSenhaInput.getAttribute("type") === "password" ? "text" : "password";
    confirmarSenhaInput.setAttribute("type", type);
    
    // Alterna o ícone
    this.textContent = type === "password" ? "👁" : "🙈";
});

// Validação de senhas iguais
function validatePasswords() {
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;
    
    if (confirmarSenha && senha !== confirmarSenha) {
        passwordError.style.display = "block";
        return false;
    } else {
        passwordError.style.display = "none";
        return true;
    }
}

// Validação em tempo real
confirmarSenhaInput.addEventListener("input", validatePasswords);
senhaInput.addEventListener("input", validatePasswords);

// Adiciona efeito de enter nos inputs
document.querySelectorAll("input").forEach(input => {
    input.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            if (input === confirmarSenhaInput) {
                cadastroForm.dispatchEvent(new Event("submit"));
            } else {
                const nextInput = input.closest(".input-group").nextElementSibling?.querySelector("input");
                if (nextInput) {
                    nextInput.focus();
                }
            }
        }
    });
});

cadastroForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (!validatePasswords()) {
        return;
    }

    const nome = cadastroForm.nome.value.trim();
    const email = cadastroForm.email.value.trim();
    const senha = cadastroForm.senha.value.trim();

    if (nome && email && senha) {
        // Adiciona efeito de loading
        const submitButton = document.querySelector(".btn-cadastrar");
        submitButton.classList.add("loading");
        submitButton.disabled = true;

        fetch("http://localhost:3001/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, email, senha })
        })
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                alert("Erro: " + data.erro + " 🌿");
            } else {
                if (data.usuario) {
                    document.cookie = `usuarioLogado=${encodeURIComponent(JSON.stringify(data.usuario))}; path=/; max-age=3600`;
                    window.location.href = "../3TelaPrincipal/TPrincipal.html";
                } else {
                    alert("Cadastro realizado com sucesso! 🌱");
                    window.location.href = "../1LoginCliente/login.html";
                }
            }
        })
        .catch(err => {
            console.error("Erro ao cadastrar:", err);
            alert("Erro ao cadastrar. Tente novamente mais tarde. 🌿");
        })
        .finally(() => {
            submitButton.classList.remove("loading");
            submitButton.disabled = false;
        });
    }
});

btnLogin.addEventListener("click", () => {
    // Redireciona para a página de login
    window.location.href = "../1LoginCliente/login.html";
});

