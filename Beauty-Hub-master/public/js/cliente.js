const LS_CLIENTS='bh_clients_v2';
let clients=JSON.parse(localStorage.getItem(LS_CLIENTS)||'[]');
let editingClient=null;
let editingAnamnese=null;

const clientsBody=document.getElementById('clientsBody');
const emptyMsg=document.getElementById('emptyMsg');

function renderClients(){
  clientsBody.innerHTML='';
  if(clients.length===0){ emptyMsg.style.display='block'; return; }
  emptyMsg.style.display='none';
  clients.forEach(c=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td>
      <td><span class="status ${c.status==='Ativo'?'ativo':'inativo'}">${c.status}</span></td>
      <td class="actions">
        <button class="btn-small edit">✏️ Editar</button>
        <button class="btn-small delete">❌ Excluir</button>
        <button class="btn-small anamnese">📋 Anamnese</button>
      </td>`;
    clientsBody.appendChild(tr);

    tr.querySelector('.edit').onclick=()=>{ editingClient=c; openClientModal(c); }
    tr.querySelector('.delete').onclick=()=>{ if(confirm('Deseja excluir este cliente?')){ clients=clients.filter(cli=>cli!==c); saveClients(); } }
    tr.querySelector('.anamnese').onclick=()=>{ editingAnamnese=c; openAnamneseModal(c); }
  });
}

function saveClients(){ localStorage.setItem(LS_CLIENTS,JSON.stringify(clients)); renderClients(); }

const clientModal=document.getElementById('clientModal');
const anamnesisModal=document.getElementById('anamneseModal');

document.getElementById('newClient').onclick=()=>openClientModal();

function openClientModal(c){
  clientModal.style.display='flex';
  document.getElementById('clientName').value=c?.name||'';
  document.getElementById('clientEmail').value=c?.email||'';
  document.getElementById('clientPhone').value=c?.phone||'';
  document.getElementById('clientDOB').value=c?.dob||'';
  document.getElementById('clientStatus').value=c?.status||'Ativo';
  document.getElementById('clientNotes').value=c?.notes||'';
  document.getElementById('clientAddress').value=c?.address||'';
  document.getElementById('clientProfession').value=c?.profession||'';
  document.getElementById('clientGender').value=c?.gender||'';
  document.getElementById('clientDocument').value=c?.document||'';
}
document.getElementById('clientCancel').onclick=()=>{ clientModal.style.display='none'; editingClient=null; }
document.getElementById('clientSave').onclick=()=>{
  const c={
    name:document.getElementById('clientName').value,
    email:document.getElementById('clientEmail').value,
    phone:document.getElementById('clientPhone').value,
    dob:document.getElementById('clientDOB').value,
    status:document.getElementById('clientStatus').value,
    notes:document.getElementById('clientNotes').value,
    address:document.getElementById('clientAddress').value,
    profession:document.getElementById('clientProfession').value,
    gender:document.getElementById('clientGender').value,
    document:document.getElementById('clientDocument').value,
    anamnese: editingClient?.anamnese || {}
  };
  if(editingClient){ Object.assign(editingClient,c); } else { clients.push(c); }
  saveClients();
  clientModal.style.display='none';
  editingClient=null;
}

// Anamnese
function openAnamneseModal(c){
  anamnesisModal.style.display='flex';
  document.getElementById('anamnesisHistory').value=c.anamnese?.history||'';
  document.getElementById('anamnesisTreatment').value=c.anamnese?.treatment||'';
  document.getElementById('anamnesisPast').value=c.anamnese?.pastProcedures||'';
  document.getElementById('anamnesisObservations').value=c.anamnese?.observations||'';
  document.getElementById('anamnesisLastVisit').value=c.anamnese?.lastVisit||'';
  document.getElementById('anamnesisFrequency').value=c.anamnese?.frequency||'';
  document.getElementById('anamnesisGoals').value=c.anamnese?.goals||'';

  const container=document.getElementById('photoPreviewContainer');
  container.innerHTML='';
  if(c.anamnese?.photos){
    c.anamnese.photos.forEach(src=>{
      const img=document.createElement('img');
      img.src=src; img.className='service-photo';
      container.appendChild(img);
    });
  }
}

document.getElementById('anamnesisCancel').onclick=()=>{ anamnesisModal.style.display='none'; editingAnamnese=null; }
document.getElementById('anamnesisSave').onclick=()=>{
  if(editingAnamnese){
    const files=document.getElementById('anamnesisPhoto').files;
    const photos=editingAnamnese.anamnese?.photos || [];
    for(let i=0;i<files.length;i++){
      photos.push(URL.createObjectURL(files[i]));
    }
    editingAnamnese.anamnese={
      history: document.getElementById('anamnesisHistory').value,
      treatment: document.getElementById('anamnesisTreatment').value,
      pastProcedures: document.getElementById('anamnesisPast').value,
      observations: document.getElementById('anamnesisObservations').value,
      lastVisit: document.getElementById('anamnesisLastVisit').value,
      frequency: document.getElementById('anamnesisFrequency').value,
      goals: document.getElementById('anamnesisGoals').value,
      photos
    };
  }
  saveClients();
  anamnesisModal.style.display='none';
  editingAnamnese=null;
}

// Search
document.getElementById('searchInput').oninput=()=>{ 
  const q=document.getElementById('searchInput').value.toLowerCase();
  clientsBody.querySelectorAll('tr').forEach(tr=>{
    const name=tr.children[0].textContent.toLowerCase();
    tr.style.display=name.includes(q)?'table-row':'none';
  });
}

// Toggle menu
function toggleMenu(){ document.querySelector('.sidebar').classList.toggle('closed'); }

renderClients();