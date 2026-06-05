const API_URL = "https://beauty-hub-72cv.onrender.com/api";

async function loginCliente(event) {
  if (event) event.preventDefault();

  const emailInput = document.getElementById("email") || document.querySelector("input[type='email']");
  const passwordInput = document.getElementById("password") || document.querySelector("input[type='password']");

  if (!emailInput || !passwordInput) {
    alert("Erro: campos não encontrados.");
    return;
  }

  const email = emailInput.value.trim().toLowerCase();
  const senha = passwordInput.value;

  if (!email || !senha) {
    alert("Preencha email e senha!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login-cliente`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem("tb_logged", JSON.stringify(data.user || data));
      alert("Login realizado com sucesso!");
      window.location.href = "cliente_home.html";
    } else {
      alert(data.error || data.message || "Email ou senha incorretos.");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao conectar com o servidor.");
  }
}
