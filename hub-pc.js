/* Venture Hub PC 2.0 · integração com o HTML enviado · somente camada de interface.
   Não usa localStorage, sessionStorage, IndexedDB, fetch, MQTT nem métodos de XP. */
(function(){
 'use strict';
 function setup(){
  if(document.getElementById('venturePcDashboard')||!document.getElementById('tab-quiz'))return;
  const side=document.createElement('aside');side.id='venturePcSidebar';side.setAttribute('aria-label','Menu de navegação do computador');
  side.innerHTML=`<div class="vh-brand"><div class="vh-mark" aria-hidden="true">🍟</div><div><strong>VENTURE</strong><small>OLIMPÍADAS DO BÁSICO</small></div></div>
  <div class="vh-label">SUA PLATAFORMA</div><nav class="vh-nav" aria-label="Navegação desktop">
  <button data-vh-tab="quiz"><span class="vh-ic">⌂</span>Início e simulado</button>
  <button data-vh-tab="training"><span class="vh-ic">🍔</span>Centro de treinos</button>
  <button data-vh-tab="missions"><span class="vh-ic">🎯</span>Missões e medalhas</button>
  <button data-vh-tab="prizes"><span class="vh-ic">🏆</span>Ranking</button>
  <button data-vh-tab="profile"><span class="vh-ic">👤</span>Meu perfil</button>
  <button data-vh-tab="book"><span class="vh-ic">📚</span>Book de estudos</button>
  <button data-vh-tab="more"><span class="vh-ic">⚙️</span>Mais opções</button>
  </nav><div class="vh-sidebottom"><small>EVOLUA TODO DIA</small><strong>Seu próximo nível começa aqui.</strong><p>Estude, complete missões e acompanhe sua evolução!</p></div><div class="vh-footer">VENTURE · HUB PARA PC</div>`;
  const dashboard=document.createElement('div');dashboard.id='venturePcDashboard';
  dashboard.innerHTML=`<div class="vh-hero"><div style="z-index:1"><span class="vh-pill">✦ SUA CENTRAL DE TREINAMENTO</span><h2 id="vhWelcome">Sua jornada começa aqui.</h2><p>Treine, conquiste novos níveis e acompanhe seus resultados em um só lugar.</p><div class="vh-heroactions"><button type="button" data-vh-tab="quiz">🎯 Continuar simulado</button><button type="button" data-vh-tab="missions" class="ghost">🏅 Ver missões</button></div></div><div class="vh-trophy" aria-hidden="true">🏆</div></div>
  <div class="vh-progresspanel"><div class="vh-progress-top"><span>🎯 Evolução para o próximo nível</span><strong id="vhNextLevel">Continue treinando!</strong></div><div class="vh-progress-track"><div id="vhProgressFill" class="vh-progress-fill"></div></div></div>
  <div class="vh-statrow">
    <div class="vh-stat"><span class="vh-sticon">⚡</span><div><small>Meu XP atual</small><strong id="vhXp">—</strong></div></div>
    <div class="vh-stat"><span class="vh-sticon">🏅</span><div><small>Meu nível</small><strong id="vhLevel">—</strong></div></div>
    <div class="vh-stat"><span class="vh-sticon">✅</span><div><small>Acertos</small><strong id="vhHits">—</strong></div></div>
    <div class="vh-stat"><span class="vh-sticon">🔥</span><div><small>Sequência</small><strong id="vhStreak">—</strong></div></div>
  </div>
  <div class="vh-sectionhead"><h3>Explore o Venture</h3><span>Acesse rapidamente seus espaços</span></div>
  <div class="vh-cards">
    <button type="button" class="vh-card" data-vh-tab="training" data-vh-mode="kitchen"><span class="vh-card-icon">🍔</span><strong>Cozinha 2.0</strong><small>Treine a montagem das receitas</small><span class="vh-arrow">↗</span></button>
    <button type="button" class="vh-card" data-vh-tab="training" data-vh-mode="duel"><span class="vh-card-icon">⚔️</span><strong>Arena de duelos</strong><small>Desafie seus colegas</small><span class="vh-arrow">↗</span></button>
    <button type="button" class="vh-card" data-vh-tab="missions"><span class="vh-card-icon">🎁</span><strong>Baú e missões</strong><small>Veja desafios e recompensas</small><span class="vh-arrow">↗</span></button>
    <button type="button" class="vh-card" data-vh-tab="prizes"><span class="vh-card-icon">🏆</span><strong>Ranking geral</strong><small>Acompanhe a classificação</small><span class="vh-arrow">↗</span></button>
  </div>
  <div class="vh-sectionhead"><h3>Jornada e desenvolvimento</h3><span>Continue sua evolução</span></div>
  <div class="vh-cards vh-cards-secondary">
    <a class="vh-card vh-card-featured" href="./jornada-campeoes.html" aria-label="Abrir Jornada dos Campeões em modo de demonstração"><span class="vh-card-icon">👑</span><strong>Jornada dos Campeões</strong><small>27 níveis, 5 ligas e chefões · XP de demonstração</small><span class="vh-arrow">↗</span></a>
    <button type="button" class="vh-card" data-vh-tab="book"><span class="vh-card-icon">📚</span><strong>Book de estudos</strong><small>Consulte conteúdos e revise padrões</small><span class="vh-arrow">↗</span></button>
    <button type="button" class="vh-card" data-vh-tab="profile"><span class="vh-card-icon">🌟</span><strong>Meu perfil</strong><small>Veja suas conquistas e progresso</small><span class="vh-arrow">↗</span></button>
  </div><div class="vh-quicknote"><strong>🔒 Pontuação preservada:</strong> este painel apenas mostra números já exibidos pelo jogo. Não acrescenta nem altera XP, acertos ou cadastros.</div>`;
  document.body.insertBefore(side,document.querySelector('.app-header')||document.body.firstChild);
  document.getElementById('tab-quiz').insertBefore(dashboard,document.getElementById('tab-quiz').firstChild);
  function act(tab,mode){
   if(typeof window.switchMainTab==='function')window.switchMainTab(tab);
   if(mode&&typeof window.switchTrainingMode==='function')window.switchTrainingMode(mode);
   paint();
  }
  document.addEventListener('click',function(ev){const b=ev.target.closest('[data-vh-tab]');if(!b)return;act(b.dataset.vhTab,b.dataset.vhMode);});
  const get=(id)=>{const el=document.getElementById(id);return el?el.textContent.trim():''};
  function update(){
   const name=get('userNameDisplay').replace(/\s+/g,' ').trim();
   const greeting=(new Date().getHours()<12?'Bom dia':new Date().getHours()<18?'Boa tarde':'Boa noite');
   const hello=document.getElementById('vhWelcome');if(hello)hello.textContent=`${greeting}${name&&name!=='Colaborador'?', '+name.split(' ')[0]:''}! Vamos evoluir?`;
   const ids=[['vhXp','userXpDisplay'],['vhLevel','currentLevelNum'],['vhHits','statHitsDisplay'],['vhStreak','statStreakDisplay']];
   ids.forEach(pair=>{const el=document.getElementById(pair[0]);if(el){const value=get(pair[1]);if(value&&el.textContent!==value)el.textContent=value;}});
   const target=document.getElementById('vhNextLevel');
   if(target){const goal=get('nextLevelTarget');if(goal&&target.textContent!==goal)target.textContent=goal;}
   const original=document.getElementById('xpProgressBar');
   const fill=document.getElementById('vhProgressFill');
   if(fill&&original){const width=Number.parseFloat(original.style.width);if(Number.isFinite(width))fill.style.width=Math.min(100,Math.max(0,width))+'%';}
  }
  function paint(){
   const current=Array.from(document.querySelectorAll('.app-screen')).find(el=>!el.classList.contains('hidden'))?.id.replace('tab-','')||'quiz';
   side.querySelectorAll('[data-vh-tab]').forEach(el=>{const selected=el.dataset.vhTab===current;el.classList.toggle('is-current',selected);if(selected)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  }
  // Apenas lê texto que o próprio aplicativo já apresenta na tela.
  update();paint();window.setInterval(()=>{if(window.matchMedia('(min-width:1100px)').matches){update();paint();}},2500);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
