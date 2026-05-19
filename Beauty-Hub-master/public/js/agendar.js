// URLs da sua API no Render
const API_URL = "https://beauty-hub-72cv.onrender.com/api";

// Variáveis para guardar o que o usuário escolheu antes de confirmar
let profissionalSelecionadoId = null;
let dataSelecionada = null;
let horarioSelecionado = null;

// Pegar os dados do usuário logado na sessão
const usuarioLogado = JSON.parse(sessionStorage.getItem("tb_logged"));

// Executa assim que a página carregar
document.addEventListener("DOMContentLoaded", () => {
  carregarProfissionais();
  configurarCalendarioBasico();
});

// --- 1. BUSCAR E EXIBIR PROFISSIONAIS ---
async function carregarProfissionais() {
  const container = document.getElementById("profissionaisContainer");
  container.innerHTML = "<p>Carregando profissionais...</p>";

  try {
    const response = await fetch(`${API_URL}/professionals`);
    const profissionais = await response.json();

    container.innerHTML = ""; // Limpa o texto de carregando

    if (profissionais.length === 0) {
      container.innerHTML = "<p>Nenhum profissional disponível no momento.</p>";
      return;
    }

    // SUBSTITUA APENAS O TRECHO DO foreach DENTRO DE carregarProfissionais NO SEU agendar.js:
    profissionais.forEach((prof) => {
      const card = document.createElement("div");
      card.className = "professional-card";
      card.innerHTML = `
        <div class="card-avatar">
            <i class="fa-solid fa-user-tie"></i>
        </div>
        <h3>${prof.name}</h3>
        <p class="specialty">${prof.specialty || "Especialista em Beleza"}</p>
        <button class="select-prof-btn" onclick="openAgendarModal(${prof.id}, '${prof.name}')">
            Agendar Horário <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar profissionais:", error);
    container.innerHTML =
      "<p>Erro ao conectar com o servidor. Tente recarregar a página.</p>";
  }
}

// --- 2. CONTROLE DO MODAL ---
function openAgendarModal(id, nomeProf) {
  profissionalSelecionadoId = id;
  document.getElementById("modalAgendar").style.display = "flex";

  // Gerar horários estáticos de teste (9h às 17h) para o cliente clicar
  gerarHorariosTeste();
}

function closeAgendarModal() {
  document.getElementById("modalAgendar").style.display = "none";
  // Limpar seleções
  dataSelecionada = null;
  horarioSelecionado = null;
}

// --- 3. SELEÇÃO DE DATA E HORA (SIMPLIFICADA) ---
function configurarCalendarioBasico() {
  const grid = document.getElementById("calendarGrid");
  document.getElementById("monthYear").innerText = "Maio 2026";

  grid.innerHTML = "";
  // Cria 30 dias na tela para teste rápido
  for (let i = 1; i <= 30; i++) {
    const dia = document.createElement("div");
    dia.className = "calendar-day";
    dia.innerText = i;
    dia.onclick = () => {
      // Remover marcação do dia anterior
      document
        .querySelectorAll(".calendar-day")
        .forEach((d) => d.classList.remove("selected"));
      dia.classList.add("selected");
      // Formata a data para o padrão do banco (AAAA-MM-DD)
      dataSelecionada = `2026-05-${i.toString().padStart(2, "0")}`;
    };
    grid.appendChild(dia);
  }
}

function gerarHorariosTeste() {
  const grid = document.getElementById("horariosGrid");
  grid.innerHTML = "";
  const listaHorarios = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  listaHorarios.forEach((hora) => {
    const btn = document.createElement("button");
    btn.className = "time-slot";
    btn.innerText = hora;
    btn.onclick = () => {
      document
        .querySelectorAll(".time-slot")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      horarioSelecionado = hora;
    };
    grid.appendChild(btn);
  });
}

// --- 4. CONFIRMAR AGENDAMENTO NO BANCO ---
async function confirmarAgendamento() {
  // Validações antes de enviar
  if (!usuarioLogado) {
    alert(
      "⚠️ Você precisa estar logado para agendar! Voltando para o login...",
    );
    window.location.href = "login_cliente.html";
    return;
  }

  if (!profissionalSelecionadoId || !dataSelecionada || !horarioSelecionado) {
    alert(" Por favor, selecione o Profissional, o Dia e o Horário!");
    return;
  }

  const btnConfirmar = document.getElementById("confirmBtn");
  btnConfirmar.disabled = true;
  btnConfirmar.innerText = "Agendando...";

  // Montar o objeto igual ao que o seu back-end espera receber
  const dadosAgendamento = {
    client_id: usuarioLogado.id, // ID pego automaticamente da Sarah logada!
    professional_id: profissionalSelecionadoId,
    date: dataSelecionada,
    time: horarioSelecionado,
    service: "Serviço Geral", // Você pode customizar depois se tiver campo de serviço
  };

  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosAgendamento),
    });

    const data = await response.json();

    if (response.ok) {
      alert(" Horário agendado com sucesso!");
      closeAgendarModal();
      window.location.href = "meus_agendamentos.html"; // Te joga para a tela de histórico
    } else {
      alert(data.message || "Erro ao salvar o agendamento.");
      btnConfirmar.disabled = false;
      btnConfirmar.innerText = "Confirmar";
    }
  } catch (error) {
    console.error("Erro ao enviar agendamento:", error);
    alert(" Erro ao conectar com o servidor.");
    btnConfirmar.disabled = false;
    btnConfirmar.innerText = "Confirmar";
  }
}
