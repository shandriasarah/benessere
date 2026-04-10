async function cadastrarCliente(event) {
  event.preventDefault(); // Impede a página de recarregar

  // Captura os elementos do formulário
  const nome = document.querySelector(
    'input[placeholder="Digite seu nome"]',
  ).value;
  const email = document.querySelector(
    'input[placeholder="Digite seu email"]',
  ).value;
  const senha = document.querySelector(
    'input[placeholder="Crie uma senha"]',
  ).value;
  const msgElemento = document.getElementById("msgCliente");

  try {
    // Envia os dados para o seu link do Render
    const response = await fetch(
      "https://beauty-hub-72cv.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nome,
          email: email,
          password: senha,
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      alert("✅ Conta criada com sucesso!");
      window.location.href = "login_cliente.html"; // Vai para a tela de login
    } else {
      msgElemento.innerText = "❌ " + (data.message || "Erro ao cadastrar");
      msgElemento.style.color = "red";
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert(
      "Erro ao conectar com o servidor. Verifique se o Render ainda está carregando.",
    );
  }
}
