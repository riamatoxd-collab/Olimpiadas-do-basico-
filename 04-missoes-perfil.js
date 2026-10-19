/* Venture 8.8 · js/04-missoes-perfil.js · arquivo carregado na ordem indicada no HTML. */
// =========================================================================
// 🎯 MISSÕES & CONQUISTAS v7.9 — SEM ALTERAR CHAVES DE ARMAZENAMENTO
// Cada usuário recebe o campo opcional missionProgress. Cadastros antigos
// são migrados ao primeiro acesso, preservando XP, acertos e credenciais.
// =========================================================================
// Catálogo mais amplo: quatro missões sorteadas por dia e quatro por semana.
// O sorteio depende do colaborador e do período para não mudar em cada acesso.
const MISSION_DEFINITIONS = [
  {id:"quiz3",cycle:"daily",icon:"⚡",title:"Aquecimento rápido",detail:"Acerte 3 questões hoje",metric:"quizCorrect",target:3,xp:20},
  {id:"quiz5",cycle:"daily",icon:"🎯",title:"5 acertos no simulado",detail:"Acerte 5 questões hoje",metric:"quizCorrect",target:5,xp:40},
  {id:"quiz8",cycle:"daily",icon:"📚",title:"Desafio do conhecimento",detail:"Acerte 8 questões hoje",metric:"quizCorrect",target:8,xp:50},
  {id:"quiz12",cycle:"daily",icon:"🔥",title:"Dia de maratona",detail:"Acerte 12 questões hoje",metric:"quizCorrect",target:12,xp:70},
  {id:"kitchen1",cycle:"daily",icon:"🍔",title:"Primeiro pedido",detail:"Monte uma receita hoje",metric:"kitchenRecipes",target:1,xp:15},
  {id:"kitchen2",cycle:"daily",icon:"👨‍🍳",title:"Dupla de lanches",detail:"Monte 2 receitas diferentes hoje",metric:"kitchenRecipes",target:2,xp:30},
  {id:"kitchen3",cycle:"daily",icon:"🥪",title:"Trio na bancada",detail:"Monte 3 receitas diferentes hoje",metric:"kitchenRecipes",target:3,xp:45},
  {id:"review1",cycle:"daily",icon:"🧠",title:"Aprender com o erro",detail:"Corrija 1 questão em Minhas Dúvidas",metric:"reviewsCorrect",target:1,xp:20},
  {id:"review2",cycle:"daily",icon:"💡",title:"Revisão certeira",detail:"Corrija 2 dúvidas hoje",metric:"reviewsCorrect",target:2,xp:35},
  {id:"quiz10",cycle:"weekly",icon:"🎯",title:"Dez no alvo",detail:"Acerte 10 questões nesta semana",metric:"quizCorrect",target:10,xp:55},
  {id:"quiz25",cycle:"weekly",icon:"📚",title:"Maratona de conhecimento",detail:"Acerte 25 questões nesta semana",metric:"quizCorrect",target:25,xp:120},
  {id:"quiz40",cycle:"weekly",icon:"🚀",title:"Mestre das respostas",detail:"Acerte 40 questões na semana",metric:"quizCorrect",target:40,xp:170},
  {id:"quiz60",cycle:"weekly",icon:"🏆",title:"Semana de campeão",detail:"Acerte 60 questões na semana",metric:"quizCorrect",target:60,xp:220},
  {id:"kitchen2w",cycle:"weekly",icon:"🍔",title:"Dupla na cozinha",detail:"Monte 2 receitas diferentes na semana",metric:"kitchenRecipes",target:2,xp:45},
  {id:"kitchen4",cycle:"weekly",icon:"👨‍🍳",title:"Mão na massa",detail:"Monte 4 receitas diferentes na semana",metric:"kitchenRecipes",target:4,xp:75},
  {id:"kitchen5",cycle:"weekly",icon:"🥇",title:"Chef versátil",detail:"Monte 5 receitas diferentes na semana",metric:"kitchenRecipes",target:5,xp:90},
  {id:"kitchen8",cycle:"weekly",icon:"🥪",title:"Mestre da bancada",detail:"Monte 8 receitas diferentes na semana",metric:"kitchenRecipes",target:8,xp:140},
  {id:"review2w",cycle:"weekly",icon:"🧠",title:"Revisão da semana",detail:"Corrija 2 dúvidas na semana",metric:"reviewsCorrect",target:2,xp:35},
  {id:"review5",cycle:"weekly",icon:"💡",title:"Revisão inteligente",detail:"Corrija 5 dúvidas nesta semana",metric:"reviewsCorrect",target:5,xp:60},
  {id:"review8",cycle:"weekly",icon:"🌟",title:"Nunca parar de aprender",detail:"Corrija 8 dúvidas na semana",metric:"reviewsCorrect",target:8,xp:90}
];
// Sorteio reproduzível no celular e em qualquer outro aparelho da mesma conta.
// Uma missão de cada tipo + a quarta sorteada entre as restantes.
function missionSelection(cycle, periodKey, userKey) {
  const pool=MISSION_DEFINITIONS.filter(m=>m.cycle===cycle);
  let hash=2166136261;
  const seed=`venture89:${userKey||"visitante"}:${cycle}:${periodKey}`;
  for(let i=0;i<seed.length;i++){
    hash^=seed.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;
  }
  const random=()=>{hash^=hash<<13;hash^=hash>>>17;hash^=hash<<5;return (hash>>>0)/4294967296;};
  const pick=arr=>arr[Math.floor(random()*arr.length)];
  const selected=["quizCorrect","kitchenRecipes","reviewsCorrect"].map(metric=>pick(pool.filter(m=>m.metric===metric)));
  const remaining=pool.filter(m=>!selected.some(chosen=>chosen.id===m.id));
  selected.push(pick(remaining));
  return selected;
}
const MEDAL_DEFINITIONS = [
  { id:"first_hit", icon:"🌟", title:"Primeiro Acerto", detail:"1 questão correta", test:(u,p)=> (u.correctAnswers||0)>=1 },
  { id:"quiz10", icon:"🎯", title:"Mira Certa", detail:"10 questões corretas", test:(u,p)=> (u.correctAnswers||0)>=10 },
  { id:"quiz50", icon:"🧠", title:"Mestre do Básico", detail:"50 questões corretas", test:(u,p)=> (u.correctAnswers||0)>=50 },
  { id:"first_recipe", icon:"🍔", title:"Primeiro Lanche", detail:"Monte sua primeira receita", test:(u,p)=> p.lifetime.kitchenRecipes.length>=1 },
  { id:"chef5", icon:"👨‍🍳", title:"Chef de Ouro", detail:"Monte 5 receitas diferentes", test:(u,p)=> p.lifetime.kitchenRecipes.length>=5 },
  { id:"reviews3", icon:"💡", title:"Erros Viram Lições", detail:"Corrija 3 dúvidas", test:(u,p)=> p.lifetime.reviewsCorrect>=3 },
  { id:"missions5", icon:"🏅", title:"Caçador de Missões", detail:"Complete 5 missões", test:(u,p)=> Object.keys(p.claims).length>=5 },
  { id:"gold_level", icon:"👑", title:"Padrão Ouro", detail:"Alcance o nível 4 (6.000 XP)", test:(u,p)=> (u.xp||0)>=6000 }
];

