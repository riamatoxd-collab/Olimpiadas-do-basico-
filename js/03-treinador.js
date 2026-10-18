/* Venture 8.8 · js/03-treinador.js · arquivo carregado na ordem indicada no HTML. */
// ========================================================================
// 🎓 CENTRAL DO TREINADOR v8.3 — perguntas extras, aviso e desafio.
// Salva separadamente: não altera os dados legados nem QUESTIONS_DB original.
// ========================================================================
function readTrainerState() {
  try {
    const item = JSON.parse(localStorage.getItem(TRAINER_STORAGE_KEY) || '{}');
    return { questions:item.questions && typeof item.questions === 'object' ? item.questions : {},
      announcement:item.announcement || null, challenge:item.challenge || null, xpMode:item.xpMode || null };
  } catch (_) { return {questions:{},announcement:null,challenge:null,xpMode:null}; }
}
let trainerState = readTrainerState();
let isTrainerUnlocked = false;
let trainerCloudFetchAt = 0;
function trainerSafeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function validateTrainerQuestion(q) {
  return q && typeof q.id === 'string' && /^T-[a-z0-9-]{1,60}$/.test(q.id) &&
    ['Básico','Intermediário','Avançado'].includes(q.level) &&
    typeof q.q === 'string' && q.q.length > 5 && q.q.length <= 550 &&
    typeof q.a === 'string' && q.a.length > 0 && q.a.length <= 220 &&
    Array.isArray(q.w) && q.w.length === 3 && q.w.every(s=>typeof s === 'string' && s.length>0 && s.length<=220);
}
function getQuestionBank() {
  const extras = Object.values(trainerState.questions).filter(q=>q && !q.deleted && validateTrainerQuestion(q));
  return [...QUESTIONS_DB, ...extras];
}
function mergeTrainerState(incoming) {
  if (!incoming || typeof incoming !== 'object') return false;
  let changed = false;
  const questions = incoming.questions && typeof incoming.questions === 'object' ? incoming.questions : {};
  Object.entries(questions).forEach(([id, q]) => {
    if (!/^T-[a-z0-9-]{1,60}$/.test(id) || !q || q.id !== id || (!q.deleted && !validateTrainerQuestion(q))) return;
    const existing=trainerState.questions[id];
    if (!existing || (Number(q.updatedAt)||0) > (Number(existing.updatedAt)||0)) {
      trainerState.questions[id]=q; changed=true;
    }
  });
  for (const key of ['announcement','challenge','xpMode']) {
    const old=trainerState[key], next=incoming[key];
    if (!next || typeof next !== 'object' || !Number.isFinite(Number(next.updatedAt))) continue;
    if (key === 'xpMode' && ![1,2].includes(next.multiplier)) continue;
    if (!old || Number(next.updatedAt)>Number(old.updatedAt)) {trainerState[key]=next; changed=true;}
  }
  if (changed) {
    localStorage.setItem(TRAINER_STORAGE_KEY,JSON.stringify(trainerState));
    renderXpModeStatus();
    renderTrainerPublicContent(); renderTrainerCenter();
    if ($('bookQuestionsContainer')) renderBookList();
  }
  return changed;
}
function publishTrainerState(delta = null) {
  localStorage.setItem(TRAINER_STORAGE_KEY,JSON.stringify(trainerState));
  const data=JSON.stringify(trainerState);
  mqttClients.forEach(c=>{ if(c && c.connected) try {c.publish(TRAINER_MQTT_TOPIC,data,{retain:true});}catch(_){}});
  fetch(TRAINER_HTTP_URL,{method:'POST',body:JSON.stringify({type:'trainer',state:delta || trainerState})}).catch(()=>{});
  renderXpModeStatus();
  renderTrainerPublicContent(); renderTrainerCenter(); renderBookList();
}
async function fetchTrainerHistory(force=false) {
  if (!force && Date.now()-trainerCloudFetchAt<30000) return;
  trainerCloudFetchAt=Date.now();
  try {
    const res=await fetch(`${TRAINER_HTTP_URL}/json?poll=1&since=all`);
    if (!res.ok) return;
    (await res.text()).trim().split('\n').forEach(line=>{
      try {const msg=JSON.parse(line); if (msg.event==='message' && msg.message) {
        const data=JSON.parse(msg.message); if(data.type==='trainer') mergeTrainerState(data.state);
      }} catch (_) {}
    });
  }catch(_){}
}
function trainerChallengeActive() {
  const c=trainerState.challenge;
  return c && !c.deleted && typeof c.id==='string' && /^C-[a-z0-9-]+$/.test(c.id) &&
    typeof c.title==='string' && Number.isInteger(c.target) && c.target>=1 && c.target<=100 &&
    Number.isInteger(c.xp) && c.xp>=0 && c.xp<=100 ? c : null;
}
function mergeTrainerChallenges(a,b) {
  const out={...(a && typeof a==='object'?a:{})};
  Object.entries(b && typeof b==='object'?b:{}).forEach(([k,v])=>{
    if (!v || typeof v!=='object') return;
    const old=out[k]||{};
    out[k]={count:Math.max(Number(old.count)||0, Number(v.count)||0),
      claimedAt:Math.max(Number(old.claimedAt)||0, Number(v.claimedAt)||0)};
  });
  return out;
}
function recordTrainerChallengeCorrect() {
  if (!currentUserKey || !users[currentUserKey]) return;
  const challenge=trainerChallengeActive();
  if (!challenge) return;
  const u=users[currentUserKey];
  if (!u.trainerChallenges) u.trainerChallenges={};
  const progress=u.trainerChallenges[challenge.id] || {count:0,claimedAt:0};
  if (progress.claimedAt) return;
  progress.count=Math.min(challenge.target, Math.max(0,Number(progress.count)||0)+1);
  u.trainerChallenges[challenge.id]=progress;
  if (progress.count>=challenge.target) {
    progress.claimedAt=Date.now(); // grava antes de dar o bônus
    u.updatedAt=Date.now();
    const awarded=challenge.xp ? addXp(challenge.xp) : 0;
    if(!challenge.xp) scheduleCloudSync(currentUserKey,false);
    showMissionToast(`🎯 Desafio ${challenge.title} concluído! +${awarded} XP`);
  } else {u.updatedAt=Date.now();scheduleCloudSync(currentUserKey,false);}
  renderTrainerPublicContent();
}
function renderTrainerPublicContent() {
  const a=trainerState.announcement, notice=$('trainerPublicNotice');
  if (notice) {
    const shown=a && !a.deleted && typeof a.title==='string' && typeof a.body==='string';
    notice.classList.toggle('hidden',!shown);
    if (shown) {$('trainerNoticeTitle').textContent=a.title;$('trainerNoticeBody').textContent=a.body;}
  }
  const card=$('trainerSpecialChallenge'); if(!card) return;
  const c=trainerChallengeActive(), user=currentUserKey && users[currentUserKey];
  card.classList.toggle('hidden',!c);
  if (!c) return;
  const progress=user?.trainerChallenges?.[c.id]||{};
  const count=Math.min(c.target,Math.max(0,Number(progress.count)||0));
  const claimed=Boolean(progress.claimedAt);
  const pct=Math.round(100*count/c.target);
  card.innerHTML=`<div class="trainer-challenge-head"><span>✨ DESAFIO ESPECIAL DO TREINADOR</span><strong>${claimed?'✅ Concluído':`+${c.xp} XP`}</strong></div>
    <h3>${trainerSafeHtml(c.title)}</h3><p>${trainerSafeHtml(c.description||'Acerte perguntas no simulado para completar.')}</p>
    <div class="trainer-challenge-track"><span style="width:${pct}%"></span></div>
    <div class="trainer-challenge-bottom"><small>${user?`${count} de ${c.target} acertos`:'Faça login para participar'}</small><button type="button" onclick="switchMainTab('quiz')">Ir ao Simulado →</button></div>`;
}
function unlockTrainerCenter() {
  if ($('trainerPassInput').value !== ADMIN_SECRET_PASS) {
    const e=$('trainerAuthError');e.textContent='Senha incorreta. Use a credencial do administrador.';e.classList.remove('hidden'); return;
  }
  isTrainerUnlocked=true;
  $('trainerPassInput').value=''; $('trainerAuthError').classList.add('hidden');
  $('trainerLockScreen').classList.add('hidden'); $('trainerDashboard').classList.remove('hidden');
  renderPracticalChecklist();renderTrainerCenter();fetchTrainerHistory(true);
}
function lockTrainerCenter() {
  isTrainerUnlocked=false;
  $('trainerDashboard').classList.add('hidden'); $('trainerLockScreen').classList.remove('hidden');
}
function clearTrainerQuestionForm() {
  $('trainerQuestionForm').reset();$('trainerEditQuestionId').value='';
  $('trainerSaveQuestionBtn').textContent='Publicar pergunta';
}
function saveTrainerQuestion(event) {
  event.preventDefault();if(!isTrainerUnlocked)return;
  const options='ABCD'.split('').map(x=>$('trainerAnswer'+x).value.trim());
  const correct='ABCD'.indexOf($('trainerCorrectAnswer').value);
  const q=$('trainerQuestionText').value.trim();
  if(q.length<6 || options.some(x=>!x) || new Set(options.map(x=>x.toLocaleLowerCase('pt-BR'))).size!==4) {
    alert('Preencha uma pergunta válida e quatro alternativas diferentes.');return;
  }
  const oldId=$('trainerEditQuestionId').value;
  const id=oldId || `T-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  trainerState.questions[id]={id,level:$('trainerQuestionLevel').value,q,a:options[correct],w:options.filter((_,i)=>i!==correct),options,correctKey:'ABCD'[correct],updatedAt:Date.now(),deleted:false};
  clearTrainerQuestionForm();publishTrainerState({questions:{[id]:trainerState.questions[id]}});
}
function editTrainerQuestion(id) {
  if(!isTrainerUnlocked)return;
  const item=trainerState.questions[id];if(!item || item.deleted)return;
  $('trainerEditQuestionId').value=id;$('trainerQuestionText').value=item.q;$('trainerQuestionLevel').value=item.level;
  (item.options?.length===4?item.options:[item.a,...item.w]).forEach((x,i)=>{$('trainerAnswer'+'ABCD'[i]).value=x;});
  $('trainerCorrectAnswer').value=item.correctKey||'A';$('trainerSaveQuestionBtn').textContent='Salvar alterações';
  $('trainerQuestionForm').scrollIntoView({behavior:'smooth',block:'center'});
}
function removeTrainerQuestion(id) {
  if(!isTrainerUnlocked || !trainerState.questions[id] || !confirm('Excluir esta pergunta extra?')) return;
  trainerState.questions[id]={...trainerState.questions[id],deleted:true,updatedAt:Date.now()};
  if($('trainerEditQuestionId').value===id)clearTrainerQuestionForm();
  publishTrainerState({questions:{[id]:trainerState.questions[id]}});
}
function saveTrainerAnnouncement(event) {
  event.preventDefault();if(!isTrainerUnlocked)return;
  const title=$('trainerAnnouncementTitle').value.trim(), body=$('trainerAnnouncementBody').value.trim();
  if(!title || !body)return;
  trainerState.announcement={title,body,updatedAt:Date.now(),deleted:false};publishTrainerState({announcement:trainerState.announcement});
}
function removeTrainerAnnouncement() {
  if(!isTrainerUnlocked || !confirm('Retirar o comunicado atual?'))return;
  trainerState.announcement={deleted:true,updatedAt:Date.now()};
  $('trainerAnnouncementTitle').value='';$('trainerAnnouncementBody').value='';publishTrainerState({announcement:trainerState.announcement});
}
function saveTrainerChallenge(event) {
  event.preventDefault();if(!isTrainerUnlocked)return;
  const target=Number($('trainerChallengeTarget').value),xp=Number($('trainerChallengeXp').value);
  const title=$('trainerChallengeTitle').value.trim(),description=$('trainerChallengeDescription').value.trim();
  if(!Number.isInteger(target)||target<1||target>100||!Number.isInteger(xp)||xp<0||xp>100||!title)return alert('Meta de 1 a 100 acertos, bônus de 0 a 100 XP.');
  if(trainerChallengeActive() && !confirm('Publicar um novo desafio encerra o anterior. Continuar?'))return;
  trainerState.challenge={id:`C-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,title,description,target,xp,updatedAt:Date.now(),deleted:false};
  publishTrainerState({challenge:trainerState.challenge});
}
function removeTrainerChallenge() {
  if(!isTrainerUnlocked || !confirm('Encerrar o desafio atual?'))return;
  trainerState.challenge={deleted:true,updatedAt:Date.now()};publishTrainerState({challenge:trainerState.challenge});
}
function renderTrainerCenter() {
  if(!isTrainerUnlocked || !$('trainerQuestionList'))return;
  const items=Object.values(trainerState.questions).filter(x=>x&&!x.deleted&&validateTrainerQuestion(x)).sort((a,b)=>b.updatedAt-a.updatedAt);
  $('trainerQuestionCount').textContent=String(items.length);
  $('trainerAnnouncementStatus').textContent=trainerState.announcement&&!trainerState.announcement.deleted?'Ativo':'Inativo';
  $('trainerChallengeStatus').textContent=trainerChallengeActive()?'Ativo':'Inativo';
  $('trainerQuestionList').innerHTML=items.length?items.map(x=>`<article class="trainer-question-row">
    <div><span>${trainerSafeHtml(x.level)} · Extra</span><strong>${trainerSafeHtml(x.q)}</strong><small>✅ ${trainerSafeHtml(x.a)}</small></div>
    <div class="trainer-row-actions"><button type="button" data-trainer-edit="${x.id}">Editar</button><button type="button" data-trainer-delete="${x.id}">Excluir</button></div>
  </article>`).join(''):'<p class="trainer-help">Nenhuma pergunta extra publicada ainda.</p>';
  renderPracticalTrainerRoster();
  const a=trainerState.announcement;
  if(a && !a.deleted) {$('trainerAnnouncementTitle').value=a.title||'';$('trainerAnnouncementBody').value=a.body||'';}
}
document.addEventListener('click',ev=>{
  const edit=ev.target.closest('[data-trainer-edit]');
  const del=ev.target.closest('[data-trainer-delete]');
  if(edit)editTrainerQuestion(edit.dataset.trainerEdit);
  if(del)removeTrainerQuestion(del.dataset.trainerDelete);
});
// ============================================================================
// v8.6 — AVALIAÇÃO PRÁTICA POR ESTAÇÃO (registrada, sem XP)
// Cadastro legado continua intacto; campo opcional por usuário.
// AVISO: a autenticação e o armazenamento compartilhado atuais são client-side;
// estes selos são registros internos, não assinaturas/certificações invioláveis.
// ============================================================================
const PRACTICAL_STATIONS = [
  {id:'chapa',icon:'🔥',label:'Chapa',criteria:['Apresentou cuidados de higiene e segurança da estação','Preparou os recursos e manteve a área organizada','Demonstrou a sequência correta conforme orientação local','Concluiu a atividade com limpeza e conferência']},
  {id:'linha',icon:'🍔',label:'Linha / Montagem',criteria:['Higienizou as mãos e organizou os ingredientes','Conferiu a composição e a sequência de montagem','Demonstrou cuidado com tempo e apresentação','Conferiu o pedido antes da entrega']},
  {id:'fritura',icon:'🍗',label:'Produtos Fritos',criteria:['Utilizou EPIs e seguiu a segurança da estação','Identificou corretamente os produtos e utensílios','Executou os procedimentos conforme treinamento','Respeitou a organização e o descarte adequado']},
  {id:'batatas',icon:'🍟',label:'McFritas',criteria:['Preparou a estação respeitando a segurança','Demonstrou o fluxo correto do preparo','Conferiu a apresentação e o padrão do produto','Manteve a estação limpa e organizada']},
  {id:'balcao',icon:'🥤',label:'Balcão / Atendimento',criteria:['Recebeu e confirmou o pedido com atenção','Demonstrou comunicação e acolhimento','Conferiu itens e necessidades do pedido','Finalizou o atendimento de forma cuidadosa']},
  {id:'drive',icon:'🚗',label:'Drive-Thru',criteria:['Demonstrou comunicação clara com o cliente','Confirmou o pedido e eventuais alterações','Conferiu os itens no fluxo de entrega','Aplicou orientações de agilidade com segurança']},
  {id:'lope',icon:'🧽',label:'LOPE',criteria:['Demonstrou hábitos de higiene e segurança','Organizou e identificou os materiais corretamente','Executou tarefas conforme o treinamento local','Finalizou com conferência e organização']}
];
function validPracticalRecord(r) {
  return Boolean(r && typeof r==='object' && /^P-[a-z0-9-]{6,55}$/.test(r.id||'') &&
    PRACTICAL_STATIONS.some(s=>s.id===r.stationId) &&
    typeof r.evaluator==='string' && r.evaluator.length>=2 && r.evaluator.length<=70 &&
    typeof r.notes==='string' && r.notes.length<=350 &&
    Number.isFinite(Number(r.createdAt)) && Number(r.createdAt)>1600000000000 &&
    Array.isArray(r.checks) && r.checks.length===4 && r.checks.every(x=>typeof x==='boolean') &&
    r.approved===r.checks.every(Boolean));
}
function practicalRecords(user) {
  const recs=user?.practicalAssessments?.records;
  return Object.values(recs && typeof recs==='object'&&!Array.isArray(recs)?recs:{})
    .filter(validPracticalRecord).sort((a,b)=>b.createdAt-a.createdAt);
}
function mergePracticalAssessments(a,b) {
  const records={};
  for (const src of [a,b]) {
    const dict=src && typeof src==='object'?src.records:null;
    if (!dict || typeof dict!=='object') continue;
    for (const [id,r] of Object.entries(dict)) {
      if (id!==r?.id || !validPracticalRecord(r)) continue;
      // Avaliações são imutáveis: mesclagem é aditiva, não apaga o histórico.
      if (!records[id]) records[id]=r;
    }
  }
  return {records};
}
function practicalApprovedStations(user) {
  const map={};
  for (const r of practicalRecords(user)) if(r.approved && !map[r.stationId]) map[r.stationId]=r;
  return map;
}
function practicalBadgeMarkup(user,showLocked) {
  const earned=practicalApprovedStations(user);
  return PRACTICAL_STATIONS.filter(s=>showLocked || earned[s.id]).map(s=>{
    const record=earned[s.id];
    return `<div class="practical-badge ${record?'is-approved':'is-pending'}"><span aria-hidden="true">${record?s.icon:'🔒'}</span><strong>${trainerSafeHtml(s.label)}</strong><small>${record?'✅ Aprovado · '+premiumDate(record.createdAt):'Ainda não aprovado'}</small></div>`;
  }).join('') || '<p class="practical-empty">Nenhum selo prático conquistado ainda.</p>';
}
function practicalHistoryMarkup(user,limit=10) {
  const records=practicalRecords(user).slice(0,limit);
  if(!records.length) return '<p class="trainer-help">Nenhuma avaliação registrada para este colaborador.</p>';
  return records.map(r=>{
    const station=PRACTICAL_STATIONS.find(s=>s.id===r.stationId);
    return `<article class="practical-history-entry"><div class="practical-entry-top"><strong>${station.icon} ${trainerSafeHtml(station.label)}</strong><span class="${r.approved?'practical-pass':'practical-retry'}">${r.approved?'✅ Aprovado':'📚 Em desenvolvimento'}</span></div><small>${premiumDate(r.createdAt)} · Avaliador: ${trainerSafeHtml(r.evaluator)} · ${r.checks.filter(Boolean).length}/4 critérios</small>${r.notes?`<p>${trainerSafeHtml(r.notes)}</p>`:''}</article>`;
  }).join('');
}
function renderPracticalInProfiles(user,publicView=false) {
  if(!user)return;
  const earned=practicalApprovedStations(user);
  const count=Object.keys(earned).length;
  if(publicView) {
    const summary=$('publicPracticalSummary');if(summary)summary.textContent=`${count}/${PRACTICAL_STATIONS.length} estações`;
    const badges=$('publicPracticalBadges');if(badges)badges.innerHTML=practicalBadgeMarkup(user,false);
  } else {
    const summary=$('premiumPracticalSummary');if(summary)summary.textContent=`${count} de ${PRACTICAL_STATIONS.length} estações aprovadas · selo concedido por avaliação presencial.`;
    const badges=$('premiumPracticalBadges');if(badges)badges.innerHTML=practicalBadgeMarkup(user,true);
    const history=$('premiumPracticalHistory');if(history)history.innerHTML=practicalHistoryMarkup(user,8);
  }
}
function renderPracticalTrainerRoster() {
  const sel=$('practicalStaffSelect');if(!isTrainerUnlocked || !sel)return;
  const old=sel.value;
  const list=Object.entries(users).filter(([,u])=>u&&u.name&&!u._deleted).sort((a,b)=>a[1].name.localeCompare(b[1].name,'pt-BR'));
  sel.replaceChildren(new Option('Escolha um colaborador...',''));
  for(const [id,u] of list) sel.add(new Option(`${u.name} · ${u.role||'Colaborador'}`,id));
  if(list.some(([id])=>id===old))sel.value=old;
  renderPracticalTrainerHistory();
}
function renderPracticalChecklist() {
  const sel=$('practicalStationSelect');const holder=$('practicalChecklist');if(!sel||!holder)return;
  if(!sel.options.length)PRACTICAL_STATIONS.forEach(s=>sel.add(new Option(`${s.icon} ${s.label}`,s.id)));
  const station=PRACTICAL_STATIONS.find(s=>s.id===sel.value)||PRACTICAL_STATIONS[0];
  holder.replaceChildren();
  station.criteria.forEach((description,i)=>{
    const label=document.createElement('label');label.className='practical-check-row';
    const check=document.createElement('input');check.type='checkbox';check.name='practicalCriteria';check.value=String(i);check.addEventListener('change',renderPracticalResultPreview);
    const text=document.createElement('span');text.textContent=description;
    label.append(check,text);holder.appendChild(label);
  });
  renderPracticalResultPreview();
}
function renderPracticalResultPreview() {
  const list=[...document.querySelectorAll('#practicalChecklist input[type="checkbox"]')];
  const count=list.filter(x=>x.checked).length;
  const box=$('practicalResultPreview');if(!box)return;
  box.className='practical-result '+(count===4?'ready':'needs-work');
  box.textContent=count===4?'✅ 4/4 itens: avaliação aprovada e selo desbloqueado.':`📋 ${count}/4 itens atendidos: resultado “Em desenvolvimento”.`;
}
function renderPracticalTrainerHistory() {
  const box=$('trainerPracticalHistory');if(!box)return;
  const key=$('practicalStaffSelect')?.value;
  box.innerHTML=key&&users[key]?practicalHistoryMarkup(users[key],12):'<p class="trainer-help">Selecione um colaborador para consultar o histórico.</p>';
}
function savePracticalAssessment(event) {
  event.preventDefault();
  if(!isTrainerUnlocked)return;
  const key=$('practicalStaffSelect').value,stationId=$('practicalStationSelect').value;
  const checks=[...document.querySelectorAll('#practicalChecklist input[type="checkbox"]')].map(el=>el.checked);
  const evaluator=$('practicalEvaluator').value.trim(),notes=$('practicalNotes').value.trim();
  if(!Object.prototype.hasOwnProperty.call(users,key)||!users[key]||users[key]._deleted || !PRACTICAL_STATIONS.some(s=>s.id===stationId) || checks.length!==4 || evaluator.length<2 || evaluator.length>70 || notes.length>350) {
    alert('Confira colaborador, estação, checklist e nome do avaliador.');return;
  }
  const approved=checks.every(Boolean);
  const station=PRACTICAL_STATIONS.find(s=>s.id===stationId);
  const status=approved?'APROVADO':'EM DESENVOLVIMENTO';
  if(!confirm(`Registrar ${station.label} para ${users[key].name}? Resultado: ${status}. Nenhum XP será concedido.`))return;
  const now=Date.now();
  const id=`P-${now.toString(36)}-${Math.random().toString(36).slice(2,10)}`;
  const record={id,stationId,checks,approved,evaluator,notes,createdAt:now};
  if(!validPracticalRecord(record))return;
  const user=users[key];
  if(!user.practicalAssessments || typeof user.practicalAssessments!=='object')user.practicalAssessments={records:{}};
  if(!user.practicalAssessments.records)user.practicalAssessments.records={};
  user.practicalAssessments.records[id]=record;
  user.updatedAt=now;
  scheduleCloudSync(key,true);
  const info=$('practicalSaveFeedback');info.textContent=approved?'✅ Aprovado! Selo da estação registrado no perfil.':'📚 Registrado como Em desenvolvimento. Pode ser reavaliado depois.';
  info.classList.remove('hidden');
  $('trainerPracticalForm').querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=false);
  $('practicalNotes').value='';renderPracticalResultPreview();renderPracticalTrainerHistory();
  if(currentUserKey===key)renderPremiumProfile();
  if(publicProfileSelectedKey===key)renderPublicProfile();
}

