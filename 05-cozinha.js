/* Venture 8.8 · js/05-cozinha.js · arquivo carregado na ordem indicada no HTML. */
// 🎵 MOTOR DE ÁUDIO COMPACTO (JINGLE + CLIQUES + ERRO + GIRO 3D)
// =========================================================================
let globalAudioCtx = null;
function getAudio() {
const Ctx = window.AudioContext || window.webkitAudioContext;
if (!Ctx) return null;
if (!globalAudioCtx) globalAudioCtx = new Ctx();
if (globalAudioCtx.state === "suspended") globalAudioCtx.resume();
return globalAudioCtx;
}
document.addEventListener("click", getAudio, { once: true });
document.addEventListener("touchstart", getAudio, { once: true });
function playTone(notes, type = "triangle", vol = 0.4) {
try {
const ctx = getAudio();
if (!ctx) return;
const now = ctx.currentTime;
notes.forEach(n => {
const osc = ctx.createOscillator(), gain = ctx.createGain();
osc.type = type;
osc.frequency.setValueAtTime(n.f, now + (n.s || 0));
if (n.fEnd) osc.frequency.exponentialRampToValueAtTime(n.fEnd, now + (n.s || 0) + n.d);
gain.gain.setValueAtTime(vol, now + (n.s || 0));
gain.gain.exponentialRampToValueAtTime(0.001, now + (n.s || 0) + n.d);
osc.connect(gain); gain.connect(ctx.destination);
osc.start(now + (n.s || 0)); osc.stop(now + (n.s || 0) + n.d + 0.02);
});
} catch (e) {}
}
function playMcDonaldsJingle() {
const seq = [{ f: 523.25, s: 0, d: 0.16 }, { f: 587.33, s: 0.19, d: 0.16 }, { f: 659.25, s: 0.38, d: 0.2 }, { f: 880, s: 0.65, d: 0.26 }, { f: 783.99, s: 0.96, d: 0.65 }];
playTone(seq, "triangle", 0.7);
playTone(seq.map(x => ({ ...x, f: x.f * 2 })), "sine", 0.22);
}
function playHitSuccessSound() { playTone([{ f: 587.33, s: 0, d: 0.09 }, { f: 880, s: 0.08, d: 0.22 }], "sine", 0.45); }
function playWrongAnswerSound() { playTone([{ f: 220, s: 0, d: 0.14 }, { f: 155, s: 0.16, d: 0.24 }], "sawtooth", 0.32); }
function playTabClickSound() { playTone([{ f: 520, fEnd: 880, s: 0, d: 0.06 }], "triangle", 0.28); }
function playCardFlipSound() { playTone([{ f: 260, fEnd: 620, s: 0, d: 0.12 }], "sine", 0.32); }
// =========================================================================
// ⏳ CRONÔMETRO DE FINALIZAÇÃO (25/10) + 🍔 SISTEMA DE COZINHA (AUTO-INJETADOS)
// =========================================================================
function injectCountdownAndKitchenUI() {
// 1. Botão de testar som no topo
const themeBtn = $("tab-more");
if (themeBtn && !$("soundTestBtn")) {
const sb = document.createElement("button");
sb.id = "soundTestBtn"; sb.title = "Tocar Jingle"; sb.innerHTML = "🔊";
sb.className = "sound-test-button"; sb.textContent = "🔊 Testar som do aplicativo";
sb.onclick = playMcDonaldsJingle;
themeBtn.appendChild(sb);
}
// 2. Banner de Contagem Regressiva para 25/10 no topo do main e no Print do Ranking
const mainEl = $("tab-prizes");
if (mainEl && !$("countdownBannerTop")) {
const banner = document.createElement("div");
banner.id = "countdownBannerTop";
banner.className = "pro-card rounded-3xl p-3.5 mb-4 border-2 border-[#FFC72C] flex items-center justify-between gap-2 shadow-md";
banner.innerHTML = `
<div class="flex items-center gap-2.5">
<span class="text-2xl float-slow">🏁</span>
<div>
<span class="text-[10px] font-black uppercase text-red-500 tracking-wider block">Finalização Oficial • 25/10</span>
<p class="font-black text-xs">Reta Final da Caneca Oficial Méqui ☕</p>
</div>
</div>
<div id="countdownTimerText" class="gold-gradient text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-sm shrink-0">--d --h --m</div>
`;
mainEl.insertBefore(banner, mainEl.firstChild);
}
const printArea = $("rankingPrintArea");
if (printArea && !$("rankingPrintCountdown")) {
const pb = document.createElement("div");
pb.id = "rankingPrintCountdown";
pb.className = "subtle-box rounded-2xl p-2.5 text-center text-xs font-black border border-amber-500/40";
pb.innerHTML = `⏳ Encerramento Oficial: <span class="text-red-500">25/10</span> • <span id="printCountdownSpan">--</span>`;
printArea.insertBefore(pb, printArea.children[1]);
}
// 3. Sistema de Cozinha ("Monta-Lanche") dentro da aba Simulado
const kitchenMount = $('training-mode-kitchen');
if (kitchenMount && !$('kitchenSystemCard')) {
  const kitchenCard = document.createElement('section');
  kitchenCard.id = 'kitchenSystemCard';
  kitchenCard.className = 'pro-card kitchen-20';
  kitchenCard.innerHTML = `
    <div class="kitchen-hero"><div class="kitchen-hero-icon" aria-hidden="true">👨‍🍳</div>
      <div class="kitchen-hero-title"><span>DESAFIO INTERATIVO</span><h2>Cozinha 2.0</h2>
        <p>Monte o lanche na sequência correta, camada por camada.</p></div>
      <span id="kitchenXpRate" class="kitchen-hero-xp">+5 XP</span></div>
    <div class="kitchen-selector"><label for="kitchenRecipeSelect">Escolha o sanduíche</label>
      <div class="kitchen-selector-row"><select id="kitchenRecipeSelect" onchange="selectKitchenRecipe(this.value)" class="subtle-box">
        ${KITCHEN_RECIPES.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}
      </select><button type="button" onclick="resetKitchenGame()" class="kitchen-restart" title="Começar de novo">↻ Reiniciar</button></div></div>
    <div class="kitchen-board"><div class="kitchen-board-top"><span id="kitchenProgressBadge">Etapa 0/0</span><span id="kitchenTimeBadge">⏱ 00:00</span></div>
      <div class="kitchen-progress-track" role="progressbar" id="kitchenProgressTrack" aria-label="Progresso da montagem" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="kitchenProgressFill"></div></div>
      <div class="kitchen-art" aria-label="Visualização do lanche montado">
        <div class="kitchen-art-glow"></div><div class="kitchen-stack" id="kitchenVisualStack" aria-live="polite"><span class="kitchen-empty-visual">🍔</span><small>Seu lanche aparece aqui</small></div>
        <div class="kitchen-board-plate"></div></div>
      <div id="kitchenTrayBuilt" class="kitchen-steps"><span>Selecione o primeiro ingrediente para começar.</span></div></div>
    <div class="kitchen-choices-head"><strong>🧺 Escolha o próximo ingrediente</strong><small>Toque no item correto</small></div>
    <div id="kitchenChoicesGrid" class="kitchen-choice-grid"></div>
    <div id="kitchenFeedback" class="hidden kitchen-feedback" role="status" aria-live="polite"></div>`;
  kitchenMount.appendChild(kitchenCard);
  initKitchenGame();
}
updateEventCountdown();
setInterval(updateEventCountdown, 1000);
}
function updateEventCountdown() {
const diff = EVENT_END_TIMESTAMP - Date.now();
const topEl = $("countdownTimerText"), printEl = $("printCountdownSpan");
if (diff <= 0) {
const list = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
const champ = list[0] ? list[0].name : "1º Colocado";
if (topEl) topEl.textContent = `🏆 ENCERRADO! Campeão: ${champ}`;
if (printEl) printEl.textContent = `ENCERRADO EM 25/10 • 🏆 Campeão(ã): ${champ}`;
return;
}
const d = Math.floor(diff / 86400000);
const h = Math.floor((diff % 86400000) / 3600000);
const m = Math.floor((diff % 3600000) / 60000);
const s = Math.floor((diff % 60000) / 1000);
const str = `Faltam ${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
if (topEl) topEl.textContent = `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
if (printEl) printEl.textContent = str;
}
// =========================================================================
// 🍔 LÓGICA DO SISTEMA DE COZINHA ("MONTA-LANCHE")
// =========================================================================
// A montagem respeita integralmente as etapas oficiais da versão 8.7.
let kitchenClockId = null;
let kitchenStartedAt = 0;
let kitchenFinishedAt = 0;
let kitchenMistakes = 0;
const KITCHEN_VISUALS = [
  [/pão|base|coroa|club/i,['🍞','kitchen-bread']],
  [/queijo|cheddar|ementhal/i,['🧀','kitchen-cheese']],
  [/carne|hamb[uú]rguer/i,['🥩','kitchen-meat']],
  [/alface/i,['🥬','kitchen-lettuce']],
  [/bacon/i,['🥓','kitchen-bacon']],
  [/tomate/i,['🍅','kitchen-tomato']],
  [/picles/i,['🥒','kitchen-pickle']],
  [/cebola/i,['🧅','kitchen-onion']],
  [/geleia/i,['🍯','kitchen-sauce']],
  [/molho|mostarda|ketchup|maionese/i,['🥫','kitchen-sauce']]
];
function kitchenIngredientVisual(step) {
  for (const [pattern,visual] of KITCHEN_VISUALS) if (pattern.test(step)) return visual;
  return ['🥗','kitchen-other'];
}
function kitchenFormatTime() {
  const start = kitchenStartedAt;
  if (!start) return '00:00';
  const secs = Math.floor(((kitchenFinishedAt || Date.now()) - start)/1000);
  return `${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;
}
function kitchenUpdateClock() {
  const badge=$('kitchenTimeBadge');if(badge)badge.textContent=`⏱ ${kitchenFormatTime()}`;
}
function selectKitchenRecipe(id) {
  playTabClickSound();
  activeRecipe = KITCHEN_RECIPES.find(r => r.id === id) || KITCHEN_RECIPES[0];
  resetKitchenGame();
}
function initKitchenGame() {activeRecipe=KITCHEN_RECIPES[0];resetKitchenGame();}
function resetKitchenGame() {
  currentRecipeStep=0;kitchenStartedAt=0;kitchenFinishedAt=0;kitchenMistakes=0;
  clearInterval(kitchenClockId);kitchenClockId=null;
  const fb=$('kitchenFeedback');if(fb)fb.classList.add('hidden');
  renderKitchenState(); kitchenUpdateClock();
}
function renderKitchenState() {
  const tray=$('kitchenTrayBuilt'),badge=$('kitchenProgressBadge'),grid=$('kitchenChoicesGrid');
  const stack=$('kitchenVisualStack'),fill=$('kitchenProgressFill'),track=$('kitchenProgressTrack');
  if(!tray || !grid || !stack)return;
  const total=activeRecipe.steps.length;
  const completed=currentRecipeStep>=total;
  const pct=Math.round(100*currentRecipeStep/total);
  badge.textContent=completed?'✅ Lanche pronto!':`Etapa ${currentRecipeStep}/${total}`;
  if(fill)fill.style.width=`${pct}%`;
  if(track)track.setAttribute('aria-valuenow',String(pct));
  const done=activeRecipe.steps.slice(0,currentRecipeStep);
  // Mostra as últimas seis camadas para não crescer demais no celular.
  if(!done.length)stack.innerHTML='<span class="kitchen-empty-visual">🍔</span><small>Seu lanche aparece aqui</small>';
  else stack.innerHTML=done.slice(-6).map((step,i)=>{
    const [emoji,type]=kitchenIngredientVisual(step);
    return `<div class="kitchen-layer ${type}" title="${trainerSafeHtml(step)}"><span aria-hidden="true">${emoji}</span><span>${trainerSafeHtml(step)}</span></div>`;
  }).join('');
  tray.textContent = completed ? `🎉 ${activeRecipe.name.replace(/^[^a-zA-ZÀ-ÿ]+/, '')} finalizado! ${kitchenMistakes ? kitchenMistakes+' tentativa(s) incorreta(s).' : 'Montagem perfeita, sem erros!'}`
    : currentRecipeStep===0?'Toque nos ingredientes na ordem correta para construir o lanche.':`${currentRecipeStep} de ${total} ingredientes adicionados. Continue!`;
  grid.replaceChildren();
  if(completed){
    const btn=document.createElement('button');btn.type='button';btn.className='kitchen-play-again';btn.textContent='🔄 Montar outro lanche';
    btn.onclick=()=>{const idx=KITCHEN_RECIPES.findIndex(r=>r.id===activeRecipe.id);const next=KITCHEN_RECIPES[(idx+1)%KITCHEN_RECIPES.length];activeRecipe=next;$('kitchenRecipeSelect').value=next.id;resetKitchenGame();};
    grid.appendChild(btn);return;
  }
  // Duplicatas iguais aparecem como uma única opção; o jogador ainda precisa adicioná-las nas etapas exigidas.
  const choices=[...new Set(activeRecipe.steps.slice(currentRecipeStep))];
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
  choices.forEach(step=>{
    const [emoji]=kitchenIngredientVisual(step);
    const btn=document.createElement('button');btn.type='button';btn.className='kitchen-choice';
    const icon=document.createElement('span');icon.className='kitchen-choice-emoji';icon.textContent=emoji;
    const txt=document.createElement('span');txt.className='kitchen-choice-label';txt.textContent=step;
    const plus=document.createElement('span');plus.className='kitchen-choice-plus';plus.textContent='+';
    btn.append(icon,txt,plus);btn.onclick=()=>handleKitchenStepClick(btn,step);grid.appendChild(btn);
  });
  renderXpModeStatus();
}
function handleKitchenStepClick(btn, chosenStep) {
  if(currentRecipeStep>=activeRecipe.steps.length) return;
  const expected=activeRecipe.steps[currentRecipeStep],fb=$('kitchenFeedback');
  if(chosenStep!==expected){
    kitchenMistakes++;playWrongAnswerSound();
    btn.classList.add('kitchen-choice-wrong');
    fb.className='kitchen-feedback kitchen-feedback-error';
    fb.textContent='❌ Ainda não! Procure o próximo ingrediente na sequência oficial.';
    return;
  }
  if(!kitchenStartedAt){ kitchenStartedAt=Date.now();kitchenClockId=setInterval(kitchenUpdateClock,1000); }
  currentRecipeStep++;
  fb.classList.add('hidden');
  playCardFlipSound();
  if(currentRecipeStep===activeRecipe.steps.length){
    kitchenFinishedAt=Date.now();clearInterval(kitchenClockId);kitchenClockId=null;
    const awarded=addXp(activeRecipe.xp);
    recordMissionActivity('kitchen_complete',activeRecipe.id);
    renderKitchenState();kitchenUpdateClock();
    fb.className='kitchen-feedback kitchen-feedback-success';
    fb.textContent=`🏆 Montagem concluída em ${kitchenFormatTime()}! +${awarded} XP no seu perfil. ${kitchenMistakes===0?'Perfeito, sem erros!':'Continue treinando para melhorar sua precisão.'}`;
  } else renderKitchenState();
}
// =========================================================================
// FOTOS DA GALERIA, PRINT DO RANKING E TEMA
// =========================================================================
