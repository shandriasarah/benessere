const API_URL_ADMIN = "https://beauty-hub-72cv.onrender.com/api";

async function loginAdmin(event) {
  event.preventDefault();
  const user = document.getElementById("adminUser").value.trim();
  const senha = document.getElementById("adminSenha").value;
  const msg = document.getElementById("msgAdmin");

  if (!user || !senha) {
    msg.style.color = "red";
    msg.textContent = "Preencha usuário e senha!";
    return;
  }

  msg.style.color = "blue";
  msg.textContent = "Entrando...";

  try {
    const response = await fetch(`${API_URL_ADMIN}/auth/login-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, senha }),
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem("tb_admin_logged", JSON.stringify(data.user || { user, role: "admin" }));
      msg.style.color = "green";
      msg.textContent = "Login realizado! Redirecionando...";
      setTimeout(() => { window.location.href = "admin_home.html"; }, 1000);
    } else {
      msg.style.color = "red";
      msg.textContent = data.error || "Usuário ou senha incorretos.";
    }
  } catch (error) {
    console.error("Erro no login admin:", error);
    // Fallback local caso servidor esteja dormindo
    if (user === "admin" && senha === "admin123") {
      sessionStorage.setItem("tb_admin_logged", JSON.stringify({ user: "admin", role: "admin" }));
      window.location.href = "admin_home.html";
    } else {
      msg.style.color = "red";
      msg.textContent = "Erro ao conectar com o servidor.";
    }
  }
}
