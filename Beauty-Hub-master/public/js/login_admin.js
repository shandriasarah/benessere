function loginAdmin(event) {
  event.preventDefault();
  const user = document.getElementById("adminUser").value.trim();
  const senha = document.getElementById("adminSenha").value;
  const msg = document.getElementById("msgAdmin");

  // Login local temporário até CORS ser resolvido
  if (user === "admin" && senha === "admin123") {
    sessionStorage.setItem(
      "tb_admin_logged",
      JSON.stringify({ user: "admin", role: "admin" }),
    );
    msg.style.color = "green";
    msg.textContent = "Login realizado! Redirecionando...";
    setTimeout(() => (window.location.href = "admin_home.html"), 1000);
  } else {
    msg.style.color = "red";
    msg.textContent = "Usuário ou senha incorretos.";
  }
}
