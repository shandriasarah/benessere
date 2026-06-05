const API_URL_CAD = "https://beauty-hub-72cv.onrender.com/api";

async function cadastrarCliente(event) {
  event.preventDefault();

  const nome = document.getElementById("cadNome").value.trim();
  const email = document.getElementById("cadEmail").value.trim().toLowerCase();
  const telefone = document.getElementById("cadTelefone")?.value.trim() || "";
  const senha = document.getElementById("cadSenha").value;
  const msg = document.getElementById("msgCliente") || document.getElementById("msgCadastro");

  if (!nome || !email || !senha) {
    msg.style.color = "red";
    msg.textContent = "Preencha todos os campos obrigatórios!";
    return;
  }

  msg.style.color = "blue";
  msg.textContent = "Cadastrando...";

  try {
    const response = await fetch(`${API_URL_CAD}/auth/cadastro-cliente`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, telefone, senha }),
    });

    const data = await response.json();

    if (response.ok) {
      msg.style.color = "green";
      msg.textContent = "Cadastro realizado com sucesso! Redirecionando...";
      setTimeout(() => { window.location.href = "login_cliente.html"; }, 2000);
    } else {
      msg.style.color = "red";
      msg.textContent = data.error || data.message || "Erro ao cadastrar. Tente novamente.";
    }
  } catch (error) {
    console.error("Erro no cadastro:", error);
    msg.style.color = "red";
    msg.textContent = "Erro ao conectar com o servidor.";
  }
}
