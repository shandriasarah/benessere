// Configurações
const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "/api";

let revenueChart = null;

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadAppointments();
  loadRevenueChart();

  // Configurar botões
  document.getElementById("btnRefresh").addEventListener("click", refreshData);
  document.getElementById("btnNewBooking").addEventListener("click", () => {
    window.location.href = "agenda.html";
  });

  // Auto-refresh a cada 30 segundos
  setInterval(() => {
    loadDashboard();
    loadAppointments();
  }, 30000);
});

// Carregar dados do dashboard
async function loadDashboard() {
  try {
    const response = await fetch(`${API_BASE}/admin/dashboard`);
    const data = await response.json();

    // Atualizar cards
    document.getElementById("cardClients").textContent = data.clientsCount || 0;
    document.getElementById("cardToday").textContent =
      data.appointmentsToday || 0;
    document.getElementById("cardRevenue").textContent = formatCurrency(
      data.revenueMonth || 0,
    );
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    showNotification("Erro ao carregar dados do dashboard", "error");
  }
}

// Carregar agendamentos e adicionar à página
async function loadAppointments() {
  try {
    const response = await fetch(`${API_BASE}/admin/agendamentos`);
    const data = await response.json();
    const appointments = Array.isArray(data) ? data : [];

    // Filtrar agendamentos de hoje
    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = appointments.filter((a) =>
      a.appointment_date?.startsWith(today),
    );

    // Atualizar card de agendamentos hoje
    const cardToday = document.getElementById("cardToday");
    if (cardToday.textContent === "—") {
      cardToday.textContent = todayAppointments.length;
    }

    // Criar ou atualizar seção de agendamentos recentes
    let recentSection = document.querySelector(".appointments-section");
    if (!recentSection) {
      recentSection = createAppointmentsSection();
      document
        .querySelector(".mid")
        .insertBefore(recentSection, document.querySelector(".recent-panel"));
    }

    updateAppointmentsList(appointments.slice(0, 10)); // Últimos 10
  } catch (error) {
    console.error("Erro ao carregar agendamentos:", error);
  }
}

// Criar seção de agendamentos
function createAppointmentsSection() {
  const section = document.createElement("div");
  section.className = "appointments-section";
  section.innerHTML = `
    <h3 style="margin:0 0 12px 0;color:var(--purple-700)">Agendamentos Recentes</h3>
    <div id="appointmentsList" style="display:flex;flex-direction:column;gap:8px">
      <p style="color:#888;text-align:center;padding:20px">Carregando...</p>
    </div>
  `;
  section.style.cssText =
    "background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.05);grid-column:span 1";
  return section;
}

// Atualizar lista de agendamentos
function updateAppointmentsList(appointments) {
  const container = document.getElementById("appointmentsList");
  if (!container) return;

  if (appointments.length === 0) {
    container.innerHTML =
      '<p style="color:#888;text-align:center;padding:20px">Nenhum agendamento encontrado</p>';
    return;
  }

  container.innerHTML = appointments
    .map((app) => {
      const date = formatDate(app.appointment_date);
      const time = app.appointment_time || "N/A";
      const status = getStatusBadge(app.status);
      const price = formatCurrency(app.total_price || 0);

      return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f8f5ff;border-radius:8px;border-left:4px solid var(--purple-500)">
        <div style="flex:1">
          <div style="font-weight:600;color:var(--purple-700)">${app.client_name || "Cliente"}</div>
          <div style="font-size:0.85em;color:#666;margin-top:4px">
            ${app.service_name || "Serviço"} • ${app.professional_name || "Profissional"}
          </div>
          <div style="font-size:0.85em;color:#888;margin-top:2px">
            ${date} às ${time}
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:600;color:var(--purple-700)">${price}</div>
          <div style="margin-top:4px">${status}</div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Carregar gráfico de faturamento
async function loadRevenueChart() {
  try {
    const now = new Date();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const ano = now.getFullYear();

    const response = await fetch(`${API_BASE}/admin/faturamento/${mes}/${ano}`);
    const data = await response.json();
    const faturamento = Array.isArray(data) ? data : [];

    // Preparar dados para o gráfico
    const days = Array.from({ length: 28 }, (_, i) => {
      const day = i + 1;
      const found = faturamento.find((d) => {
        const dDate = new Date(d.appointment_date);
        return dDate.getDate() === day;
      });
      return found ? parseFloat(found.daily_total) : 0;
    });

    const labels = Array.from({ length: 28 }, (_, i) => `${i + 1}`);

    // Criar gráfico
    const ctx = document.getElementById("revenueChart").getContext("2d");

    if (revenueChart) {
      revenueChart.destroy();
    }

    revenueChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Faturamento Diário (R$)",
            data: days,
            borderColor: "#7c3aed",
            backgroundColor: "rgba(124, 58, 237, 0.1)",
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: "#7c3aed",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "R$ " + value.toFixed(2);
              },
            },
          },
          x: {
            title: {
              display: true,
              text: "Dia do Mês",
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Erro ao carregar gráfico:", error);
  }
}

// Atualizar todos os dados
function refreshData() {
  const btn = document.getElementById("btnRefresh");
  const originalText = btn.innerHTML;
  btn.innerHTML = "Atualizando...";
  btn.disabled = true;

  Promise.all([loadDashboard(), loadAppointments(), loadRevenueChart()])
    .then(() => {
      btn.innerHTML = "Atualizado!";
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 2000);
      showNotification("Dados atualizados com sucesso!", "success");
    })
    .catch(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      showNotification("Erro ao atualizar dados", "error");
    });
}

// Utilitários
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}

function getStatusBadge(status) {
  const colors = {
    confirmed: "#10b981",
    scheduled: "#f59e0b",
    cancelled: "#ef4444",
    completed: "#6b7280",
  };
  const labels = {
    confirmed: "Confirmado",
    scheduled: "Agendado",
    cancelled: "Cancelado",
    completed: "Concluído",
  };

  const color = colors[status] || "#6b7280";
  const label = labels[status] || status;

  return `<span style="display:inline-block;padding:4px 8px;border-radius:4px;font-size:0.75em;background:${color};color:white">${label}</span>`;
}

function showNotification(message, type = "info") {
  // Criar notificação simples
  const notif = document.createElement("div");
  notif.textContent = message;
  notif.style.cssText = `
    position:fixed;top:20px;right:20px;padding:12px 24px;
    border-radius:8px;color:white;font-weight:500;z-index:10000;
    background:${type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#7c3aed"};
    animation:slideIn 0.3s ease;
  `;

  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Toggle menu (se necessário)
function toggleMenu() {
  document.querySelector(".sidebar").classList.toggle("collapsed");
  document.querySelector(".main").classList.toggle("expanded");
}

// Adicionar animações CSS
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);
