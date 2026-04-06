function loginCliente(event){
  event.preventDefault();
  const email=document.getElementById('clienteEmail').value.trim().toLowerCase();
  const senha=document.getElementById('clienteSenha').value;
  const users=JSON.parse(localStorage.getItem('tb_users')||'[]');
  const msg=document.getElementById('msgCliente');
  const user=users.find(u=>u.email===email && u.senha===senha && u.role==='client');

  if(user){
    sessionStorage.setItem('tb_logged',JSON.stringify(user));
    msg.style.color='green';
    msg.textContent='Login realizado! Redirecionando...';
    setTimeout(()=>window.location.href='cliente_home.html',1000);
  }else{
    msg.style.color='red';
    msg.textContent='Email ou senha incorretos 😕';
  }
}