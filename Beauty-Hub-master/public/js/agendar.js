function toggleMenu(){ document.querySelector('.sidebar').classList.toggle('closed'); }

let agendamentos = [];
const profissionais = [
  { name:'Marília Andrade', desc:'Quem sou eu: <br> Esteticista...', img:'img/marilia.jpg', services:[ { type:'Corte', options:[ {name:'Simples',duration:'⏱️45 min',price:'💰R$80,00'}, {name:'Avançado',price:'💰R$120,00',duration:'⏱️70 min'} ] }, { type:'Manicure', options:[ {name:'Simples',duration:'⏱️30 min',price:'💰R$40',} ] }, { type:'Cílios', options:[ {name:'Clássico', duration:'⏱️90 min',price:'💰R$120,00'}, {name:'Volume Russo',price:'💰R$150,00',duration:'⏱️120 min'} ] } ] },
  { name:'João Silva', desc:'Quem sou eu: <br> Especialista...', img:'img/foto.jpg', services:[ { type:'Barba', options:[ {name:'Simples',price:'💰R$40',duration:'⏱️20 min'} ] } ] }
];

const container=document.getElementById('profissionaisContainer');
profissionais.forEach((p,index)=>{
  const card=document.createElement('div'); card.className='prof-card';
  card.innerHTML=`
    <div class="prof-header">
      <div class="prof-left">
        <img src="${p.img}" alt="${p.name}">
        <div class="prof-info">
          <h2>${p.name}</h2>
          <p>${p.desc}</p>
        </div>
      </div>
      <span class="arrow-prof">›</span>
    </div>
    <div class="services-container"></div>`;
  container.appendChild(card);

  const servicesContainer=card.querySelector('.services-container');
  p.services.forEach(s=>{
    const serviceCard=document.createElement('div'); serviceCard.className='service-card';
    serviceCard.innerHTML=`${s.type} <span class="arrow">›</span>`;
    const optionsDiv=document.createElement('div'); optionsDiv.className='service-options';
    s.options.forEach(opt=>{
      const optDiv=document.createElement('div'); optDiv.className='option-item';
      optDiv.innerHTML=`
        <div class="option-info">
          <span>${opt.name}</span>
          <span>${opt.duration}</span>
          <span>${opt.price}</span>
        </div>
        <button class="agendar-btn" onclick="openAgendarModal(${index},'${s.type}','${opt.name}')">Agendar</button>`;
      optionsDiv.appendChild(optDiv);
    });
    serviceCard.addEventListener('click',()=>{
      serviceCard.classList.toggle('active');
      optionsDiv.classList.toggle('open');
    });
    servicesContainer.appendChild(serviceCard);
    servicesContainer.appendChild(optionsDiv);
  });

  card.querySelector('.prof-header').addEventListener('click',()=>{
    card.classList.toggle('active');
    servicesContainer.classList.toggle('open');
  });
});

// Modal e Calendário
let selectedProf=null, selectedService=null, selectedOption=null, selectedDate=null, selectedTime=null;
function openAgendarModal(profIndex,serviceType,optionName){
  selectedProf=profIndex; selectedService=serviceType; selectedOption=optionName;
  document.getElementById('modalAgendar').style.display='flex';
  renderCalendar();
}
function closeAgendarModal(){
  document.getElementById('modalAgendar').style.display='none';
  selectedDate=null; selectedTime=null; 
  document.getElementById('confirmBtn').style.display='none';
}

// Calendário
const calendarGrid=document.getElementById('calendarGrid');
const monthYear=document.getElementById('monthYear');
let today=new Date(), currentMonth=today.getMonth(), currentYear=today.getFullYear();

document.getElementById('prevMonth').addEventListener('click',()=>{
  currentMonth--; if(currentMonth<0){ currentMonth=11; currentYear--; } renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click',()=>{
  currentMonth++; if(currentMonth>11){ currentMonth=0; currentYear++; } renderCalendar();
});

function renderCalendar(){
  calendarGrid.innerHTML='';
  const firstDay = new Date(currentYear,currentMonth,1).getDay();
  const daysInMonth = new Date(currentYear,currentMonth+1,0).getDate();
  monthYear.textContent = `${new Date(currentYear,currentMonth).toLocaleString('pt-br',{month:'long'})} ${currentYear}`;

  for(let i=0;i<firstDay;i++) calendarGrid.appendChild(document.createElement('div'));

  for(let d=1; d<=daysInMonth; d++){
    const dayDiv=document.createElement('div'); dayDiv.className='day';
    const date = new Date(currentYear,currentMonth,d);
    const fullDate = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    if(date.getDay()===0){ // domingo bloqueado
      dayDiv.classList.add('occupied','sunday');
    } else {
      dayDiv.classList.add('available');
      dayDiv.addEventListener('click',()=>{
        document.querySelectorAll('.day').forEach(e=>e.classList.remove('selected'));
        dayDiv.classList.add('selected');
        selectedDate = fullDate;
        renderHorarios();
      });
    }
    dayDiv.textContent=d;
    calendarGrid.appendChild(dayDiv);
  }
}

// Horários
const horarios=['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
const horariosGrid=document.getElementById('horariosGrid');

function renderHorarios(){
  horariosGrid.innerHTML='';
  horarios.forEach(h=>{
    const slotDiv=document.createElement('div'); slotDiv.className='slot';
    slotDiv.textContent=h;
    // Checa se já existe agendamento nesse horário
    const existe = agendamentos.find(a=>a.date===selectedDate && a.time===h && a.prof===selectedProf && a.service===selectedService && a.option===selectedOption);
    if(existe){ slotDiv.classList.add('occupied'); }
    else{ slotDiv.classList.add('available'); slotDiv.addEventListener('click',()=>{
      document.querySelectorAll('.slot').forEach(s=>s.classList.remove('selected'));
      slotDiv.classList.add('selected');
      selectedTime = h;
      document.getElementById('confirmBtn').style.display='block';
    });}
    horariosGrid.appendChild(slotDiv);
  });
}

// CONFIRMAR AGENDAMENTO COM WHATSAPP
function confirmarAgendamento(){
  if(selectedDate && selectedTime){
    const agendamento = {
      prof: selectedProf,
      service: selectedService,
      option: selectedOption,
      date: selectedDate,
      time: selectedTime
    };
    agendamentos.push(agendamento);

    const profName = profissionais[selectedProf].name;
    const mensagem = ` *Agendamento Confirmado* \n\n` +
                     ` Profissional: ${profName}\n` +
                     ` Serviço: ${selectedService}\n` +
                     ` Opção: ${selectedOption}\n` +
                     ` Data: ${selectedDate}\n` +
                     ` Horário: ${selectedTime}`;

    // 1️⃣ Enviar para a loja
    window.open(`https://wa.me/5581999292333?text=${encodeURIComponent(mensagem)}`, '_blank');

    alert('Agendamento confirmado e mensagem enviada via WhatsApp!');
    closeAgendarModal();
  }
}