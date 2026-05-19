async function cadastrarCliente(event) {
  event.preventDefault(); // Impede a página de recarregar

  const name = document.getElementById("cadNome").value.trim();
  const email = document.getElementById("cadEmail").value.trim().toLowerCase();
  const password = document.getElementById("cadSenha").value;
  const msg = document.getElementById("msgCadastro"); // Elemento de mensagem na tela

  msg.style.color = "blue";
  msg.textContent = "Enviando dados para o servidor...";

  try {
    // Envia os dados para a sua API real no Render
    const response = await fetch(
      "https://beauty-hub-72cv.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      msg.style.color = "green";
      msg.textContent =
        "Cadastro realizado com sucesso! Redirecionando para o login...";

      // Espera 2 segundos e joga o cliente para a tela de login
      setTimeout(() => {
        window.location.href = "login_cliente.html";
      }, 2000);
    } else {
      // Se o e-mail já existir, por exemplo, o banco avisa aqui
      msg.style.color = "red";
      msg.textContent =
        data.message || "Erro ao realizar cadastro. Tente novamente.";
    }
  } catch (error) {
    console.error("Erro no cadastro:", error);
    msg.style.color = "red";
    msg.textContent = "Erro ao conectar com o servidor. Tente mais tarde.";
  }
}
