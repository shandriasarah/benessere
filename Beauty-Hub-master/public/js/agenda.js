const API_URL = "https://beauty-hub-72cv.onrender.com/api";

function toggleMenu() {
  document.querySelector(".sidebar").classList.toggle("closed");
}

let professionals = [];

let selectedService = null;
let allAppointments = [];

function formatDate(iso) {
  return (iso || "").split("T")[0].split("-").reverse().join("/");
}

function formatTime(t) {
  return String(t || "").substring(0, 5);
}

function statusClass(s) {
  if (s === "scheduled") return "agendado";
  if (s === "cancelled") return "cancelado";
  return "concluido";
}

function statusLabel(s) {
  if (s === "scheduled") return "Agendado";
  if (s === "cancelled") return "Cancelado";
  return "Concluído";
}

// Carrega agendamentos do banco
async function carregarAgendamentos() {
  try {
    const res = await fetch(
      `${API_URL}/appointments/dia/${new Date().toISOString().split("T")[0]}`,
    );
    const data = await res.json();
    // Carrega todos se quiser ver histórico
    const res2 = await fetch(`${API_URL}/admin/agendamentos`);
    const data2 = await res2.json();
    allAppointments = Array.isArray(data2) ? data2 : [];
    renderAgendamentos();
  } catch (e) {
    console.error("Erro ao carregar agendamentos:", e);
    allAppointments = [];
    renderAgendamentos();
  }
}

function renderAgendamentos() {
  const body = document.getElementById("appointmentsBody");
  const emptyMsg = document.getElementById("emptyMsg");
  const query = (
    document.getElementById("searchInput").value || ""
  ).toLowerCase();
  const statusF = document.getElementById("filterStatus").value;

  let filtered = allAppointments.filter((a) => {
    const label = statusLabel(a.status);
    if (statusF !== "all" && label !== statusF) return false;
    return ((a.client_name || "") + " " + (a.service_name || ""))
      .toLowerCase()
      .includes(query);
  });

  filtered.sort((a, b) => {
    const da = new Date(
      `${a.appointment_date?.split("T")[0]}T${formatTime(a.appointment_time)}`,
    );
    const db = new Date(
      `${b.appointment_date?.split("T")[0]}T${formatTime(b.appointment_time)}`,
    );
    return da - db;
  });

  body.innerHTML = "";

  if (filtered.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  filtered.forEach((a) => {
    const tr = document.createElement("tr");
    const sc = statusClass(a.status);
    const sl = statusLabel(a.status);
    tr.innerHTML = `
      <td>${formatDate(a.appointment_date)}</td>
      <td>${formatTime(a.appointment_time)}</td>
      <td>${a.client_name || "-"}</td>
      <td>${a.service_name || "-"}</td>
      <td><span class="status ${sc}">${sl}</span></td>
      <td class="actions">
        <button class="btn edit"   title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="btn cancel" title="Cancelar"><i class="fa-solid fa-ban"></i></button>
      </td>`;
    body.appendChild(tr);

    tr.querySelector(".cancel").onclick = async () => {
      if (!confirm("Cancelar este agendamento?")) return;
      await fetch(`${API_URL}/appointments/cancelar/${a.id}`, {
        method: "PUT",
      });
      carregarAgendamentos();
    };
  });
}

document
  .getElementById("searchInput")
  .addEventListener("input", renderAgendamentos);
document
  .getElementById("filterStatus")
  .addEventListener("change", renderAgendamentos);
document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("filterStatus").value = "all";
  renderAgendamentos();
});

// Profissionais no painel lateral
const profContainer = document.getElementById("professionalsContainer");
const modalOverlay = document.getElementById("modalOverlay");
const modalClient = document.getElementById("modalClient");
const modalService = document.getElementById("modalService");
const modalPrice = document.getElementById("modalPrice");
const modalDate = document.getElementById("modalDate");
const modalTime = document.getElementById("modalTime");

