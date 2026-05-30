const API_URL = "https://beauty-hub-72cv.onrender.com/api";

async function loginAdmin(event) {
  event.preventDefault();
  const user = document.getElementById("adminUser").value.trim();
  const senha = document.getElementById("adminSenha").value;
  const msg = document.getElementById("msgAdmin");

  try {
    const res = await fetch(`${API_URL}/auth/login-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, senha }),
    });
    const data = await res.json();

    if (res.ok) {
      sessionStorage.setItem("tb_admin_logged", JSON.stringify(data.user));
      msg.style.color = "green";
      msg.textContent = "Login realizado! Redirecionando...";
      setTimeout(() => (window.location.href = "admin_home.html"), 1000);
    } else {
      msg.style.color = "red";
      msg.textContent = data.error || "Usuário ou senha incorretos.";
    }
  } catch {
    msg.style.color = "red";
    msg.textContent = "Erro ao conectar com o servidor.";
  }
}
