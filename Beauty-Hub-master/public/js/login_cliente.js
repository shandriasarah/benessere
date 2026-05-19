// Garanta que o início da sua função loginCliente declare os elementos assim:
async function loginCliente(event) {
  if (event) event.preventDefault(); // Evita que a página recarregue

  // 1. Captura os campos da tela usando os IDs corretos do seu formulário
  const emailInput =
    document.getElementById("email") ||
    document.querySelector("input[type='email']");
  const passwordInput =
    document.getElementById("password") ||
    document.querySelector("input[type='password']");

  if (!emailInput || !passwordInput) {
    console.error("Campos de entrada não foram encontrados no HTML.");
    return;
  }

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

  try {
    // 2. Faz a requisição para a rota correta do Render que confirmamos no seu server.js
    const response = await fetch(
      "https://beauty-hub-72cv.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput.value.trim().toLowerCase(), // Deixa tudo minúsculo automaticamente!
          password: passwordInput.value,
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      // Salva a sessão da Sarah logada perfeitamente na memória
      sessionStorage.setItem("tb_logged", JSON.stringify(data.user || data));
      alert("🎉 Login realizado com sucesso!");
      window.location.href = "cliente_home.html"; // Te joga para a home do salão
    } else {
      alert(data.message || "Usuário ou senha incorretos.");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao conectar com o servidor.");
  }
}
