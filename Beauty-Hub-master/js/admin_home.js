// Toggle sidebar
function toggleMenu(){ document.querySelector('.sidebar').classList.toggle('closed'); }

// Simulação de dados
const clientsCount=128,appointmentsToday=18,revenueMonth=4320;
document.getElementById('cardClients').textContent=clientsCount;
document.getElementById('cardToday').textContent=appointmentsToday;
document.getElementById('cardRevenue').textContent=`R$ ${revenueMonth.toLocaleString('pt-BR')}`;

// Chart
const ctx=document.getElementById('revenueChart').getContext('2d');
new Chart(ctx,{
  type:'line',
  data:{
    labels:['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
    datasets:[{
      label:'Faturamento (R$)',
      data:[2200,3100,2800,3500,4100,3900,4300,4700,4200,4600,4800,5000],
      borderColor:'rgba(139,92,246,0.9)',
      backgroundColor:'rgba(155,98,214,0.2)',
      fill:true,
      tension:0.4,
      pointRadius:5,
      pointBackgroundColor:'rgba(107,33,168,0.9)'
    }]
  },
  options:{
    responsive:true,
    plugins:{legend:{display:false}},
    scales:{y:{beginAtZero:true,ticks:{stepSize:1000}}}
  }
});