// ========================================================================
// 🎁 BAÚ DIÁRIO v8.7: um sorteio por dia no fuso da campanha (São Paulo).
// Prêmios do tipo poção viram itens consumíveis: não ultrapassam 5 vidas.
// Histórico em dailyChest é mesclado; não modifica as chaves antigas.
// OBS: a validação definitiva anti-fraude requer backend com autenticação.
// ========================================================================
const CHEST_POTIONS={bigmac:{icon:"🍔",label:"Big Mac",hearts:5},drink:{icon:"🥤",label:"Bebida",hearts:3},fries:{icon:"🍟",label:"Batata",hearts:2}};
function ensureDailyChest(user){
  if(!user)return null;
  const data=user.dailyChest && typeof user.dailyChest==="object"?user.dailyChest:{};
  data.claims=data.claims && typeof data.claims==="object" && !Array.isArray(data.claims)?data.claims:{};
  data.used=data.used && typeof data.used==="object" && !Array.isArray(data.used)?data.used:{};
  user.dailyChest=data;
  return data;
}
function mergeDailyChest(a,b){
  if(!a && !b)return undefined;
  const claims={...(a?.claims||{})};
  Object.entries(b?.claims||{}).forEach(([date,prize])=>{
    const old=claims[date];
    if(!old || (Number(prize?.at)||0)<(Number(old.at)||0))claims[date]=prize;
  });
  const used={...(a?.used||{})};
  Object.entries(b?.used||{}).forEach(([date,at])=>{used[date]=Math.max(Number(used[date])||0,Number(at)||0);});
  return {claims,used};
}
function chestRandomInt(max){
  if(typeof crypto!=="undefined" && crypto.getRandomValues){
    const out=new Uint32Array(1),range=0x100000000;
    const limit=range-(range%max);
    do{crypto.getRandomValues(out);}while(out[0]>=limit);
    return out[0]%max;
  }
  return Math.floor(Math.random()*max);
}
function dailyChestDay(){return missionPeriodKeys().daily;}
function chestPotionInventory(chest){
  const output={bigmac:[],drink:[],fries:[]};
  if(!chest)return output;
  Object.entries(chest.claims).sort(([a],[b])=>a.localeCompare(b)).forEach(([day,prize])=>{
    if(CHEST_POTIONS[prize?.kind] && !chest.used[day])output[prize.kind].push(day);
  });
  return output;
}
function refreshLocalChestUser(){
  // Evita abrir de novo caso outra aba já tenha registrado o prêmio neste aparelho.
  try{
    const snapshot=JSON.parse(localStorage.getItem(STORAGE_USERS_KEY)||"{}");
    if(currentUserKey && snapshot[currentUserKey])users[currentUserKey]=mergeSingleUser(users[currentUserKey],snapshot[currentUserKey]);
  }catch(_){}
}
function openDailyChest(){
  if(!currentUserKey || !users[currentUserKey] || users[currentUserKey]._deleted){
    showMissionToast("🔒 Entre na sua conta para abrir o baú.");return;
  }
  refreshLocalChestUser();
  const user=users[currentUserKey], chest=ensureDailyChest(user), today=dailyChestDay();
  if(chest.claims[today]){renderDailyChest();return;}
  const kind=["bigmac","drink","fries","xp"][chestRandomInt(4)];
  const amount=kind==="xp" ? 20+chestRandomInt(181):CHEST_POTIONS[kind].hearts;
  chest.claims[today]={kind,amount,at:Date.now()};
  user.updatedAt=Date.now();
  // Registrar antes do XP para impedir recompensa repetida no próximo clique.
  localStorage.setItem(STORAGE_USERS_KEY,JSON.stringify(users));
  if(kind==="xp"){
    const received = addXp(amount);
    showMissionToast(`🎁 Seu baú revelou +${received} XP!`);
  }else{
    playHitSuccessSound();
    scheduleCloudSync(currentUserKey,true);
    showMissionToast(`🎁 ${CHEST_POTIONS[kind].icon} Poção ${CHEST_POTIONS[kind].label}: +${amount} corações guardados!`);
    const panel=$("dailyChestInventoryPanel");if(panel)panel.open=true;
  }
  renderDailyChest();
}
function useDailyPotion(kind){
  if(!CHEST_POTIONS[kind] || !currentUserKey || !users[currentUserKey])return;
  refreshLocalChestUser();
  const user=users[currentUserKey],chest=ensureDailyChest(user),available=chestPotionInventory(chest)[kind];
  if(!available.length){renderDailyChest();return;}
  syncActiveUserHeartsState(); // Pode encerrar cooldown expirado.
  if(currentHearts>=5){showMissionToast("❤️ Seus corações já estão completos. Guarde a poção!");renderDailyChest();return;}
  const day=available[0];
  chest.used[day]=Date.now(); // Consumo como evento evita reaparecer no merge.
  user.updatedAt=Date.now();
  localStorage.setItem(STORAGE_USERS_KEY,JSON.stringify(users));
  const before=currentHearts;
  const healed=Math.min(5,before+CHEST_POTIONS[kind].hearts);
  setActiveHeartsState(healed,0); // Encerra a recarga de 10 min quando revive.
  checkAndRenderCooldownScreen();
  scheduleCloudSync(currentUserKey,true);
  showMissionToast(`${CHEST_POTIONS[kind].icon} +${healed-before} corações restaurados!`);
  renderDailyChest();
}
function renderDailyChest(){
  const button=$("dailyChestOpen"), status=$("dailyChestStatus"),tag=$("dailyChestTag");
  if(!button || !status)return;
  const user=currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted ? users[currentUserKey]:null;
  const chest=user?ensureDailyChest(user):null, today=dailyChestDay(), claimed=chest?.claims[today];
  button.disabled=!user || !!claimed;
  button.textContent=!user?"🔒 Entre para abrir":claimed?"✅ Baú de hoje aberto":"🎁 Abrir baú de hoje";
  status.textContent=!user?"Entre na sua conta para receber a recompensa.":claimed?"Volte amanhã para um novo presente!":"Seu presente de hoje está disponível.";
  if(tag)tag.textContent=claimed?"RECEBIDO":"DIÁRIO";
  const result=$("dailyChestResult");
  if(result)result.textContent=!claimed?"":claimed.kind==="xp"?`⚡ Você recebeu +${claimed.amount} XP hoje.`:CHEST_POTIONS[claimed.kind]?`${CHEST_POTIONS[claimed.kind].icon} Você ganhou ${CHEST_POTIONS[claimed.kind].label} (+${claimed.amount} corações).`:"✅ Recompensa resgatada.";
  const inventory=chestPotionInventory(chest), count=Object.values(inventory).reduce((sum,days)=>sum+days.length,0);
  const badge=$("dailyChestInventoryCount"),list=$("dailyChestInventory");
  if(badge)badge.textContent=`${count} guardada${count===1?"":"s"}`;
  if(list){
    if(!user)list.innerHTML='<p class="daily-chest-note">Entre na sua conta para ver as poções.</p>';
    else if(!count)list.innerHTML='<p class="daily-chest-note">Nenhuma poção guardada. Abra o baú de hoje!</p>';
    else list.innerHTML=Object.entries(CHEST_POTIONS).filter(([kind])=>inventory[kind].length).map(([kind,p])=>`<div class="daily-chest-item"><span>${p.icon}</span><div><strong>${p.label} · +${p.hearts} ❤️</strong><small>${inventory[kind].length} disponível(is)</small></div><button type="button" class="daily-chest-use" onclick="useDailyPotion('${kind}')" ${currentHearts>=5?"disabled title='Corações completos'":""}>Usar</button></div>`).join("");
  }
}

