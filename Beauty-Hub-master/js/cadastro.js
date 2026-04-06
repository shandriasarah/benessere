function cadastrarCliente(event){
  event.preventDefault();
  const nome=document.getElementById('cadNome').value.trim();
  const email=document.getElementById('cadEmail').value.trim().toLowerCase();
  const telefone=document.getElementById('cadTelefone').value.trim();
  const senha=document.getElementById('cadSenha').value;
  const msg=document.getElementById('msgCliente');

  let users=JSON.parse(localStorage.getItem('tb_users')||'[]');
  if(users.find(u=>u.email===email)){
    msg.style.color='red';
    msg.textContent='Email já cadastrado 😕';
    return;
  }

  users.push({nome,email,telefone,senha,role:'client'});
  localStorage.setItem('tb_users',JSON.stringify(users));
  msg.style.color='green';
  msg.textContent='Cadastro realizado! Redirecionando...';
  setTimeout(()=>window.location.href='login_cliente.html',1000);
}