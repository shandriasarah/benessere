const API_URL = "https://beauty-hub-72cv.onrender.com/api";

function toggleMenu() {
  document.querySelector(".sidebar").classList.toggle("closed");
}

// Verifica se admin está logado
const adminLogado = JSON.parse(sessionStorage.getItem("tb_admin_logged"));
if (!adminLogado) window.location.href = "login_admin.html";

// Carrega dados do dashboard
async function carregarDashboard() {
  try {
    const res = await fetch(`${API_URL}/admin/dashboard`);
    const data = await res.json();

    document.getElementById("cardClients").textContent = data.clientsCount || 0;
    document.getElementById("cardToday").textContent =
      data.appointmentsToday || 0;
    document.getElementById("cardRevenue").textContent =
      `R$ ${Number(data.revenueMonth || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  } catch {
    console.error("Erro ao carregar dashboard");
  }
}

// Carrega faturamento mensal para o gráfico
async function carregarGrafico() {
  const agora = new Date();
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();

  try {
    const res = await fetch(`${API_URL}/admin/faturamento/${mes}/${ano}`);
    const data = await res.json();

    const labels = data.map((d) => {
      const date = new Date(d.appointment_date);
      return `${date.getDate()}/${mes}`;
    });
    const valores = data.map((d) => Number(d.daily_total || 0));

    const ctx = document.getElementById("revenueChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Faturamento (R$)",
            data: valores,
            borderColor: "rgba(139,92,246,0.9)",
            backgroundColor: "rgba(155,98,214,0.2)",
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: "rgba(107,33,168,0.9)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  } catch {
    console.error("Erro ao carregar gráfico");
  }
}

document.getElementById("btnRefresh").addEventListener("click", () => {
  carregarDashboard();
});

carregarDashboard();
carregarGrafico();
