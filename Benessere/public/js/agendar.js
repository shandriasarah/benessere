// A bolha de isolamento começa aqui (Impede erros de duplicidade no navegador)
(() => {
  const API_URL = "/api";

  // Variáveis para guardar o que o usuário escolheu antes de confirmar
  let profissionalSelecionadoId = null;
  let profissionalSelecionadoNome = null;
  let servicoSelecionado = null;
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
    if (!container) return;

    container.innerHTML = "<p>Carregando profissionais...</p>";

    try {
      const response = await fetch(`${API_URL}/professionals`);
      const profissionais = await response.json();

      container.innerHTML = ""; // Limpa o texto de carregando

      if (profissionais.length === 0) {
        container.innerHTML =
          "<p>Nenhum profissional disponível no momento.</p>";
        return;
      }

      profissionais.forEach((prof) => {
        const card = document.createElement("div");
        card.className = "professional-card";
        card.innerHTML = `
          <div class="card-avatar">
              <i class="fa-solid fa-user-tie"></i>
          </div>
          <h3>${prof.nome}</h3>
          <p class="specialty">${prof.especialidade || "Especialista em Beleza"}</p>
          <button class="select-prof-btn" id="btn-prof-${prof.id}">
              Agendar Horário <i class="fa-solid fa-chevron-right"></i>
          </button>
        `;
        container.appendChild(card);

        // Define o clique do botão de forma segura para não depender do HTML global
        const btnNode = document.getElementById(`btn-prof-${prof.id}`);
        if (btnNode) {
          btnNode.onclick = () => openAgendarModal(prof.id, prof.nome, prof.servicos || []);
        }
      });
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
      container.innerHTML =
        "<p>Erro ao conectar com o servidor. Tente recarregar a página.</p>";
    }
  }

  // --- 2. ABRIR E FECHAR MODAL (100% PADRONIZADO) ---
  function openAgendarModal(profissionalId, profNome, servicos) {
    const modal = document.getElementById("agendarModal");
    if (modal) modal.style.display = "flex";

    profissionalSelecionadoId = profissionalId;
    profissionalSelecionadoNome = profNome;
    servicoSelecionado = null;

    // Título com nome do profissional
    const titulo = document.getElementById("modalProfTitle");
    if (titulo) titulo.textContent = "Profissional: " + profNome;

    // Renderiza serviços
    const servicosGrid = document.getElementById("servicosGrid");
    if (servicosGrid) {
      servicosGrid.innerHTML = "";
      (servicos || []).forEach((s) => {
        const btn = document.createElement("button");
        btn.textContent = `${s.name} — R$ ${Number(s.price).toFixed(2)}`;
        btn.style.cssText = "padding:9px 18px;border:1px solid #6b4f2e;border-radius:999px;background:#f8f3ea;color:#6b4f2e;cursor:pointer;font-size:13px;font-weight:500;transition:all 0.3s ease";
        btn.onclick = () => {
          servicosGrid.querySelectorAll("button").forEach(b => {
            b.style.background = "#f8f3ea";
            b.style.color = "#6b4f2e";
          });
          btn.style.background = "#6b4f2e";
          btn.style.color = "#fdfaf3";
          servicoSelecionado = { id: s.id, name: s.name, price: s.price };
        };
        servicosGrid.appendChild(btn);
      });
    }

    gerarHorariosTeste();

    const btnConfirmar = document.getElementById("confirmBtn");
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.innerText = "Confirmar";
    }

    dataSelecionada = null;
    horarioSelecionado = null;
    document
      .querySelectorAll(".calendar-day")
      .forEach((d) => d.classList.remove("selected"));
    document
      .querySelectorAll(".time-slot")
      .forEach((b) => b.classList.remove("selected"));
  }

  // Vincula as funções de abrir/fechar direto aos botões para segurança global
  window.closeAgendarModal = function () {
    const modal = document.getElementById("agendarModal");
    if (modal) modal.style.display = "none";

    const btnConfirmar = document.getElementById("confirmBtn");
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.innerText = "Confirmar";
    }
  };

  // --- 3. SELEÇÃO DE DATA E HORA ---
  // Substitua a função configurarCalendarioBasico e adicione as variáveis no topo da bolha:

  let mesAtual = new Date().getMonth(); // mês atual
  let anoAtual = new Date().getFullYear();

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  function configurarCalendarioBasico() {
    renderizarCalendario(anoAtual, mesAtual);
  }

  function renderizarCalendario(ano, mes) {
    const grid = document.getElementById("calendarGrid");
    const monthYearEl = document.getElementById("monthYear");
    if (!grid || !monthYearEl) return;

    monthYearEl.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px">
      <button onclick="mudarMes(-1)" style="background:none;border:none;font-size:18px;cursor:pointer;color:#6b4f2e">&#8249;</button>
      <span style="font-weight:700;color:#6b4f2e">${meses[mes]} ${ano}</span>
      <button onclick="mudarMes(1)" style="background:none;border:none;font-size:18px;cursor:pointer;color:#6b4f2e">&#8250;</button>
    </div>
  `;

    grid.innerHTML = "";
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const primeiroDia = new Date(ano, mes, 1).getDay(); // 0=domingo

    // Espaços vazios antes do dia 1
    for (let i = 0; i < primeiroDia; i++) {
      const vazio = document.createElement("div");
      grid.appendChild(vazio);
    }

    for (let i = 1; i <= diasNoMes; i++) {
      const dia = document.createElement("div");
      dia.className = "calendar-day";
      dia.innerText = i;

      const dataEste = new Date(ano, mes, i);
      dataEste.setHours(0, 0, 0, 0);

      // Desabilita dias passados
      if (dataEste < hoje) {
        dia.style.opacity = "0.3";
        dia.style.cursor = "not-allowed";
      } else {
        dia.onclick = () => {
          document
            .querySelectorAll(".calendar-day")
            .forEach((d) => d.classList.remove("selected"));
          dia.classList.add("selected");
          dataSelecionada = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        };
      }
      grid.appendChild(dia);
    }
  }

  window.mudarMes = function (direcao) {
    mesAtual += direcao;
    if (mesAtual > 11) {
      mesAtual = 0;
      anoAtual++;
    }
    if (mesAtual < 0) {
      mesAtual = 11;
      anoAtual--;
    }
    // Não permite voltar ao passado
    const hoje = new Date();
    if (
      anoAtual < hoje.getFullYear() ||
      (anoAtual === hoje.getFullYear() && mesAtual < hoje.getMonth())
    ) {
      mesAtual -= direcao;
      if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual++;
      }
      if (mesAtual < 0) {
        mesAtual = 11;
        anoAtual--;
      }
      return;
    }
    dataSelecionada = null;
    document
      .querySelectorAll(".calendar-day")
      .forEach((d) => d.classList.remove("selected"));
    renderizarCalendario(anoAtual, mesAtual);
  };

  function gerarHorariosTeste() {
    const grid = document.getElementById("horariosGrid");
    if (!grid) return;

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
  window.confirmarAgendamento = async function () {
    if (!usuarioLogado) {
      alert("Você precisa estar logado para agendar! Voltando para o login...");
      window.location.href = "login_cliente.html";
      return;
    }

    if (!profissionalSelecionadoId || !dataSelecionada || !horarioSelecionado) {
      alert("Por favor, selecione o Dia e o Horário antes de confirmar!");
      return;
    }

    const btnConfirmar = document.getElementById("confirmBtn");
    if (btnConfirmar) {
      btnConfirmar.disabled = true;
      btnConfirmar.innerText = "Agendando...";
    }

    if (!servicoSelecionado) {
      alert("Por favor, selecione um serviço!");
      if (btnConfirmar) { btnConfirmar.disabled = false; btnConfirmar.innerText = "Confirmar"; }
      return;
    }

    const dadosAgendamento = {
      client_id: usuarioLogado.id,
      client_name: usuarioLogado.nome || usuarioLogado.name || "",
      professional_id: profissionalSelecionadoId,
      professional_name: profissionalSelecionadoNome || "",
      service_id: servicoSelecionado.id || null,
      service_name: servicoSelecionado.name || "",
      appointment_date: dataSelecionada,
      appointment_time: horarioSelecionado,
      total_price: Number(servicoSelecionado.price) || 0,
    };

    try {
      const response = await fetch(`${API_URL}/appointments/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosAgendamento),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Horário agendado com sucesso!");
        window.closeAgendarModal();
      } else {
        // 🌟 AGORA VAI EXIBIR O DETALHE REAL:
        console.error("Detalhes do erro do servidor:", data);
        alert(
          `Erro do Servidor: ${data.error || data.message || JSON.stringify(data)}`,
        );

        if (btnConfirmar) {
          btnConfirmar.disabled = false;
          btnConfirmar.innerText = "Confirmar";
        }
      }
    } catch (error) {
      console.error("Erro ao enviar agendamento:", error);
      alert("Erro ao conectar com o servidor.");
      if (btnConfirmar) {
        btnConfirmar.disabled = false;
        btnConfirmar.innerText = "Confirmar";
      }
    }
  };
})(); // Fim da bolha de proteção
