const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/10-arena-venture.js'),'utf8');
function makeContext(multiplier=1) {
  const storage = new Map();
  const localStorage = {getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
  class ClassList {
    constructor(){this.s=new Set(['hidden']);}
    add(...v){v.forEach(x=>this.s.add(x));}
    remove(...v){v.forEach(x=>this.s.delete(x));}
    contains(v){return this.s.has(v);}
    toggle(v, force){if(force===undefined){if(this.s.has(v)){this.s.delete(v);return false;}this.s.add(v);return true;}if(force)this.s.add(v);else this.s.delete(v);return !!force;}
  }
  const els = new Map();
  function element(id='') { return {id,classList:new ClassList(),style:{},children:[],listeners:{},textContent:'',innerHTML:'',disabled:false,value:'',className:'',attributes:{},
    replaceChildren(...children){this.children=[...children];},appendChild(child){this.children.push(child);},addEventListener(name,fn){this.listeners[name]=fn;},setAttribute(k,v){this.attributes[k]=String(v);},querySelectorAll(){return this.children;}}; }
  const document = {getElementById(id){if(!els.has(id))els.set(id,element(id));return els.get(id);},createElement(tag){return element(tag);}};
  const bank = Array.from({length:12},(_,i)=>({id:i+1,level:i<6?'Básico':'Intermediário',q:`Pergunta ${i+1}`,a:`Resposta correta ${i+1}`,w:[`Errada A ${i+1}`,`Errada B ${i+1}`,`Errada C ${i+1}`]}));
  const users = {teste:{name:'TESTE',xp:0,mistakes:[1,2,3],updatedAt:1,xpTransactions:{}}};
  let invitedKey = null;
  const context = {console,Date,Intl,Math,Map,Set,Object,Number,Array,String,JSON,Promise,
    window:{addEventListener(){}},document,localStorage,users,currentUserKey:'teste',STORAGE_USERS_KEY:'users',
    $:id=>document.getElementById(id),getQuestionBank:()=>bank,
    scheduleCloudSync:(key)=>localStorage.setItem('users',JSON.stringify(users)),
    addXp:(amount,id,metadata)=>{const txId=String(id||`legacy-${Date.now()}-${Math.random()}`);if(users.teste.xpTransactions[txId])return 0;const awarded=amount*multiplier;users.teste.xp+=awarded;users.teste.xpTransactions[txId]={id:txId,delta:awarded,source:metadata?.source||'test',createdAt:Date.now()};localStorage.setItem('users',JSON.stringify(users));return awarded;},
    getXpTransaction:(id,user=users.teste)=>user?.xpTransactions?.[id]||null,
    recordMissionActivity:()=>{},recordMistakeQuestion:(id)=>{if(!users.teste.mistakes.includes(id))users.teste.mistakes.push(id);},
    renderMissionHub:()=>{},duelHistoryList:[],sendLiveDuelInvite:()=>{invitedKey=document.getElementById('duelOpponentSelect').value;},alert:(m)=>{throw new Error('Unexpected alert: '+m)}};
  vm.createContext(context);
  vm.runInContext(source,context);
  return {context,users,localStorage,els,bank,getInvitedKey:()=>invitedKey};
}
function assert(condition,message){if(!condition)throw new Error(message);}
const {context:c,users,localStorage,bank}=makeContext(1);
assert(c.ventureArenaTodayKey(new Date('2026-10-24T12:00:00-03:00'))==='2026-10-24','Brasilia date key');
c.startVentureArena();
let session=users.teste.ventureArena.activeSession;
assert(session.questionIds.length===5,'session has five questions');
assert(new Set(session.questionIds.map(String)).size===5,'questions are unique');
assert([1,2,3].every(id=>session.questionIds.includes(id)),'prioritizes saved mistakes');
const firstId=session.questionIds[0];
const first=bank.find(q=>q.id===firstId);
c.answerVentureArenaQuestion(first,first.a,null);
const afterFirst=users.teste.xp;
c.answerVentureArenaQuestion(first,first.a,null);
assert(users.teste.xp===afterFirst,'duplicate answer did not award XP twice');
c.nextVentureArenaQuestion();
for(let i=1;i<5;i++){
  session=users.teste.ventureArena.activeSession;
  const q=bank.find(item=>String(item.id)===String(session.questionIds[session.index]));
  c.answerVentureArenaQuestion(q,i<4?q.a:'definitivamente errada',null);
  c.nextVentureArenaQuestion();
}
assert(users.teste.ventureArena.activeSession.completed===true,'session completed');
assert(users.teste.ventureArena.activeSession.correct===4,'four correct answers recorded');
assert(users.teste.xp===130,'4 correct + 50 completion bonus = 130 XP');
const xpAtEnd=users.teste.xp;
c.startVentureArena();
assert(users.teste.xp===xpAtEnd,'daily repeat does not add XP');
assert(!!users.teste.ventureArena.dailyClaims[c.ventureArenaTodayKey()],'daily completion claim persisted');
assert(JSON.parse(localStorage.getItem('users')).teste.ventureArena.activeSession.completed,'progress persisted to localStorage');
const day=c.ventureArenaTodayKey();
const merged=c.mergeVentureArenaState(
 {dailyClaims:{[day]:{claimedAt:100,rewardXp:50}},history:{},activeSession:{day,completed:false,answers:{'1':{correct:true}},updatedAt:200}},
 {dailyClaims:{'2026-10-23':{claimedAt:90,rewardXp:50}},history:{[day]:{day,correct:4,total:5,completedAt:300}},activeSession:{day,completed:true,answers:{'1':{correct:true},'2':{correct:true}},updatedAt:300}}
);
assert(merged.dailyClaims[day] && merged.dailyClaims['2026-10-23'],'merge unions daily claims');
assert(merged.activeSession.completed===true,'merge prefers completed session');
assert(merged.history[day].correct===4,'merge preserves history');
// Exercise the actual legacy mergeSingleUser function to make the concurrent-XP limitation explicit.
const syncSource=fs.readFileSync(path.join(root, 'js/06-contas-sincronizacao.js'),'utf8');
const fnStart=syncSource.indexOf('function mergeSingleUser(ex, inc) {');
if(fnStart<0) throw new Error('Could not locate legacy mergeSingleUser');
const braceStart=syncSource.indexOf('{',fnStart); let depth=0, fnEnd=-1;
for(let i=braceStart;i<syncSource.length;i++){if(syncSource[i]==='{')depth++;else if(syncSource[i]==='}'){depth--;if(depth===0){fnEnd=i+1;break;}}}
const helperStubs=`function mergeQuizStreak(){return {}}; function mergeQuizRotation(a,b){return b||a}; function mergeXpLedgerState(a,b){return {xp:Math.max(Number(a?.xp)||0,Number(b?.xp)||0),xpLedger:undefined}}; function mergePendingXpRewards(a,b){return {...(a||{}),...(b||{})}}; function mergeMissionProgress(a,b){return b||a}; function mergeProfilePremium(a,b){return b||a}; function mergeTrainerChallenges(a,b){return b||a}; function mergePracticalAssessments(a,b){return b||a}; function mergeDailyChest(a,b){return b||a};`;
vm.runInContext(helperStubs+'\n'+syncSource.slice(fnStart,fnEnd),c);
const concurrentMerge=c.mergeSingleUser({name:'TESTE',xp:1020,updatedAt:20},{name:'TESTE',xp:1050,updatedAt:21});
assert(concurrentMerge.xp===1050 && concurrentMerge.xp!==1070,'legacy merge uses max XP, not additive merge');
const {context:c2,users:u2}=makeContext(2);
c2.startVentureArena();
let s2=u2.teste.ventureArena.activeSession;
for(let i=0;i<5;i++){
 const q=c2.getQuestionBank().find(item=>String(item.id)===String(s2.questionIds[s2.index]));
 c2.answerVentureArenaQuestion(q,i<4?q.a:'wrong',null);
 c2.nextVentureArenaQuestion();
 s2=u2.teste.ventureArena.activeSession;
}
assert(u2.teste.xp===260,'XP x2 multiplier respected for 4 correct + completion bonus');
const {context:c3,users:u3,els:e3,getInvitedKey}=makeContext(1);
u3.opponent={name:'COLEGA',xp:100,updatedAt:1};
c3.duelHistoryList=[{p1:'TESTE',p2:'COLEGA',score1:5,score2:3,winner:'TESTE',date:'12:30',duelId:'duel-test'}];
c3.renderVentureDuelDashboard();
assert(e3.get('ventureDuelStats').textContent.includes('1 vitória(s)'),'duel dashboard calculates local win record');
assert(e3.get('ventureQuickRematchBtn').disabled===false,'quick rematch enabled for registered opponent');
c3.startVentureQuickRematch();
assert(getInvitedKey()==='opponent','quick rematch selects the last opponent');
console.log('PASS: date key uses Sao Paulo calendar');
console.log('PASS: five unique questions and mistake prioritization');
console.log('PASS: duplicate answer does not grant XP twice');
console.log('PASS: four correct answers grant 80 XP + 50 XP completion bonus');
console.log('PASS: same-day replay is blocked');
console.log('PASS: session and daily claim persist to localStorage');
console.log('PASS: merge unions claims/history and prefers completed session');
console.log('CONFIRMED LIMIT: legacy merge keeps max XP (1050), not concurrent sum (1070)');
console.log('PASS: XP x2 multiplier respected (260 XP for the test challenge)');
console.log('PASS: duel dashboard calculates recent record and selects last opponent for rematch');