async function carregarProfissionais() {
  try {
    const res = await fetch(`${API_URL}/professionals`);
    const data = await res.json();
    professionals = (Array.isArray(data) ? data : []).map((p) => ({
      id: p.id,
      name: p.nome,
      img: `https://i.pravatar.cc/50?img=${p.id + 10}`,
      especialidade: p.especialidade || "",
      services: p.servicos || [],
    }));
  } catch (e) {
    console.error("Erro ao carregar profissionais:", e);
    professionals = [];
  }
  renderProfissionais();
}

function renderProfissionais() {
  profContainer.innerHTML = "";
  if (professionals.length === 0) {
    profContainer.innerHTML = '<p style="color:#888;padding:16px">Nenhum profissional cadastrado.</p>';
    return;
  }
  professionals.forEach((p) => {
  const div = document.createElement("div");
  div.className = "prof-card";
  div.innerHTML = `
    <div class="prof-header">
      <div class="prof-left"><img src="${p.img}"><div class="prof-info"><h2>${p.name}</h2></div></div>
      <i class="fa-solid fa-chevron-down"></i>
    </div>
    <div class="services-container">
      ${p.services
        .map(
          (s) => `
        <div class="service-card" data-prof="${p.id}" data-profname="${p.name}" data-name="${s.name}" data-price="${s.price}">
          ${s.name}
          <div class="service-details">
            <div>💰 R$ ${s.price.toFixed(2)}</div>
            <button class="agendar-btn">Agendar</button>
          </div>
        </div>`,
        )
        .join("")}
    </div>`;
  profContainer.appendChild(div);
    div.querySelector(".prof-header").onclick = () => {
      const sd = div.querySelector(".services-container");
      sd.style.display = sd.style.display === "flex" ? "none" : "flex";
    };
  });
}

profContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("agendar-btn")) {
    const card = e.target.closest(".service-card");
    selectedService = {
      prof: card.dataset.prof,
      profname: card.dataset.profname,
      name: card.dataset.name,
      price: card.dataset.price,
    };
    modalService.value = selectedService.name;
    modalPrice.value = selectedService.price;
    modalClient.value = "";
    modalDate.value = "";
    modalTime.innerHTML = "";
    modalOverlay.style.display = "flex";
  } else {
    const card = e.target.closest(".service-card");
    if (card) {
      const det = card.querySelector(".service-details");
      det.style.display = det.style.display === "flex" ? "none" : "flex";
    }
  }
});

modalDate.addEventListener("input", async () => {
  const date = modalDate.value;
  if (!date || !selectedService) return;
  try {
    const res = await fetch(
      `${API_URL}/appointments/horarios-disponiveis/${selectedService.prof}/${date}`,
    );
    const data = await res.json();
    modalTime.innerHTML = "";
    (data.availableHours || []).forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      modalTime.appendChild(opt);
    });
  } catch {
    const times = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];
    modalTime.innerHTML = times
      .map((t) => `<option value="${t}">${t}</option>`)
      .join("");
  }
});

document.getElementById("modalConfirm").onclick = async () => {
  if (!modalClient.value || !modalDate.value || !modalTime.value) {
    alert("Preencha todos os campos!");
    return;
  }
  try {
    const res = await fetch(`${API_URL}/appointments/criar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: 1, // admin cria em nome do cliente
        professional_id: Number(selectedService.prof),
        service_id: 1,
        appointment_date: modalDate.value,
        appointment_time: modalTime.value,
        total_price: Number(selectedService.price),
      }),
    });
    if (res.ok) {
      alert("Agendamento criado com sucesso!");
      modalOverlay.style.display = "none";
      selectedService = null;
      carregarAgendamentos();
    } else {
      alert("Erro ao criar agendamento.");
    }
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
};

document.getElementById("modalClose").onclick = () => {
  modalOverlay.style.display = "none";
  selectedService = null;
};

carregarAgendamentos();
carregarProfissionais();
