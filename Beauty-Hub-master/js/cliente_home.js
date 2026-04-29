document.addEventListener("DOMContentLoaded", () => {
  // 1. Pega os dados que salvamos no sessionStorage na hora do login
  const logado = JSON.parse(sessionStorage.getItem("tb_logged"));

  if (logado) {
    // 2. Procura o <span> com id 'nomeUsuario' que criamos no HTML
    const campoNome = document.getElementById("nomeUsuario");

    if (campoNome) {
      // 3. Escreve o nome que veio do banco de dados
      // Usamos || para garantir que funcione se o nome vier dentro de 'user' ou direto
      campoNome.textContent = logado.name || (logado.user && logado.user.name);
    }
  } else {
    // Se tentar entrar sem logar, volta para o início
    window.location.href = "index.html";
  }
});

// Sua função de menu lateral (se você usar)
function toggleMenu() {
  document.querySelector(".sidebar").classList.toggle("active");
  document.querySelector(".main").classList.toggle("active");
}
