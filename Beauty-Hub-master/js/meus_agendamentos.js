function toggleMenu(){
  document.querySelector('.sidebar').classList.toggle('closed');
}

/* ---------- Dados iniciais / storage ---------- */
const storageKey = 'tb_bookings_list_v2';
let list = JSON.parse(localStorage.getItem(storageKey) || '[]');
if(!list || list.length === 0){
  list = [
    {date:'2025-11-05', time:'10:00', prof:'Marília Andrade', service:'Corte Feminino', status:'Agendado'},
    {date:'2025-11-07', time:'14:00', prof:'João Silva', service:'Barba Completa', status:'Agendado'},
    {date:'2025-09-12', time:'16:00', prof:'Ana Paula', service:'Manicure', status:'Concluído'}
  ];
  localStorage.setItem(storageKey, JSON.stringify(list));
}

/* ---------- Helpers ---------- */
function formatDateBR(isoDate){return isoDate.split('-').reverse().join('/');}
function isFutureOrToday(isoDate, time){
  const [y,m,d] = isoDate.split('-').map(Number);
  const [hh,mm] = (time||'00:00').split(':').map(Number);
  const dt = new Date(y,m-1,d,hh,mm,0);
  const now = new Date();
  return dt >= new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0);
}

/* ---------- Render ---------- */
const tbody = document.getElementById('agendamentosBody');
const emptyMsg = document.getElementById('emptyMsg');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const clearFiltersBtn = document.getElementById('clearFilters');

function renderAgendamentos(){
  tbody.innerHTML = '';
  const query = (searchInput.value || '').trim().toLowerCase();
  const statusFilter = filterStatus.value;
  const filtered = list.filter((b) => {
    if(statusFilter !== 'all' && b.status !== statusFilter) return false;
    if(!query) return true;
    const dateBR = formatDateBR(b.date);
    return (b.prof + ' ' + b.service + ' ' + dateBR + ' ' + b.time).toLowerCase().includes(query);
  });

  if(filtered.length === 0){
    emptyMsg.style.display = 'block';
    return;
  } else {
    emptyMsg.style.display = 'none';
  }

  filtered.sort((a,b) => new Date(`${a.date}T${a.time}:00`) - new Date(`${b.date}T${b.time}:00`));

  filtered.forEach((b) => {
    const tr = document.createElement('tr');
    let status = b.status || (isFutureOrToday(b.date,b.time) ? 'Agendado' : 'Concluído');
    if(b.status === 'Agendado' && !isFutureOrToday(b.date,b.time)) status = 'Concluído';
    const statusClass = status === 'Agendado' ? 'agendado' : (status === 'Cancelado' ? 'cancelado' : 'concluido');

    tr.innerHTML = `
      <td>${formatDateBR(b.date)}</td>
      <td>${b.time}</td>
      <td>${b.prof}</td>
      <td>${b.service}</td>
      <td><span class="status ${statusClass}">${status}</span></td>
      <td class="actions">
        <button class="btn edit">✏️</button>
        <button class="btn cancel">❌</button>
        <button class="btn reagendar" style="display:none">🔁</button>
      </td>
    `;
    tbody.appendChild(tr);

    const editBtn = tr.querySelector('.edit');
    const cancelBtn = tr.querySelector('.cancel');
    const reagendarBtn = tr.querySelector('.reagendar');

    if(status==='Concluído' || status==='Cancelado'){
      editBtn.disabled = true; cancelBtn.disabled = true;
      editBtn.style.opacity=0.5; cancelBtn.style.opacity=0.5;
      editBtn.style.cursor='not-allowed'; cancelBtn.style.cursor='not-allowed';
      if(status==='Cancelado') reagendarBtn.style.display='inline-block';
    } else {
      editBtn.addEventListener('click', ()=>{
        const newTime = prompt('Digite a nova hora (ex: 10:00):', b.time);
        if(newTime && /^\d{2}:\d{2}$/.test(newTime)){ b.time=newTime; localStorage.setItem(storageKey, JSON.stringify(list)); renderAgendamentos(); }
        else if(newTime!==null) alert('Formato inválido. Use HH:MM.');
      });
      cancelBtn.addEventListener('click', ()=>{
        if(confirm('Deseja realmente cancelar este agendamento?')){ b.status='Cancelado'; localStorage.setItem(storageKey, JSON.stringify(list)); renderAgendamentos(); }
      });
    }

    reagendarBtn.addEventListener('click', ()=>{
      const newDate = prompt('Nova data (AAAA-MM-DD):', b.date);
      if(!newDate) return;
      const newTime = prompt('Nova hora (HH:MM):', b.time);
      if(!newTime) return;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(newDate) || !/^\d{2}:\d{2}$/.test(newTime)){ alert('Formato inválido. Data: AAAA-MM-DD. Hora: HH:MM'); return; }
      b.date=newDate; b.time=newTime; b.status='Agendado';
      localStorage.setItem(storageKey, JSON.stringify(list)); renderAgendamentos();
    });
  });
}

searchInput.addEventListener('input',()=>renderAgendamentos());
filterStatus.addEventListener('change',()=>renderAgendamentos());
clearFiltersBtn.addEventListener('click',()=>{searchInput.value=''; filterStatus.value='all'; renderAgendamentos();});

renderAgendamentos();