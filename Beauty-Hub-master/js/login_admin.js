function loginAdmin(event){
  event.preventDefault();
  const user=document.getElementById('adminUser').value.trim();
  const senha=document.getElementById('adminSenha').value;

  const admins = JSON.parse(localStorage.getItem('tb_admins') || '[]');
  if(admins.length===0){
    admins.push({user:'admin', senha:'1234'});
    localStorage.setItem('tb_admins', JSON.stringify(admins));
  }

  const logged = admins.find(a => a.user === user && a.senha === senha);
  const msg = document.getElementById('msgAdmin');

  if(logged){
    sessionStorage.setItem('tb_admin_logged', JSON.stringify(logged));
    msg.style.color='green';
    msg.textContent='Login realizado! Redirecionando...';
    setTimeout(()=> window.location.href='admin_home.html',1000);
  } else {
    msg.style.color='red';
    msg.textContent='Usuário ou senha incorretos 😕';
  }
}