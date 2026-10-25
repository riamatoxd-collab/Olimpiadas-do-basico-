/* Olimpíadas do Básico — Venture 9.0.1 BETA · Taça em aba própria.
 * PROTEÇÃO: este módulo NUNCA chama addXp, nunca grava diretamente no saldo xp,
 * e nunca escreve senhas. O quiz padrão continua responsável pelo XP de acertos.
 * Placar semanal = registro derivado de até 5 respostas/dia do quiz existente.
 * A classificação usa o sincronizador LEGADO: é informativa, NÃO auditada por servidor.
 */
(function () {
  'use strict';
  const NS = 'ventureV90', LIMIT = 5, POINTS = 20;
  const $v = id => document.getElementById(id);
  let activeKey = null, activeDay = null, lastUser = null;
  function today(d = new Date()) {
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  }
  function weekStart(d = new Date()) {
    const x = new Date(d.getFullYear(),d.getMonth(),d.getDate());
    x.setDate(x.getDate() - ((x.getDay()+6)%7));
    return today(x);
  }
  function weekEnd(d = new Date()) {
    const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());
    x.setDate(x.getDate()+ (6-((x.getDay()+6)%7)));
    return today(x);
  }
  function safeAnswers(raw) {
    if (!Array.isArray(raw)) return [];
    const seen=new Set(), result=[];
    for(const obj of raw.slice(0,30)) {
      if(!obj||typeof obj!=='object')continue;
      const id=String(obj.id??'').slice(0,80);
      if(!id||seen.has(id))continue;
      seen.add(id);
      result.push({id,correct:obj.correct===true,xp:Math.max(0,Math.min(50,Math.trunc(Number(obj.xp)||0))),at:Number.isFinite(Number(obj.at))?Number(obj.at):0});
    }
    return result.sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id)).slice(0,LIMIT);
  }
  function cleanData(data){
    const days={};
    const raw=data&&typeof data==='object'&&data.days&&typeof data.days==='object'?data.days:{};
    const dates=Object.keys(raw).filter(k=>/^\d{4}-\d\d-\d\d$/.test(k)).sort().slice(-35);
    for(const date of dates){days[date]={answers:safeAnswers(raw[date]?.answers)};}
    return {days};
  }
  function mergedData(a,b){
    const x=cleanData(a).days,y=cleanData(b).days,days={};
    for(const key of [...new Set([...Object.keys(x),...Object.keys(y)])].sort().slice(-35)){
      const entries=[...(x[key]?.answers||[]),...(y[key]?.answers||[])];
      days[key]={answers:safeAnswers(entries)};
    }
    return {days};
  }
  function loggedInUser(){
    try{
      if(typeof currentUserKey==='undefined'||typeof users==='undefined'||!currentUserKey)return null;
      const u=users[currentUserKey];
      return u&&!u._deleted?{key:currentUserKey,user:u}:null;
    }catch(_){return null;}
  }
  function dayResult(u,date){
    const arr=cleanData(u?.[NS]).days[date]?.answers||[];
    return {answers:arr.length,correct:arr.filter(x=>x.correct).length,score:arr.filter(x=>x.correct).length*POINTS,xp:arr.reduce((sum,x)=>sum+x.xp,0)};
  }
  function weeklyResult(u,now=new Date()){
    const from=weekStart(now),to=weekEnd(now), days=cleanData(u?.[NS]).days;
    return Object.entries(days).filter(([day])=>day>=from&&day<=to).reduce((a,[,v])=>{
      const arr=v.answers||[];
      a.answers+=arr.length;a.correct+=arr.filter(x=>x.correct).length;
      a.score+=arr.filter(x=>x.correct).length*POINTS;a.xp+=arr.reduce((s,x)=>s+x.xp,0);
      return a;
    },{answers:0,correct:0,score:0,xp:0});
  }
  function weeklyBoard(){
    try {
      if(typeof users==='undefined')return [];
      return Object.entries(users).filter(([,u])=>u&&u.name&&!u._deleted)
        .map(([id,u])=>({id,name:String(u.name),avatar:!String(u.avatar||'').startsWith('data:')?String(u.avatar||'🍔'):'👤',...weeklyResult(u)}))
        .filter(x=>x.answers>0).sort((a,b)=>b.score-a.score||b.correct-a.correct||a.name.localeCompare(b.name,'pt-BR'));
    }catch(_){return [];}
  }
  function showStatus(text,kind='info'){
    const el=$v('v90Status');if(!el)return;
    el.textContent=text;el.dataset.kind=kind;
  }
  // Mescla apenas a área ventureV90; não altera nenhuma regra de XP, contas ou missões.
  function attachMerge(){
    if(typeof mergeSingleUser!=='function'||mergeSingleUser.__v90Wrapped)return;
    const original=mergeSingleUser;
    const wrapper=function(ex,inc){
      const result=original.apply(this,arguments);
      if(result&&((ex&&ex[NS])||(inc&&inc[NS])))result[NS]=mergedData(ex&&ex[NS],inc&&inc[NS]);
      return result;
    };
    wrapper.__v90Wrapped=true;
    window.mergeSingleUser=wrapper;
  }
  function saveEvent(info,questionId,correct,xp){
    const u=users[info.key];if(!u||u._deleted)return false;
    const day=today();
    const data=cleanData(u[NS]);
    const current=data.days[day]?.answers||[];
    if(current.length>=LIMIT||current.some(row=>row.id===String(questionId)))return false;
    current.push({id:String(questionId),correct:!!correct,xp:correct?xp:0,at:Date.now()});
    data.days[day]={answers:safeAnswers(current)};
    u[NS]=data;
    // O registro semanal acompanha as operações NORMAIS do jogo.
    u.updatedAt=Math.max(Number(u.updatedAt)||0,Date.now());
    // Reutiliza o mecanismo já existente; não mexe na fórmula de XP.
    if(typeof scheduleCloudSync==='function')scheduleCloudSync(info.key,false);
    else if(typeof STORAGE_USERS_KEY!=='undefined')localStorage.setItem(STORAGE_USERS_KEY,JSON.stringify(users));
    return true;
  }
  function attachQuiz(){
    if(typeof checkQuizAnswer!=='function'||checkQuizAnswer.__v90Wrapped)return;
    const original=checkQuizAnswer;
    const wrapper=function(selectedBtn,chosen,correct,letter){
      const info=loggedInUser();
      const valid=!!(activeKey&&activeDay===today()&&info&&info.key===activeKey&&$v('tab-quiz')&&!$v('tab-quiz').classList.contains('hidden'));
      const id=valid&&typeof currentQuizQuestionId!=='undefined'?String(currentQuizQuestionId):null;
      const before=valid?Number(info.user.xp)||0:0;
      const pending=valid&&id&&!($v('quizFeedback')&&!$v('quizFeedback').classList.contains('hidden'))&&dayResult(info.user,today()).answers<LIMIT;
      const result=original.apply(this,arguments); // ESTE código credita o XP oficial normalmente.
      if(pending){
        const fresh=loggedInUser();
        if(fresh&&fresh.key===activeKey){
          const awarded=Number(fresh.user.xp)-before;
          const correctAnswer=chosen===correct;
          const xp=correctAnswer&&awarded>=0&&awarded<=50?awarded:0;
          try{
            saveEvent(fresh,id,correctAnswer,xp);
          }catch(err){console.warn('Taça Semanal: registro não salvo',err);showStatus('Sua resposta no Simulado foi registrada normalmente, mas a Taça não conseguiu salvar este resultado.','warn');}
          const day=dayResult(fresh.user,today());
          if(day.answers>=LIMIT){activeKey=null;activeDay=null;showStatus(`🎉 Desafio concluído! ${day.correct}/5 acertos, ${day.score} pontos na Taça e ${day.xp} XP recebidos pelo Simulado.`, 'success');}
          else showStatus(`🎯 ${day.answers}/5 perguntas respondidas. Continue no Simulado para completar a Taça.`, 'info');
        }
      }
      paint();
      return result;
    };
    wrapper.__v90Wrapped=true;
    window.checkQuizAnswer=wrapper;
  }
  function begin(){
    const info=loggedInUser();
    if(!info){showStatus('Entre na sua conta do Venture para participar.','warn');return;}
    const key=info.key,date=today();
    if(dayResult(info.user,date).answers>=LIMIT){showStatus('Você já completou as cinco perguntas de hoje. Volte amanhã para uma nova rodada!','success');return;}
    activeKey=key;activeDay=date;lastUser=key;
    if(typeof switchMainTab==='function')switchMainTab('quiz');
    if(typeof checkAndRenderCooldownScreen==='function'&&checkAndRenderCooldownScreen()){
      showStatus('Seus corações estão recarregando. Você poderá continuar o desafio quando voltarem.','warn');paint();return;
    }
    if($v('nextQuizBtn')&&!$v('nextQuizBtn').classList.contains('hidden')&&typeof loadNextQuizQuestion==='function')loadNextQuizQuestion();
    showStatus(`⚡ Desafio ativado: responda até completar cinco perguntas. O XP é concedido pelo próprio Simulado.`, 'info');
    paint();
    const q=$v('quizQuestionText');if(q)q.scrollIntoView({behavior:'smooth',block:'center'});
  }
  // A Taça tem sua própria tela; NÃO é mais inserida dentro do Simulado.
  function revealRanking(){
    if(typeof switchMainTab==='function')switchMainTab('taca');
  }
  function installNavigation(){
    if(typeof window.switchMainTab!=='function'||window.switchMainTab.__v90SeparateTab)return;
    const original=window.switchMainTab;
    const nav=function(tab){
      if(tab==='taca'){
        // O núcleo conhece somente as abas originais. Mantemos o fluxo nativo,
        // com o botão Mais ativo, e substituímos VISUALMENTE a tela Mais pela Taça.
        const result=original.call(this,'more');
        $v('tab-more')?.classList.add('hidden');
        $v('tab-taca')?.classList.remove('hidden');
        paint();
        return result;
      }
      const result=original.apply(this,arguments);
      $v('tab-taca')?.classList.add('hidden');
      return result;
    };
    nav.__v90SeparateTab=true;
    window.switchMainTab=nav;
  }
  function paint(){
    const hub=$v('v90Hub');if(!hub)return;
    const info=loggedInUser();
    if((info?.key||null)!==lastUser){activeKey=null;activeDay=null;lastUser=info?.key||null;}
    if(!info){
      $v('v90Welcome').textContent='Sua próxima conquista começa aqui.';
      $v('v90MyRank').textContent='—';$v('v90MyScore').textContent='0';$v('v90DailyProgress').textContent='Entre para participar';
      $v('v90Start').textContent='Entrar no Venture para jogar';$v('v90Start').disabled=true;
    }else{
      const d=dayResult(info.user,today());const w=weeklyResult(info.user);const board=weeklyBoard();
      const rank=board.findIndex(p=>p.id===info.key);
      $v('v90Welcome').textContent=`Uma nova chance, ${String(info.user.name||'colaborador').split(/\s+/)[0]}!`;
      $v('v90MyScore').textContent=String(w.score);
      $v('v90MyRank').textContent=rank>=0?`${rank+1}º`:'—';
      $v('v90DailyProgress').textContent=`${d.answers} de ${LIMIT} questões · ${d.correct} acertos`;
      const isCompleted=d.answers>=LIMIT;
      $v('v90Start').disabled=isCompleted;
      $v('v90Start').textContent=isCompleted?'✓ Desafio de hoje concluído':activeKey===info.key?'Continuar desafio':'Começar desafio do dia';
    }
    $v('v90WeekPeriod').textContent=`${weekStart().slice(8,10)}/${weekStart().slice(5,7)} a ${weekEnd().slice(8,10)}/${weekEnd().slice(5,7)}`;
    const top=weeklyBoard();
    const area=$v('v90BoardList');if(!area)return;
    area.replaceChildren();
    if(top.length===0){const no=document.createElement('p');no.className='v90-empty';no.textContent='Ainda não há resultados nesta semana. Complete o desafio de cinco perguntas para abrir a competição!';area.append(no);}
    else for(const [i,p] of top.slice(0,12).entries()){
      const row=document.createElement('div');row.className='v90-board-row'+(info&&p.id===info.key?' mine':'');
      const rank=document.createElement('b');rank.textContent=String(i+1)+'º';
      const face=document.createElement('span');face.className='v90-board-avatar';face.textContent=p.avatar.length<=4?p.avatar:'🍔';
      const desc=document.createElement('div');desc.className='v90-board-name';
      const name=document.createElement('strong');name.textContent=p.name;
      const sub=document.createElement('small');sub.textContent=`${p.correct} acertos em ${p.answers} perguntas`;
      desc.append(name,sub);
      const score=document.createElement('b');score.className='v90-board-points';score.textContent=`${p.score} pts`;
      row.append(rank,face,desc,score);area.append(row);
    }
    const maxWeek=7*LIMIT*POINTS;
    const score=info?weeklyResult(info.user).score:0;
    $v('v90TrackFill').style.width=`${Math.min(100,score/maxWeek*100)}%`;
  }
  function mount(){
    if($v('v90Hub')||!$v('tab-quiz'))return;

    // Tela própria de campeonato, ao lado do Simulado (e não dentro dele).
    const screen=document.createElement('section');
    screen.id='tab-taca';
    screen.className='app-screen hidden space-y-5 v90-taca-screen';
    screen.setAttribute('aria-label','Taça dos Campeões — classificação semanal');
    screen.innerHTML='<div class="v90-pagehead"><div><span class="page-eyebrow">COMPETIÇÃO SEMANAL · VENTURE 9.0</span><h1>🏆 Taça dos Campeões</h1><p>Uma disputa nova toda semana, sem zerar o XP geral.</p></div><button type="button" class="v90-backlink" id="v90BackToMore">← Mais opções</button></div>';
    $v('tab-quiz').insertAdjacentElement('afterend',screen);
    const container=document.createElement('div');container.id='v90Hub';container.className='v90-hub';
    container.innerHTML=`<div class="v90-hero"><div class="v90-hero-content"><span class="v90-kicker">✦ VENTURE 9.0 · TAÇA SEMANAL</span><h2 id="v90Welcome">Sua próxima conquista começa aqui.</h2><p>Toda semana é uma nova chance de vencer. Seus XP antigos continuam valendo no ranking geral.</p><div class="v90-hero-actions"><button type="button" id="v90Start">Começar desafio do dia</button><button type="button" id="v90SeeRanking">🏆 Ver classificação</button></div><small>5 questões por dia · 20 pontos por acerto na Taça · XP normal do Simulado</small></div><div class="v90-hero-trophy" aria-hidden="true">🏆</div></div><div class="v90-overview"><div class="v90-metric"><span>🏅 Minha Taça Semanal</span><strong id="v90MyScore">0</strong><small>pontos nesta semana</small></div><div class="v90-metric"><span>⭐ Minha posição</span><strong id="v90MyRank">—</strong><small>classificação da semana</small></div><div class="v90-metric"><span>🎯 Desafio de hoje</span><strong id="v90DailyProgress">0 de 5 questões</strong><small>com XP habitual por acerto</small></div></div><p id="v90Status" class="v90-status" role="status" aria-live="polite">Comece o desafio para responder às perguntas no Simulado.</p><div id="v90Leaderboard" class="v90-leaderboard"><div class="v90-leader-head"><div><span>CAMPEONATO DA SEMANA</span><h3>🏆 Classificação da Taça</h3></div><small id="v90WeekPeriod"></small></div><div class="v90-track"><div id="v90TrackFill"></div></div><div id="v90BoardList" class="v90-board-list"></div><div class="v90-footnote">⚠️ Fase beta: placar compartilhado pelo sincronizador atual, sem auditoria em servidor. Não usar para premiações oficiais até validação.</div></div>`;
    screen.append(container);
    $v('v90Start').addEventListener('click',begin);
    $v('v90SeeRanking').addEventListener('click',()=>{
      $v('v90Leaderboard')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    $v('v90BackToMore').addEventListener('click',()=>window.switchMainTab?.('more'));

    const more=$v('tab-more')?.querySelector('.more-menu');
    if(more&&!$v('v90MoreButton')){
      const btn=document.createElement('button');btn.type='button';btn.id='v90MoreButton';btn.className='more-menu-item';
      btn.innerHTML='<span class="more-menu-icon" aria-hidden="true">🏆</span><span class="more-menu-copy"><strong>Taça dos Campeões · Venture 9.0</strong><small>Desafio de 5 perguntas com XP normal e ranking semanal beta</small></span><span class="more-chevron" aria-hidden="true">›</span>';
      btn.addEventListener('click',revealRanking);more.insertBefore(btn,more.firstChild);
    }
    const sidebar=$v('venturePcSidebar')?.querySelector('.vh-nav');
    if(sidebar&&!$v('v90SideButton')){
      const btn=document.createElement('button');btn.type='button';btn.id='v90SideButton';
      btn.dataset.vhTab='taca';
      btn.innerHTML='<span class="vh-ic">🏆</span>Taça dos Campeões';
      btn.addEventListener('click',e=>{e.stopPropagation();revealRanking();});sidebar.insertBefore(btn,sidebar.children[1]||null);
      const quizLabel=sidebar.querySelector('[data-vh-tab="quiz"]');
      if(quizLabel)quizLabel.innerHTML='<span class="vh-ic">🎯</span>Simulado';
      const moreLabel=sidebar.querySelector('[data-vh-tab="more"]');
      if(moreLabel)moreLabel.innerHTML='<span class="vh-ic">⌂</span>Início e Mais';
    }
    // No PC, o dashboard premium passa a ficar em Mais, deixando o Simulado
    // reservado a perguntas, coração, acertos e revisão do quiz.
    const pcDashboard=$v('venturePcDashboard');
    const moreScreen=$v('tab-more');
    if(pcDashboard&&moreScreen&&pcDashboard.parentElement===$v('tab-quiz'))moreScreen.prepend(pcDashboard);

    installNavigation();
    attachMerge();attachQuiz();paint();
    setInterval(()=>{installNavigation();attachMerge();attachQuiz();paint();},3500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  // Testes de regressão usam apenas as funções puras abaixo, sem contas reais.
  if(typeof window!=='undefined'&&window.location?.protocol==='file:')window.__Venture90Test={today,weekStart,weekEnd,safeAnswers,cleanData,mergedData,dayResult,weeklyResult};
})();
