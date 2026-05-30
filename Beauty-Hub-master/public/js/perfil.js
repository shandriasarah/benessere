const API_URL = "https://beauty-hub-72cv.onrender.com/api";
const usuarioLogado = JSON.parse(sessionStorage.getItem("tb_logged"));

function toggleMenu() {
  document.querySelector(".sidebar").classList.toggle("closed");
}

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileAddress = document.getElementById("profileAddress");
const profileBirth = document.getElementById("profileBirth");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

// Carrega perfil do banco
async function loadProfile() {
  if (!usuarioLogado) {
    window.location.href = "login_cliente.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/clients/perfil/${usuarioLogado.id}`);
    const data = await res.json();

    profileName.value = data.name || "";
    profileEmail.value = data.email || "";
    profilePhone.value = data.phone || "";
    profileAddress.value = data.address || "";
    profileBirth.value = data.birth_date ? data.birth_date.split("T")[0] : "";

    // Desabilita campos por padrão
    setFieldsDisabled(true);
  } catch {
    alert("Erro ao carregar perfil.");
  }
}

function setFieldsDisabled(disabled) {
  profileName.disabled = disabled;
  profilePhone.disabled = disabled;
  profileAddress.disabled = disabled;
  profileBirth.disabled = disabled;
  profileEmail.disabled = true; // email nunca editável
  saveBtn.style.display = disabled ? "none" : "inline-block";
  editBtn.style.display = disabled ? "inline-block" : "none";
}

editBtn.addEventListener("click", () => setFieldsDisabled(false));

saveBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${API_URL}/clients/perfil/${usuarioLogado.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profileName.value,
        phone: profilePhone.value,
        address: profileAddress.value,
        birth_date: profileBirth.value || null,
      }),
    });

    if (res.ok) {
      alert("Perfil atualizado com sucesso!");
      setFieldsDisabled(true);
      // Atualiza nome na sessão
      usuarioLogado.name = profileName.value;
      sessionStorage.setItem("tb_logged", JSON.stringify(usuarioLogado));
    } else {
      const data = await res.json();
      alert("Erro: " + (data.error || "Tente novamente."));
    }
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
});

loadProfile();
