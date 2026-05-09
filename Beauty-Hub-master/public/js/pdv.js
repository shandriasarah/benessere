const servico=document.getElementById('servico');
const valor=document.getElementById('valor');
const recebido=document.getElementById('recebido');
const resultado=document.getElementById('resultado');
let historico=JSON.parse(localStorage.getItem('bh_history_v2')||'[]');

function toggleMenu(){document.querySelector('.sidebar').classList.toggle('closed');}

servico.addEventListener('change',()=>{
  const option=servico.options[servico.selectedIndex];
  valor.value=option.getAttribute('data-valor')||'';
  resultado.textContent='';
});

recebido.addEventListener('input',()=>{
  const preco=parseFloat(valor.value)||0;
  const pago=parseFloat(recebido.value)||0;
  const troco=pago-preco;
  if(pago>0 && preco>0){
    resultado.textContent=troco>=0?`💰 Troco: R$ ${troco.toFixed(2)}`:`⚠️ Falta receber: R$ ${(troco*-1).toFixed(2)}`;
  }else{resultado.textContent='';}
});

function registrarPagamento(){
  const nome=document.getElementById('cliente').value.trim();
  const serv=servico.value;
  const preco=parseFloat(valor.value);
  const pago=parseFloat(recebido.value);
  if(!nome||!serv||!preco||!pago){alert("Preencha todos os campos antes de registrar!");return;}
  const data=new Date().toLocaleString();
  historico.push({nome,serv,preco,pago,status:'Concluído',data});
  localStorage.setItem('bh_history_v2',JSON.stringify(historico));
  atualizarHistorico();
  alert(`✅ Pagamento registrado!\nCliente: ${nome}\nServiço: ${serv}\nValor: R$${preco.toFixed(2)}\nRecebido: R$${pago.toFixed(2)}`);
  document.getElementById('cliente').value='';
  servico.value='';
  valor.value='';
  recebido.value='';
  resultado.textContent='';
}

function atualizarHistorico(){
  const tbody=document.getElementById('historicoBody');
  tbody.innerHTML='';
  historico.forEach((h,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${h.nome}</td>
                  <td>${h.serv}</td>
                  <td>R$ ${h.pago.toFixed(2)}</td>
                  <td><span class="status ${h.status}">${h.status}</span></td>
                  <td>${h.data}</td>`;
    tbody.appendChild(tr);
  });
}

atualizarHistorico();