// v8.8 — Campanha x2 compartilhada no canal já usado pela Central do Treinador.
// Controla somente o XP positivo concedido no futuro; nunca altera saldos existentes.
function getXpMultiplier() {
  return trainerState.xpMode?.multiplier === 2 ? 2 : 1;
}
function xpForReward(base) {
  const amount = Number(base) || 0;
  return amount > 0 ? Math.round(amount * getXpMultiplier()) : amount;
}
function renderXpModeStatus() {
  const active = getXpMultiplier() === 2;
  const badge = $('xpMultiplierBadge');
  if (badge) badge.classList.toggle('hidden', !active);
  const button = $('adminXp2Toggle');
  if (button) {
    button.textContent = active ? 'Desligar XP x2' : 'Ativar XP x2';
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  const status = $('adminXp2Status');
  if (status) status.textContent = active
    ? 'Ativo: os próximos pontos dos jogos, missões, baús e duelos são duplicados para todos.'
    : 'Desligado: as próximas recompensas voltam ao valor normal.';
  const rate = $('kitchenXpRate');
  if (rate && typeof activeRecipe !== 'undefined') rate.textContent = `+${xpForReward(activeRecipe.xp)} XP`;
  for(const id of ['duelInviteXpValue','duelArenaXpValue','duelTrainerXpValue']) {
    const el = $(id); if(el)el.textContent=`+${xpForReward(DUEL_WIN_XP)} XP`;
  }
  const quizRate = $('quizXpRate');if(quizRate)quizRate.textContent=`+${xpForReward(25)} XP`;
}
function adminToggleXp2() {
  if (!isAdminUnlocked) return;
  const current = getXpMultiplier();
  const next = current === 2 ? 1 : 2;
  trainerState.xpMode = {multiplier: next, updatedAt: Math.max(Date.now(), Number(trainerState.xpMode?.updatedAt || 0) + 1), by: currentUserKey || 'Administrador'};
  publishTrainerState({xpMode:trainerState.xpMode});
  renderXpModeStatus();
  showMissionToast(next === 2 ? '⚡ XP x2 ativado para os próximos ganhos!' : '✅ XP voltou ao normal. Os saldos foram mantidos.');
}
