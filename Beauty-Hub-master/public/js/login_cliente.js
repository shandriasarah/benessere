async function loginCliente(event) {
  event.preventDefault(); // Impede a página de recarregar
  // ... dentro da função de login, após o fetch ...
  const data = await response.json();

  if (response.ok) {
    // Salva o nome e o cargo (role) que vieram do Banco de Dados
    sessionStorage.setItem("usuarioLogado", JSON.stringify(data.user));

    // Direciona para a página certa
    if (data.user.role === "admin") {
      window.location.href = "admin_home.html";
    } else {
      window.location.href = "cliente_home.html";
    }
  }
  const email = document
    .getElementById("clienteEmail")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("clienteSenha").value;
  const msg = document.getElementById("msgCliente");

  msg.style.color = "blue";
  msg.textContent = "Verificando dados...";

  try {
    const response = await fetch(
      "https://beauty-hub-72cv.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      // Se o servidor disse que está OK (200)
      sessionStorage.setItem(
        "tb_logged",
        JSON.stringify({
          token: data.token,
          name: data.name,
          email: email,
        }),
      );

      msg.style.color = "green";
      msg.textContent = "Login realizado! Redirecionando...";
      setTimeout(() => (window.location.href = "cliente_home.html"), 1000);
    } else {
      // Se o servidor deu erro (401 ou 404)
      msg.style.color = "red";
      msg.textContent = data.message || "Email ou senha incorretos.";
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    msg.style.color = "red";
    msg.textContent = "Erro ao conectar com o servidor. Tente novamente.";
  }
}