let missionViewCycle = "daily";
function missionPeriodKeys(at = new Date()) {
  // Mesmo calendário da campanha em todos os aparelhos (horário de Brasília).
  const parts = new Intl.DateTimeFormat("en-US", { timeZone:"America/Sao_Paulo", year:"numeric", month:"2-digit", day:"2-digit" }).formatToParts(at);
  const get = k => parts.find(part => part.type === k).value;
  const day = `${get("year")}-${get("month")}-${get("day")}`;
  const monday = new Date(`${day}T12:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  return { daily:day, weekly:monday.toISOString().slice(0,10) };
}
function emptyMissionCycle(key) {
  return { key, quizCorrect:0, reviewsCorrect:0, kitchenRecipes:[] };
}
function ensureMissionProgress(user) {
  if (!user) return null;
  const keys = missionPeriodKeys();
  const p = user.missionProgress && typeof user.missionProgress === "object" ? user.missionProgress : {};
  p.version = 1;
  for (const cycle of ["daily", "weekly"]) {
    const old = p[cycle];
    // Não retroagir o calendário caso chegue um snapshot futuro de outro celular.
    if (!old || !old.key || old.key < keys[cycle]) p[cycle] = emptyMissionCycle(keys[cycle]);
    else {
      old.quizCorrect = Math.max(0, Number(old.quizCorrect)||0);
      old.reviewsCorrect = Math.max(0, Number(old.reviewsCorrect)||0);
      old.kitchenRecipes = Array.isArray(old.kitchenRecipes) ? [...new Set(old.kitchenRecipes)] : [];
    }
  }
  if (!p.lifetime || typeof p.lifetime !== "object") p.lifetime = {};
  p.lifetime.reviewsCorrect = Math.max(0,Number(p.lifetime.reviewsCorrect)||0);
  p.lifetime.kitchenRecipes = Array.isArray(p.lifetime.kitchenRecipes) ? [...new Set(p.lifetime.kitchenRecipes)] : [];
  p.claims = p.claims && typeof p.claims === "object" && !Array.isArray(p.claims) ? p.claims : {};
  p.badges = p.badges && typeof p.badges === "object" && !Array.isArray(p.badges) ? p.badges : {};
  user.missionProgress = p;
  return p;
}
function mergeMissionCycle(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.key !== b.key) return a.key > b.key ? a : b;
  return {
    key:a.key,
    quizCorrect:Math.max(Number(a.quizCorrect)||0,Number(b.quizCorrect)||0),
    reviewsCorrect:Math.max(Number(a.reviewsCorrect)||0,Number(b.reviewsCorrect)||0),
    kitchenRecipes:[...new Set([...(Array.isArray(a.kitchenRecipes)?a.kitchenRecipes:[]),...(Array.isArray(b.kitchenRecipes)?b.kitchenRecipes:[])])]
  };
}
function mergeMissionProgress(a, b) {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  const la = a.lifetime || {}, lb = b.lifetime || {};
  return {
    version:1,
    daily:mergeMissionCycle(a.daily,b.daily),
    weekly:mergeMissionCycle(a.weekly,b.weekly),
    lifetime:{
      reviewsCorrect:Math.max(Number(la.reviewsCorrect)||0, Number(lb.reviewsCorrect)||0),
      kitchenRecipes:[...new Set([...(Array.isArray(la.kitchenRecipes)?la.kitchenRecipes:[]),...(Array.isArray(lb.kitchenRecipes)?lb.kitchenRecipes:[])])]
    },
    claims:{...(a.claims||{}),...(b.claims||{})},
    badges:{...(a.badges||{}),...(b.badges||{})}
  };
}
function missionMetric(cycleData, metric) {
  return metric === "kitchenRecipes" ? cycleData.kitchenRecipes.length : (Number(cycleData[metric])||0);
}
function unlockEarnedMedals(user, progress) {
  const newMedals = [];
  MEDAL_DEFINITIONS.forEach(medal => {
    if (!progress.badges[medal.id] && medal.test(user,progress)) {
      progress.badges[medal.id] = Date.now();
      newMedals.push(medal);
    }
  });
  return newMedals;
}
function showMissionToast(message) {
  const toast = document.createElement("div");
  toast.className = "mission-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
function recordMissionActivity(kind, recipeId = null) {
  if (!currentUserKey || !users[currentUserKey] || users[currentUserKey]._deleted) return;
  const user = users[currentUserKey];
  const p = ensureMissionProgress(user);
  if (kind === "quiz_correct") {
    p.daily.quizCorrect++; p.weekly.quizCorrect++;
  } else if (kind === "review_correct") {
    p.daily.reviewsCorrect++; p.weekly.reviewsCorrect++; p.lifetime.reviewsCorrect++;
  } else if (kind === "kitchen_complete" && KITCHEN_RECIPES.some(r=>r.id === recipeId)) {
    for (const list of [p.daily.kitchenRecipes,p.weekly.kitchenRecipes,p.lifetime.kitchenRecipes]) {
      if (!list.includes(recipeId)) list.push(recipeId);
    }
  } else return;
  const earned = [];
  let bonus = 0;
  const activeMissions=[...missionSelection("daily",p.daily.key,currentUserKey),...missionSelection("weekly",p.weekly.key,currentUserKey)];
  activeMissions.forEach(m => {
    const cycle = p[m.cycle];
    const claimId = `${m.cycle}:${cycle.key}:${m.id}`;
    if (!p.claims[claimId] && missionMetric(cycle,m.metric) >= m.target) {
      p.claims[claimId] = Date.now();
      bonus += m.xp;
      earned.push(m);
    }
  });
  const medalUnlocks = unlockEarnedMedals(user,p);
  user.updatedAt = Date.now();
  // addXp() mantém o mesmo processo de atualização de nível e ranking.
  const gainedXp = bonus ? addXp(bonus) : 0;
  if (!bonus) scheduleCloudSync(currentUserKey,false);
  // A conquista de Padrão Ouro também pode ocorrer com o bônus recém ganho.
  medalUnlocks.push(...unlockEarnedMedals(user,p));
  if (earned.length) showMissionToast(`🎯 ${earned.map(m=>m.title).join(" • ")}! +${gainedXp} XP`);
  if (medalUnlocks.length) showMissionToast(`🏅 Nova medalha: ${medalUnlocks.map(m=>m.title).join(", ")}`);
  renderMissionHub();
}
function setMissionView(cycle) {
  if (cycle !== "daily" && cycle !== "weekly") return;
  missionViewCycle = cycle;
  if (typeof playTabClickSound === "function") playTabClickSound();
  renderMissionHub();
}
function renderMissionHub() {
  const list = $("missionList");
  if (!list) return;
  const user = currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted ? users[currentUserKey] : null;
  if (!user) {
    list.innerHTML = '<div class="mission-item text-xs font-bold text-muted-pro">Entre na sua conta para começar as missões!</div>';
    $("medalGrid").innerHTML = "";
    $("medalCount").textContent = `0/${MEDAL_DEFINITIONS.length}`;
    return;
  }
  const p = ensureMissionProgress(user);
  unlockEarnedMedals(user,p); // reconhece acertos/XP obtidos antes desta versão
  const cycle = p[missionViewCycle];
  const items = missionSelection(missionViewCycle,cycle.key,currentUserKey);
  const completedCount = items.filter(m=>p.claims[`${m.cycle}:${cycle.key}:${m.id}`]).length;
  $("missionCycleLabel").textContent = missionViewCycle === "daily"
    ? `4 missões sorteadas • Hoje (${cycle.key.split("-").reverse().join("/")}) • renovam à meia-noite (Brasília)`
    : `4 missões sorteadas • Semana de ${cycle.key.split("-").reverse().join("/")} • renovam segunda-feira`;
  $("missionCompletedCount").textContent = `${completedCount}/${items.length} completas`;
  for (const name of ["daily","weekly"]) {
    const btn = $(name === "daily" ? "missionViewDaily" : "missionViewWeekly");
    if (btn) {
      btn.classList.toggle("is-active",missionViewCycle===name);
      btn.setAttribute("aria-pressed",String(missionViewCycle===name));
    }
  }
  list.innerHTML = items.map(m => {
    const progress = Math.min(m.target,missionMetric(cycle,m.metric));
    const complete = Boolean(p.claims[`${m.cycle}:${cycle.key}:${m.id}`]);
    const pct = Math.round(100*progress/m.target);
    return `<article class="mission-item ${complete?'is-complete':''}">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex gap-2.5 items-start">
          <span class="text-xl" aria-hidden="true">${m.icon}</span>
          <div><h3 class="text-xs font-black leading-snug">${m.title}</h3><p class="text-[11px] text-muted-pro font-medium mt-0.5">${m.detail}</p></div>
        </div>
        <span class="mission-reward">${complete?'✅ Recebido':`+${m.xp} XP`}</span>
      </div>
      <div class="mt-2.5 flex items-center gap-2">
        <div class="mission-progress-track flex-1" role="progressbar" aria-valuemin="0" aria-valuemax="${m.target}" aria-valuenow="${progress}" aria-label="${m.title}"><div class="mission-progress-fill" style="width:${pct}%"></div></div>
        <span class="text-[10px] font-black text-muted-pro whitespace-nowrap">${progress}/${m.target}</span>
      </div>
    </article>`;
  }).join("");
  const total = MEDAL_DEFINITIONS.filter(m=>p.badges[m.id]).length;
  $("medalCount").textContent = `${total}/${MEDAL_DEFINITIONS.length}`;
  $("medalGrid").innerHTML = MEDAL_DEFINITIONS.map(m => {
    const earned = Boolean(p.badges[m.id]);
    return `<div class="medal-tile ${earned?'is-unlocked':'is-locked'}" aria-label="${m.title}: ${earned?'conquistada':'bloqueada'}">
      <span class="text-2xl" aria-hidden="true">${earned?m.icon:'🔒'}</span>
      <strong>${m.title}</strong><small>${earned?'✅ Conquistada':m.detail}</small>
    </div>`;
  }).join("");
}
// =========================================================================
// ============================================================================
// 👑 PERFIL PREMIUM V8.1 — preferências cosméticas opcionais por usuário
// Não modifica as chaves de localStorage nem as regras de XP existentes.
// ============================================================================
const PREMIUM_FRAMES = [
  {id:"classic", icon:"◻️", label:"Clássica", minXp:0},
  {id:"bronze", icon:"🥉", label:"Bronze", minXp:1000},
  {id:"silver", icon:"🥈", label:"Prata", minXp:3000},
  {id:"gold", icon:"🥇", label:"Ouro", minXp:6000},
  {id:"diamond", icon:"💎", label:"Diamante", minXp:10000},
  {id:"legend", icon:"👑", label:"Lendária", minXp:25000}
];
const PREMIUM_TITLES = [
  {id:"trainee", icon:"🌟", label:"Em treinamento", available:()=>true, requirement:"Disponível para todos"},
  {id:"first", icon:"🎯", label:"Mira Certa", available:(u,p)=>Boolean(p.badges.quiz10), requirement:"Medalha Mira Certa"},
  {id:"chef", icon:"🍔", label:"Chef da Loja", available:(u,p)=>Boolean(p.badges.first_recipe), requirement:"Medalha Primeiro Lanche"},
  {id:"master", icon:"🧠", label:"Mestre do Básico", available:(u,p)=>Boolean(p.badges.quiz50), requirement:"Medalha Mestre do Básico"},
  {id:"gold", icon:"🏅", label:"Padrão Ouro", available:(u,p)=>Boolean(p.badges.gold_level), requirement:"Medalha Padrão Ouro"},
  {id:"legend", icon:"👑", label:"Lenda da Venture", available:u=>(u.xp||0)>=25000, requirement:"Alcance 25.000 XP"}
];
function mergeProfilePremium(a,b) {
  if (!a) return b;
  if (!b) return a;
  const newest = (Number(b.updatedAt)||0) >= (Number(a.updatedAt)||0) ? b : a;
  return {
    frameId:typeof newest.frameId === 'string'?newest.frameId:'classic',
    titleId:typeof newest.titleId === 'string'?newest.titleId:'trainee',
    featuredBadges:Array.isArray(newest.featuredBadges)?newest.featuredBadges.slice(0,3):[],
    updatedAt:Math.max(Number(a.updatedAt)||0, Number(b.updatedAt)||0)
  };
}
function ensurePremiumProfile(user) {
  const saved = user && user.profilePremium && typeof user.profilePremium === 'object' ? user.profilePremium : {};
  return {
    frameId:typeof saved.frameId === 'string' ? saved.frameId : 'classic',
    titleId:typeof saved.titleId === 'string' ? saved.titleId : 'trainee',
    featuredBadges:Array.isArray(saved.featuredBadges)?[...new Set(saved.featuredBadges.filter(id=>MEDAL_DEFINITIONS.some(m=>m.id===id)))].slice(0,3):[],
    updatedAt:Number(saved.updatedAt)||0
  };
}
function premiumDate(value) {
  const stamp = Number(value);
  if (!Number.isFinite(stamp) || stamp < 946684800000 || stamp > Date.now()+86400000) return 'Conquistada';
  return new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(stamp));
}
function updatePremiumSetting(field,value) {
  const user = currentUserKey && users[currentUserKey];
  if (!user || user._deleted) return;
  const progress = ensureMissionProgress(user);
  unlockEarnedMedals(user,progress);
  const selected = ensurePremiumProfile(user);
  if (field === 'frameId') {
    if (!PREMIUM_FRAMES.some(f=>f.id===value && (user.xp||0)>=f.minXp)) return;
    selected.frameId = value;
  } else if (field === 'titleId') {
    if (!PREMIUM_TITLES.some(t=>t.id===value && t.available(user,progress))) return;
    selected.titleId = value;
  } else if (field === 'featuredBadges') {
    if (!MEDAL_DEFINITIONS.some(m=>m.id===value) || !progress.badges[value]) return;
    if (selected.featuredBadges.includes(value)) selected.featuredBadges=selected.featuredBadges.filter(id=>id!==value);
    else if (selected.featuredBadges.length < 3) selected.featuredBadges.push(value);
    else {showMissionToast('🏅 Você pode destacar até 3 medalhas. Remova uma antes de adicionar outra.');return;}
  } else return;
  selected.updatedAt = Date.now();
  user.profilePremium = selected;
  user.updatedAt = selected.updatedAt;
  scheduleCloudSync(currentUserKey,false);
  renderPremiumProfile();
}
function renderPremiumProfile() {
  const hero = $('premiumHero');
  if (!hero || $('tab-profile').classList.contains('hidden')) return;
  const user = currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted ? users[currentUserKey] : null;
  if (!user) {switchMainTab('more');return;}
  const progress = ensureMissionProgress(user);
  unlockEarnedMedals(user,progress);
  const saved = ensurePremiumProfile(user);
  const xp = Math.max(0,Number(user.xp)||0);
  const frame = PREMIUM_FRAMES.find(f=>f.id===saved.frameId && xp>=f.minXp) || PREMIUM_FRAMES[0];
  const title = PREMIUM_TITLES.find(t=>t.id===saved.titleId && t.available(user,progress)) || PREMIUM_TITLES[0];
  const level = getLevelInfo(xp);
  const portrait = $('premiumAvatar');
  portrait.replaceChildren();
  if (isPhotoAvatar(user.avatar)) {
    const img = document.createElement('img'); img.src = user.avatar; img.alt='Foto do colaborador'; portrait.appendChild(img);
  } else portrait.textContent = user.avatar || '🍔';
  $('premiumAvatarFrame').className = `premium-avatar-frame frame-${frame.id}`;
  $('premiumName').textContent = user.name || 'Colaborador';
  $('premiumRole').textContent = user.role || user.station || 'Atendente';
  $('premiumEquippedTitle').textContent = `${title.icon} ${title.label}`;
  $('premiumLevel').textContent = `Nível ${level.level}`;
  $('premiumXp').textContent = `${xp.toLocaleString('pt-BR')} XP`;
  const ratio = Math.min(100,Math.max(0,100*(xp-level.min)/(level.max-level.min)));
  $('premiumXpBar').style.width = `${ratio}%`;
  $('premiumNextLevel').textContent = level.level < 7 ? `Faltam ${(level.max-xp).toLocaleString('pt-BR')} XP para o nível ${level.level+1}` : 'Você alcançou a patente máxima! 👑';
  $('premiumStatXp').textContent = xp.toLocaleString('pt-BR');
  $('premiumStatHits').textContent = (Number(user.correctAnswers)||0).toLocaleString('pt-BR');
  $('premiumStatRecipes').textContent = String(progress.lifetime.kitchenRecipes.length);
  $('premiumStatMissions').textContent = String(Object.keys(progress.claims).length);
  $('premiumStatsFoot').textContent = `${(Array.isArray(user.mistakes)?user.mistakes.length:0)} dúvida(s) para revisar · ${progress.lifetime.reviewsCorrect} revisão(ões) concluída(s) desde a versão 7.9.`;
  $('premiumFrameSummary').textContent = frame.label;
  $('premiumTitleSummary').textContent = title.label;
  $('premiumFrameChoices').innerHTML = PREMIUM_FRAMES.map(f=>{
    const available = xp >= f.minXp, current=frame.id===f.id;
    return `<button type="button" class="premium-choice ${current?'is-selected':''} ${available?'':'is-locked'}" ${available?`onclick="updatePremiumSetting('frameId','${f.id}')"`:'disabled'} aria-pressed="${current}"><span class="choice-icon">${f.icon}</span><strong>${f.label} ${current?'✓':''}</strong><small>${available?'Desbloqueada':`${f.minXp.toLocaleString('pt-BR')} XP para liberar`}</small></button>`;
  }).join('');
  $('premiumTitleChoices').innerHTML = PREMIUM_TITLES.map(t=>{
    const available=t.available(user,progress), current=title.id===t.id;
    return `<button type="button" class="premium-choice ${current?'is-selected':''} ${available?'':'is-locked'}" ${available?`onclick="updatePremiumSetting('titleId','${t.id}')"`:'disabled'} aria-pressed="${current}"><span class="choice-icon">${t.icon}</span><strong>${t.label} ${current?'✓':''}</strong><small>${available?'Desbloqueado':t.requirement}</small></button>`;
  }).join('');
  const earned=MEDAL_DEFINITIONS.filter(m=>progress.badges[m.id]);
  $('premiumMedalSummary').textContent = `${earned.length} de ${MEDAL_DEFINITIONS.length} conquistadas`;
  const featuredIds=saved.featuredBadges.filter(id=>progress.badges[id]);
  // Em contas antigas, já mostramos até 3 medalhas conquistadas, sem mudar as preferências.
  const featured = featuredIds.length ? featuredIds : earned.slice(0,3).map(m=>m.id);
  $('premiumFeatured').innerHTML = [0,1,2].map(i=>{
    const item=MEDAL_DEFINITIONS.find(m=>m.id===featured[i]);
    return `<div class="premium-featured-item">${item?`<span aria-hidden="true">${item.icon}</span>${item.title}`:'<span aria-hidden="true">🔒</span>Vazio'}</div>`;
  }).join('');
  $('premiumMedalGrid').innerHTML = MEDAL_DEFINITIONS.map(m=>{
    const available=Boolean(progress.badges[m.id]), pinned=featuredIds.includes(m.id);
    return `<article class="premium-medal ${available?'is-earned':'is-locked'}"><span class="medal-emoji" aria-hidden="true">${available?m.icon:'🔒'}</span><strong>${m.title}</strong><small>${available?premiumDate(progress.badges[m.id]):m.detail}</small>${available?`<button type="button" class="${pinned?'is-featured':''}" onclick="updatePremiumSetting('featuredBadges','${m.id}')">${pinned?'★ Em destaque':'☆ Destacar'}</button>`:''}</article>`;
  }).join('');
  const activity = [
    ...MEDAL_DEFINITIONS.filter(m=>progress.badges[m.id]).map(m=>({time:Number(progress.badges[m.id])||0,icon:m.icon,label:`Medalha: ${m.title}`})),
    ...Object.entries(progress.claims).map(([key,time])=>{
      const parts=key.split(':');const mission=MISSION_DEFINITIONS.find(m=>m.id===parts[2]&&m.cycle===parts[0]);
      return mission?{time:Number(time)||0,icon:'🎯',label:`Missão: ${mission.title}`} : null;
    }).filter(Boolean)
  ].sort((a,b)=>b.time-a.time).slice(0,7);
  $('premiumHistory').innerHTML = activity.length ? activity.map(item=>`<div class="premium-history-entry"><span aria-hidden="true">${item.icon}</span><div><strong>${item.label}</strong><small>${premiumDate(item.time)}</small></div></div>`).join('') : '<p class="premium-stats-foot">Suas próximas medalhas e missões aparecerão aqui.</p>';
  renderPracticalInProfiles(user,false);
}
