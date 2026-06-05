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

async function loadProfile() {
  if (!usuarioLogado) {
    window.location.href = "login_cliente.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/clients/perfil/${usuarioLogado.id}`);
    const data = await res.json();

    if (profileName) profileName.value = data.nome || data.name || "";
    if (profileEmail) profileEmail.value = data.email || "";
    if (profilePhone) profilePhone.value = data.telefone || data.phone || "";
    if (profileAddress) profileAddress.value = data.endereco || data.address || "";
    if (profileBirth) profileBirth.value = data.data_nascimento ? data.data_nascimento.split("T")[0] : "";

    setFieldsDisabled(true);
  } catch {
    alert("Erro ao carregar perfil.");
  }
}

function setFieldsDisabled(disabled) {
  if (profileName) profileName.disabled = disabled;
  if (profilePhone) profilePhone.disabled = disabled;
  if (profileAddress) profileAddress.disabled = disabled;
  if (profileBirth) profileBirth.disabled = disabled;
  if (profileEmail) profileEmail.disabled = true;
  if (saveBtn) saveBtn.style.display = disabled ? "none" : "inline-block";
  if (editBtn) editBtn.style.display = disabled ? "inline-block" : "none";
}

if (editBtn) editBtn.addEventListener("click", () => setFieldsDisabled(false));

if (saveBtn) saveBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${API_URL}/clients/perfil/${usuarioLogado.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: profileName?.value || "",
        telefone: profilePhone?.value || "",
        endereco: profileAddress?.value || null,
        data_nascimento: profileBirth?.value || null,
      }),
    });

    if (res.ok) {
      alert("Perfil atualizado com sucesso!");
      setFieldsDisabled(true);
      usuarioLogado.nome = profileName?.value;
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
