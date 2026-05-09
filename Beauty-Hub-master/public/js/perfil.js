function toggleMenu(){
  document.querySelector('.sidebar').classList.toggle('closed');
}

const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePhone = document.getElementById('profilePhone');
const profileAddress = document.getElementById('profileAddress');
const profileBirth = document.getElementById('profileBirth');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem('user_profile')) || {};
  profileName.value = profile.name || '';
  profileEmail.value = profile.email || '';
  profilePhone.value = profile.phone || '';
  profileAddress.value = profile.address || '';
  profileBirth.value = profile.birth || '';
}
loadProfile();

editBtn.addEventListener('click', () => {
  profileName.disabled = false;
  profileEmail.disabled = false;
  profilePhone.disabled = false;
  profileAddress.disabled = false;
  profileBirth.disabled = false;
  saveBtn.style.display = 'inline-block';
  editBtn.style.display = 'none';
});

saveBtn.addEventListener('click', () => {
  const profile = {
    name: profileName.value,
    email: profileEmail.value,
    phone: profilePhone.value,
    address: profileAddress.value,
    birth: profileBirth.value
  };
  localStorage.setItem('user_profile', JSON.stringify(profile));
  profileName.disabled = true;
  profileEmail.disabled = true;
  profilePhone.disabled = true;
  profileAddress.disabled = true;
  profileBirth.disabled = true;
  saveBtn.style.display = 'none';
  editBtn.style.display = 'inline-block';
  alert('Perfil atualizado com sucesso!');
});