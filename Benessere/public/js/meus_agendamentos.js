const API_URL = "/api";
const usuarioLogado = JSON.parse(sessionStorage.getItem("tb_logged"));

function toggleMenu() {
  document.querySelector(".sidebar").classList.toggle("closed");
}

// Formata data ISO para DD/MM/AAAA
function formatDateBR(isoDate) {
  if (!isoDate) return "-";
  return isoDate.split("T")[0].split("-").reverse().join("/");
}

// Retorna true se a data/hora ainda não passou
function isFuturo(isoDate, time) {
  const [y, m, d] = isoDate.split("T")[0].split("-").map(Number);
  const [hh, mm] = (time || "00:00")
    .replace("T", " ")
    .substring(0, 5)
    .split(":")
    .map(Number);
  return new Date(y, m - 1, d, hh, mm) >= new Date();
}

// Normaliza horário que pode vir como "HH:MM:SS" ou "HH:MM"
function formatTime(time) {
  if (!time) return "-";
  return String(time).substring(0, 5);
}

// Determina status real baseado na data
function resolveStatus(agendamento) {
  if (agendamento.status === "cancelled") return "Cancelado";
  if (isFuturo(agendamento.appointment_date, agendamento.appointment_time))
    return "Agendado";
  return "Concluído";
}

// Busca agendamentos do banco
async function carregarAgendamentos() {
  if (!usuarioLogado) {
    window.location.href = "login_cliente.html";
    return;
  }

  const tbody = document.getElementById("agendamentosBody");
  const emptyMsg = document.getElementById("emptyMsg");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#888">Carregando...</td></tr>`;

  try {
    const response = await fetch(
      `${API_URL}/appointments/meus-agendamentos/${usuarioLogado.id}`,
    );
    const agendamentos = await response.json();

    window._agendamentos = agendamentos; // guarda para filtros
    renderAgendamentos(agendamentos);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:red">Erro ao carregar agendamentos.</td></tr>`;
  }
}

function renderAgendamentos(lista) {
  const tbody = document.getElementById("agendamentosBody");
  const emptyMsg = document.getElementById("emptyMsg");
  const query = (
    document.getElementById("searchInput").value || ""
  ).toLowerCase();
  const filtroStatus = document.getElementById("filterStatus").value;

  let filtrados = lista.filter((a) => {
    const status = resolveStatus(a);
    if (filtroStatus !== "all" && status !== filtroStatus) return false;
    if (!query) return true;
    const dataBR = formatDateBR(a.appointment_date);
    return (
      (a.professional_name || "") +
      " " +
      (a.service_name || "") +
      " " +
      dataBR +
      " " +
      formatTime(a.appointment_time)
    )
      .toLowerCase()
      .includes(query);
  });

  // Ordena: futuros primeiro, depois por data
  filtrados.sort((a, b) => {
    const da = new Date(
      `${a.appointment_date.split("T")[0]}T${formatTime(a.appointment_time)}`,
    );
    const db = new Date(
      `${b.appointment_date.split("T")[0]}T${formatTime(b.appointment_time)}`,
    );
    return db - da;
  });

  tbody.innerHTML = "";

  if (filtrados.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  filtrados.forEach((a) => {
    const status = resolveStatus(a);
    const statusClass =
      status === "Agendado"
        ? "agendado"
        : status === "Cancelado"
          ? "cancelado"
          : "concluido";
    const podeEditar = status === "Agendado";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDateBR(a.appointment_date)}</td>
      <td>${formatTime(a.appointment_time)}</td>
      <td>${a.professional_name || "-"}</td>
      <td>${a.service_name || "Corte e Beleza"}</td>
      <td><span class="status ${statusClass}">${status}</span></td>
      <td class="actions">
        <button class="action-btn edit">Editar</button>
        <button class="action-btn cancel">Cancelar</button>
      </td>
    `;
    tbody.appendChild(tr);

    tr.querySelector(".edit").addEventListener("click", () =>
      abrirModalEdicao(a),
    );
    tr.querySelector(".cancel").addEventListener("click", () =>
      cancelarAgendamento(a.id),
    );
  });
}

// Cancela agendamento no banco
async function cancelarAgendamento(id) {
  if (!confirm("Deseja realmente cancelar este agendamento?")) return;
  try {
    const response = await fetch(`${API_URL}/appointments/cancelar/${id}`, {
      method: "PUT",
    });
    if (response.ok) {
      alert("Agendamento cancelado com sucesso!");
      carregarAgendamentos();
    } else {
      alert("Erro ao cancelar agendamento.");
    }
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
}

// Modal de edição simples
function abrirModalEdicao(agendamento) {
  const modal = document.getElementById("modalEdicao");
  document.getElementById("editData").value =
    agendamento.appointment_date.split("T")[0];
  document.getElementById("editHora").value = formatTime(
    agendamento.appointment_time,
  );
  document.getElementById("editId").value = agendamento.id;
  modal.style.display = "flex";
}

window.fecharModalEdicao = function () {
  document.getElementById("modalEdicao").style.display = "none";
};

window.salvarEdicao = async function () {
  const id = document.getElementById("editId").value;
  const novaData = document.getElementById("editData").value;
  const novaHora = document.getElementById("editHora").value;

  if (!novaData || !novaHora) {
    alert("Preencha data e hora!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/appointments/editar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointment_date: novaData,
        appointment_time: novaHora,
      }),
    });
    if (response.ok) {
      alert("Agendamento atualizado!");
      fecharModalEdicao();
      carregarAgendamentos();
    } else {
      alert("Erro ao atualizar agendamento.");
    }
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
};

// Filtros
document
  .getElementById("searchInput")
  .addEventListener("input", () =>
    renderAgendamentos(window._agendamentos || []),
  );
document
  .getElementById("filterStatus")
  .addEventListener("change", () =>
    renderAgendamentos(window._agendamentos || []),
  );
document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("filterStatus").value = "all";
  renderAgendamentos(window._agendamentos || []);
});

carregarAgendamentos();
