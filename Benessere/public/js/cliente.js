const API_URL = "/api";

function toggleMenu() {
  document.querySelector(".sidebar").classList.toggle("closed");
}

const clientsBody = document.getElementById("clientsBody");
const emptyMsg = document.getElementById("emptyMsg");
const clientModal = document.getElementById("clientModal");
let editingClient = null;

// Carrega clientes do banco
async function carregarClientes() {
  clientsBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#888">Carregando...</td></tr>`;
  try {
    const res = await fetch(`${API_URL}/admin/usuarios`);
    const users = await res.json();
    renderClientes(users);
  } catch {
    clientsBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red">Erro ao carregar clientes.</td></tr>`;
  }
}

function renderClientes(users) {
  clientsBody.innerHTML = "";
  if (!users || users.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  users.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.name || u.nome || "-"}</td>
      <td>${u.email || "-"}</td>
      <td>${u.phone || u.telefone || "-"}</td>
      <td><span class="status ativo">Ativo</span></td>
      <td class="actions">
        <button class="btn-small delete"><i class="fa-solid fa-trash"></i> Excluir</button>
      </td>`;
    clientsBody.appendChild(tr);

    tr.querySelector(".delete").onclick = async () => {
      if (!confirm("Deseja excluir este cliente?")) return;
      await fetch(`${API_URL}/admin/usuario/${u.id}`, { method: "DELETE" });
      carregarClientes();
    };
  });
}

// Busca
document.getElementById("searchInput").oninput = () => {
  const q = document.getElementById("searchInput").value.toLowerCase();
  clientsBody.querySelectorAll("tr").forEach((tr) => {
    const name = tr.children[0]?.textContent.toLowerCase() || "";
    tr.style.display = name.includes(q) ? "table-row" : "none";
  });
};

// Novo cliente
document.getElementById("newClient").onclick = () => {
  editingClient = null;
  document.getElementById("clientName").value = "";
  document.getElementById("clientEmail").value = "";
  document.getElementById("clientPhone").value = "";
  clientModal.style.display = "flex";
};

document.getElementById("clientCancel").onclick = () => {
  clientModal.style.display = "none";
};

document.getElementById("clientSave").onclick = async () => {
  const name = document.getElementById("clientName").value;
  const email = document.getElementById("clientEmail").value;
  const phone = document.getElementById("clientPhone").value;

  if (!name || !email) {
    alert("Nome e email são obrigatórios!");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/cadastro-cliente`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: name, email, telefone: phone, senha: "senha123" }),
    });
    if (res.ok) {
      alert("Cliente cadastrado com sucesso! Senha padrão: senha123");
      clientModal.style.display = "none";
      carregarClientes();
    } else {
      const data = await res.json();
      alert("Erro: " + (data.message || "Tente novamente."));
    }
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
};

carregarClientes();
