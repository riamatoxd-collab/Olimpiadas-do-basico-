/* Venture 9.4.2 — painel gerencial das avaliações práticas.
   Consolida os registros já salvos, sem alterar XP, selos ou sincronização. */
const PRACTICAL_DASHBOARD_SHORT_LABELS = {
  lope:"LOPE", linha:"Linha", mcfritas:"McFritas", chapas:"Chapas",
  bebidas:"Bebidas", "drive-montar":"Drive · Montar",
  "drive-vendas":"Drive · Vendas", mcdelivery:"Delivery"
};
function practicalDashboardStatus(checklist, records) {
  const relevant = records.filter(function(record) {
    return record.checklistId === checklist.id || (!record.checklistId && record.stationId === checklist.stationId);
  });
  if (relevant.some(function(record) { return record.approved; })) return "approved";
  return relevant.length ? "progress" : "pending";
}
function practicalDashboardData() {
  const checklists = Array.isArray(PRACTICAL_CHECKLISTS_V94) ? PRACTICAL_CHECKLISTS_V94 : [];
  const people = Object.entries(users || {}).filter(function(entry) {
    return entry[1] && entry[1].name && !entry[1]._deleted;
  }).map(function(entry) {
    const records = practicalRecords(entry[1]);
    const statuses = checklists.map(function(checklist) {
      return {checklist:checklist,status:practicalDashboardStatus(checklist,records)};
    });
    return {
      key:entry[0],user:entry[1],statuses:statuses,records:records,
      approved:statuses.filter(function(item){return item.status==="approved";}).length,
      progress:statuses.filter(function(item){return item.status==="progress";}).length,
      pending:statuses.filter(function(item){return item.status==="pending";}).length
    };
  });
  return {checklists:checklists,people:people};
}
function practicalDashboardStatusLabel(status) {
  return status==="approved"?"Aprovado":status==="progress"?"Em desenvolvimento":"Aguardando";
}
function practicalDashboardRenderMetrics(data) {
  const target=$("practicalDashboardMetrics");if(!target)return;
  const total=data.people.length*data.checklists.length;
  const approved=data.people.reduce(function(sum,p){return sum+p.approved;},0);
  const progress=data.people.reduce(function(sum,p){return sum+p.progress;},0);
  const pending=Math.max(0,total-approved-progress),coverage=total?Math.round(approved/total*100):0;
  const cards=[
    {label:"Colaboradores",value:data.people.length,icon:"👥",tone:"people"},
    {label:"Estações aprovadas",value:approved,icon:"🏅",tone:"approved"},
    {label:"Em desenvolvimento",value:progress,icon:"📚",tone:"progress"},
    {label:"Aguardando avaliação",value:pending,icon:"⏳",tone:"pending"}
  ];
  target.innerHTML=cards.map(function(c){
    return '<article class="pdb-metric pdb-metric-'+c.tone+'"><span class="pdb-metric-icon" aria-hidden="true">'+c.icon+'</span><div><small>'+c.label+'</small><strong>'+c.value+'</strong></div></article>';
  }).join("");
  const percent=$("practicalDashboardCoverage");if(percent)percent.textContent=coverage+"%";
  const fill=$("practicalDashboardCoverageFill");if(fill)fill.style.width=coverage+"%";
  const totalLabel=$("practicalDashboardCoverageText");if(totalLabel)totalLabel.textContent=approved+" de "+total+" verificações aprovadas";
  const updated=$("practicalDashboardUpdated");
  if(updated){
    const latest=data.people.reduce(function(max,p){return Math.max(max,p.records.length?Number(p.records[0].createdAt)||0:0);},0);
    updated.textContent=latest?"Última avaliação: "+new Date(latest).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"}):"Nenhuma avaliação registrada ainda";
  }
}
function practicalDashboardRenderStations(data,selectedStation) {
  const target=$("practicalDashboardStations");if(!target)return;
  target.innerHTML=data.checklists.map(function(checklist){
    const station=PRACTICAL_STATIONS_V94.find(function(s){return s.id===checklist.stationId;})||{};
    const approved=data.people.filter(function(p){return p.statuses.some(function(x){return x.checklist.id===checklist.id&&x.status==="approved";});}).length;
    const progress=data.people.filter(function(p){return p.statuses.some(function(x){return x.checklist.id===checklist.id&&x.status==="progress";});}).length;
    const pending=Math.max(0,data.people.length-approved-progress),pct=data.people.length?Math.round(approved/data.people.length*100):0;
    const short=PRACTICAL_DASHBOARD_SHORT_LABELS[checklist.id]||checklist.label;
    const image=station.badgeImage?'<img src="'+trainerSafeHtml(station.badgeImage)+'" alt="" loading="lazy" decoding="async">':'<span aria-hidden="true">'+(station.icon||"🏅")+'</span>';
    return '<button type="button" class="pdb-station-card'+(selectedStation===checklist.id?' is-selected':'')+'" data-practical-dashboard-station="'+trainerSafeHtml(checklist.id)+'" aria-pressed="'+(selectedStation===checklist.id?'true':'false')+'"><span class="pdb-station-art">'+image+'</span><span class="pdb-station-copy"><strong>'+trainerSafeHtml(short)+'</strong><small>'+approved+' de '+data.people.length+' aprovados</small><span class="pdb-station-track"><i style="width:'+pct+'%"></i></span><span class="pdb-station-breakdown"><b>'+progress+' em desenvolvimento</b><b>'+pending+' aguardando</b></span></span></button>';
  }).join("");
}
function practicalDashboardRenderRoster(data,stationFilter,statusFilter,searchTerm) {
  const target=$("practicalDashboardRoster");if(!target)return;
  const filtered=data.people.filter(function(person){
    const haystack=(person.user.name+" "+(person.user.role||"")).toLocaleLowerCase("pt-BR");
    if(searchTerm&&!haystack.includes(searchTerm))return false;
    const relevant=stationFilter==="all"?person.statuses:person.statuses.filter(function(x){return x.checklist.id===stationFilter;});
    return statusFilter==="all"||relevant.some(function(x){return x.status===statusFilter;});
  }).sort(function(a,b){return a.approved-b.approved||b.progress-a.progress||a.user.name.localeCompare(b.user.name,"pt-BR");});
  const meta=$("practicalDashboardRosterMeta");
  if(meta)meta.textContent="Mostrando "+filtered.length+" de "+data.people.length+" colaboradores · prioridade para quem precisa de mais acompanhamento";
  if(!filtered.length){
    target.innerHTML='<div class="pdb-empty"><span aria-hidden="true">🔎</span><strong>Nenhum colaborador encontrado</strong><small>Altere os filtros ou limpe a pesquisa.</small></div>';return;
  }
  target.innerHTML=filtered.map(function(person){
    const total=data.checklists.length,pct=total?Math.round(person.approved/total*100):0;
    const initials=String(person.user.name).trim().split(/\s+/).slice(0,2).map(function(part){return part.charAt(0);}).join("").toLocaleUpperCase("pt-BR");
    const chips=person.statuses.map(function(item){
      const short=PRACTICAL_DASHBOARD_SHORT_LABELS[item.checklist.id]||item.checklist.label;
      const symbol=item.status==="approved"?"✓":item.status==="progress"?"…":"○";
      return '<span class="pdb-area-chip is-'+item.status+'" title="'+trainerSafeHtml(item.checklist.label)+': '+practicalDashboardStatusLabel(item.status)+'"><small>'+trainerSafeHtml(short)+'</small><b aria-hidden="true">'+symbol+'</b></span>';
    }).join("");
    return '<article class="pdb-person-card"><div class="pdb-person-head"><span class="pdb-avatar" aria-hidden="true">'+trainerSafeHtml(initials||"•")+'</span><span class="pdb-person-name"><strong>'+trainerSafeHtml(person.user.name)+'</strong><small>'+trainerSafeHtml(person.user.role||"Colaborador")+'</small></span><span class="pdb-person-score"><strong>'+person.approved+'/'+total+'</strong><small>aprovadas</small></span></div><span class="pdb-person-track"><i style="width:'+pct+'%"></i></span><div class="pdb-person-counts"><span class="is-approved">'+person.approved+' aprovadas</span><span class="is-progress">'+person.progress+' em desenvolvimento</span><span class="is-pending">'+person.pending+' aguardando</span></div><div class="pdb-area-chips" aria-label="Situação por estação">'+chips+'</div><button type="button" class="pdb-person-action" data-practical-dashboard-open="'+trainerSafeHtml(person.key)+'">Abrir avaliação deste colaborador <span aria-hidden="true">→</span></button></article>';
  }).join("");
}
function renderPracticalDashboard() {
  if(typeof isTrainerUnlocked==="undefined"||!isTrainerUnlocked)return;
  if(!$("practicalOverviewDashboard"))return;
  const data=practicalDashboardData(),station=$("practicalDashboardStationFilter"),status=$("practicalDashboardStatusFilter"),search=$("practicalDashboardSearch");
  practicalDashboardRenderMetrics(data);
  practicalDashboardRenderStations(data,station&&station.value||"all");
  practicalDashboardRenderRoster(data,station&&station.value||"all",status&&status.value||"all",search&&search.value?search.value.trim().toLocaleLowerCase("pt-BR"):"");
}
function resetPracticalDashboardFilters() {
  const search=$("practicalDashboardSearch"),station=$("practicalDashboardStationFilter"),status=$("practicalDashboardStatusFilter");
  if(search)search.value="";if(station)station.value="all";if(status)status.value="all";renderPracticalDashboard();
}
function openPracticalDashboardUser(key) {
  if(typeof isTrainerUnlocked==="undefined"||!isTrainerUnlocked)return;
  const select=$("practicalStaffSelect");if(!select||!users[key]||users[key]._deleted)return;
  if(!select.options.length&&typeof renderPracticalTrainerRoster==="function")renderPracticalTrainerRoster();
  select.value=key;if(select.value!==key)return;
  if(typeof renderPracticalTrainerHistory==="function")renderPracticalTrainerHistory();
  const dashboard=$("practicalDashboardDetails");if(dashboard)dashboard.open=false;
  const evaluation=$("trainerPracticalDetails");if(evaluation)evaluation.open=true;
  const form=$("trainerPracticalForm");if(form)form.scrollIntoView({behavior:"smooth",block:"start"});
}
document.addEventListener("click",function(event){
  const stationCard=event.target.closest("[data-practical-dashboard-station]");
  if(stationCard){const select=$("practicalDashboardStationFilter");if(select)select.value=stationCard.getAttribute("data-practical-dashboard-station")||"all";renderPracticalDashboard();return;}
  const openButton=event.target.closest("[data-practical-dashboard-open]");
  if(openButton)openPracticalDashboardUser(openButton.getAttribute("data-practical-dashboard-open")||"");
});
