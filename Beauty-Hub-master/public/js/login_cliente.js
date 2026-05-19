async function loginCliente(event) {
  event.preventDefault();

  const email = document
    .getElementById("loginEmail")
    .value.trim()
    .toLowerCase();
  const senha = document.getElementById("loginSenha").value;

  try {
    // Procure a linha do fetch dentro do seu login_cliente.js e ajuste para ficar assim:
    const response = await fetch(
      "https://beauty-hub-72cv.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput.value.trim().toLowerCase(),
          password: passwordInput.value,
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem("tb_logged", JSON.stringify(data.user || data));
      window.location.href = "cliente_home.html";
    } else {
      alert(data.message || "E-mail ou senha incorretos! ");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    alert(" Erro ao conectar com o servidor.");
  }
}
