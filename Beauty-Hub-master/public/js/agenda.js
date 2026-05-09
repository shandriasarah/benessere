// ===== Dados =====
const LS_KEY='bh_agendamentos_v6';
let appointments=JSON.parse(localStorage.getItem(LS_KEY)||'[]');
const professionals=[
  {id:'p1',name:'Ana Paula',img:'https://i.pravatar.cc/50?img=12',services:[{name:'Corte',price:60,time:'30min'},{name:'Escova',price:70,time:'40min'},{name:'Coloração',price:120,time:'90min'}]},
  {id:'p2',name:'Marcos Lima',img:'https://i.pravatar.cc/50?img=14',services:[{name:'Barba',price:35,time:'20min'},{name:'Corte',price:55,time:'30min'}]}
];

// Marca automaticamente como concluído se a data/hora já passou
const now = new Date();
appointments.forEach(a=>{
  const [year,month,day]=a.date.split('-').map(Number);
  const [hour,minute]=a.time.split(':').map(Number);
  const dateTime=new Date(year,month-1,day,hour,minute);
  if(dateTime < now && a.status==='Agendado') a.status='Concluído';
});

if(appointments.length===0){
  appointments.push({id:'a1',prof:'Ana Paula',client:'Cliente Exemplo',service:'Corte',date:'2025-11-05',time:'10:00',price:60,status:'Agendado'});
}

function uid(){ return 'a'+Math.random().toString(36).slice(2,9);}
function formatDate(d){ return d.split('-').reverse().join('/');}
function save(){ localStorage.setItem(LS_KEY,JSON.stringify(appointments)); renderAppointmentsFiltered();}

// ===== Renderizar Agendamentos =====
const body=document.getElementById('appointmentsBody');
const emptyMsg=document.getElementById('emptyMsg');

function renderAppointmentsFiltered(){
  const query=(document.getElementById('searchInput').value||'').toLowerCase();
  const statusF=document.getElementById('filterStatus').value;
  const filtered=appointments.filter(a=>{
    if(statusF!=='all' && a.status!==statusF) return false;
    return (a.client+' '+a.service).toLowerCase().includes(query);
  });
  body.innerHTML='';
  if(filtered.length===0){ emptyMsg.style.display='block'; return;}
  emptyMsg.style.display='none';
  filtered.sort((a,b)=> a.date===b.date? a.time.localeCompare(b.time): a.date.localeCompare(b.date));
  filtered.forEach((b,i)=>{
    const tr=document.createElement('tr');
    const statusClass=b.status==='Agendado'?'agendado':(b.status==='Cancelado'?'cancelado':'concluido');
    tr.innerHTML=`<td>${formatDate(b.date)}</td><td>${b.time}</td><td>${b.client}</td><td>${b.service}</td><td><span class="status ${statusClass}">${b.status}</span></td>
      <td class="actions"><button class="btn edit">✏️</button><button class="btn cancel">❌</button><button class="btn reagendar">🔁</button></td>`;
    body.appendChild(tr);

    // Funções dos botões
    tr.querySelector('.edit').onclick=()=>{
      const appointment = appointments[i];
      modalClient.value = appointment.client;
      modalService.value = appointment.service;
      modalPrice.value = appointment.price;
      modalDate.value = appointment.date;
      modalTime.innerHTML = `<option value="${appointment.time}">${appointment.time}</option>`;
      selectedService = { prof: appointment.prof, name: appointment.service, price: appointment.price };
      modalOverlay.style.display = 'flex';
    };
    tr.querySelector('.cancel').onclick=()=>{
      if(confirm('Deseja realmente cancelar este agendamento?')){
        appointments[i].status='Cancelado';
        save();
      }
    };
    tr.querySelector('.reagendar').onclick=()=>{
      const appointment = appointments[i];
      modalClient.value = appointment.client;
      modalService.value = appointment.service;
      modalPrice.value = appointment.price;
      modalDate.value = '';
      modalTime.innerHTML = '';
      selectedService = { prof: appointment.prof, name: appointment.service, price: appointment.price };
      modalOverlay.style.display = 'flex';
    };
  });
}

document.getElementById('searchInput').addEventListener('input',renderAppointmentsFiltered);
document.getElementById('filterStatus').addEventListener('change',renderAppointmentsFiltered);
document.getElementById('clearFilters').addEventListener('click',()=>{
  document.getElementById('searchInput').value='';
  document.getElementById('filterStatus').value='all';
  renderAppointmentsFiltered();
});
renderAppointmentsFiltered();

// ===== Profissionais e Modal =====
const profContainer=document.getElementById('professionalsContainer');
let selectedService=null;
const modalOverlay=document.getElementById('modalOverlay');
const modalClient=document.getElementById('modalClient');
const modalService=document.getElementById('modalService');
const modalPrice=document.getElementById('modalPrice');
const modalDate=document.getElementById('modalDate');
const modalTime=document.getElementById('modalTime');

professionals.forEach(p=>{
  const div=document.createElement('div'); div.classList.add('prof-card');
  div.innerHTML=`<div class="prof-header"><div class="prof-left"><img src="${p.img}"><div class="prof-info"><h2>${p.name}</h2></div></div><i class="fa-solid fa-chevron-down"></i></div>
  <div class="services-container">${p.services.map(s=>`
    <div class="service-card" data-prof="${p.id}" data-name="${s.name}" data-price="${s.price}">
      ${s.name}
      <div class="service-details">
        <div>⏱️Tempo: ${s.time}</div>
        <div>💰Valor: R$ ${s.price.toFixed(2)}</div>
        <button class="agendar-btn">Agendar</button>
      </div>
    </div>`).join('')}</div>`;
  profContainer.appendChild(div);
  const header=div.querySelector('.prof-header');
  const servicesDiv=div.querySelector('.services-container');
  header.onclick=()=>servicesDiv.style.display=servicesDiv.style.display==='flex'?'none':'flex';
});

profContainer.addEventListener('click', e=>{
  if(e.target.classList.contains('agendar-btn')){
    const card=e.target.closest('.service-card');
    selectedService={prof:card.dataset.prof,name:card.dataset.name,price:card.dataset.price};
    modalService.value=selectedService.name;
    modalPrice.value=selectedService.price;
    modalClient.value=''; modalDate.value=''; modalTime.innerHTML='';
    modalOverlay.style.display='flex';
  } else {
    const card=e.target.closest('.service-card');
    if(card){
      const details=card.querySelector('.service-details');
      details.style.display=details.style.display==='flex'?'none':'flex';
    }
  }
});

modalDate.addEventListener('input',()=>{
  const date=modalDate.value;
  if(!date) return;
  const profAppointments=appointments.filter(a=>a.prof===selectedService.prof&&a.date===date).map(a=>a.time);
  const allTimes=['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];
  modalTime.innerHTML='';
  allTimes.forEach(t=>{ if(!profAppointments.includes(t)){ const opt=document.createElement('option'); opt.value=t; opt.textContent=t; modalTime.appendChild(opt); }});
});

document.getElementById('modalConfirm').onclick=()=>{
  if(!modalClient.value||!modalDate.value||!modalTime.value){ alert('Preencha todos os campos'); return;}
  appointments.push({id:uid(),prof:selectedService.prof,client:modalClient.value,service:selectedService.name,date:modalDate.value,time:modalTime.value,price:Number(selectedService.price),status:'Agendado'});
  save(); modalOverlay.style.display='none'; selectedService=null;
};
document.getElementById('modalClose').onclick=()=>{ modalOverlay.style.display='none'; selectedService=null; }

function toggleMenu(){ document.querySelector('.sidebar').classList.toggle('closed'); }