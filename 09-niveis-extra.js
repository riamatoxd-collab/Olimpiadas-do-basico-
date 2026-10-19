/* Venture · extensão visual de 20 patentes (níveis 8 a 27) para a v8.9.1.
 * SOMENTE LEITURA: não toca localStorage, MQTT, HTTP, cadastros, XP,
 * senhas, missões, histórico, duelos, sincronização nem versionamento.
 * Preserva a função original dos sete níveis para XP abaixo de 25.000.
 */
(function() {
  "use strict";
  if (typeof getLevelInfo !== "function") {
    console.warn("Jornada Venture: versão de jogo incompatível; extensão não iniciada.");
    return;
  }
  const originalGetLevelInfo = getLevelInfo;
  const tiers = Object.freeze([
    {level:1,min:0},{level:2,min:1000},{level:3,min:3000},
    {level:4,min:6000},{level:5,min:10000},{level:6,min:15000},{level:7,min:25000},
  {level:8,min:30000,icon:"🚀",name:"Explorador do Básico"},
  {level:9,min:35000,icon:"🍟",name:"Guardião da Qualidade"},
  {level:10,min:40000,icon:"⚡",name:"Ritmo de Ouro"},
  {level:11,min:45000,icon:"🍔",name:"Mestre da Montagem"},
  {level:12,min:50000,icon:"🎯",name:"Precisão Absoluta"},
  {level:13,min:55000,icon:"🛡️",name:"Defensor dos Padrões"},
  {level:14,min:60000,icon:"🌟",name:"Destaque Venture"},
  {level:15,min:65000,icon:"🏅",name:"Elite do Atendimento"},
  {level:16,min:70000,icon:"🔥",name:"Estrategista da Operação"},
  {level:17,min:80000,icon:"🧠",name:"Mentor de Conhecimento"},
  {level:18,min:90000,icon:"⚙️",name:"Comandante da Cozinha"},
  {level:19,min:100000,icon:"💫",name:"Referência em Excelência"},
  {level:20,min:115000,icon:"🥇",name:"Superestrela Venture"},
  {level:21,min:130000,icon:"💎",name:"Guardião do Diamante"},
  {level:22,min:145000,icon:"🏆",name:"Campeão das Estações"},
  {level:23,min:160000,icon:"🚀",name:"Mestre da Evolução"},
  {level:24,min:180000,icon:"🌠",name:"Lenda da Qualidade"},
  {level:25,min:200000,icon:"👑",name:"Ícone Venture"},
  {level:26,min:225000,icon:"🔥",name:"Titã das Olimpíadas"},
  {level:27,min:250000,icon:"🌌",name:"Lenda Suprema Venture"}
  ].map(x=>Object.freeze(x)));
  const MAX_LEVEL = 27;
  const fmt = n => Math.max(0,Math.floor(n)).toLocaleString("pt-BR");
  const readXp = value => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0,n) : 0;
  };
  const getInfo = xpValue => {
    const xp = readXp(xpValue);
    if (xp < 25000) return originalGetLevelInfo(xp);
    if (xp < 30000) {
      const existing = originalGetLevelInfo(xp);
      return { ...existing, max:30000 };
    }
    for (let i = tiers.length - 1; i >= 7; i--) {
      const t = tiers[i];
      if (xp >= t.min) {
        const next = tiers[i+1];
        return { level:t.level,title:`${t.icon} Nível ${t.level} — ${t.name}`,min:t.min,max:next?next.min:275000 };
      }
    }
    return originalGetLevelInfo(xp);
  };
  // Única substituição de cálculo: a pontuação original não muda.
  getLevelInfo = getInfo;
  window.getVentureLevelCatalog = () => tiers.map(t => {
    const info = getInfo(t.min);
    return {level:t.level,min:t.min,title:info.title};
  });

  const byId = id => document.getElementById(id);
  const currentUser = () => {
    if (typeof currentUserKey === "undefined" || typeof users === "undefined") return null;
    const u = currentUserKey && users[currentUserKey];
    return u && !u._deleted ? u : null;
  };
  function updateNextLabel(id, value, barId) {
    const el = byId(id);
    if (!el) return;
    const xp = readXp(value), level = getInfo(xp);
    if (level.level >= MAX_LEVEL) {
      el.textContent = "Nível máximo conquistado! 👑";
      const bar=byId(barId);
      if (bar) bar.style.width="100%";
    } else {
      el.textContent = `Faltam ${fmt(level.max-xp)} XP para o Nível ${level.level+1}`;
    }
  }
  const prevHeader = updateHeaderUI;
  updateHeaderUI = function(...args) {
    const result = prevHeader.apply(this,args);
    const u = currentUser();
    if (u) updateNextLabel("nextLevelTarget",u.xp,"xpProgressBar");
    return result;
  };
  if (typeof renderPremiumProfile === "function") {
    const prevPremium = renderPremiumProfile;
    renderPremiumProfile = function(...args) {
      const result = prevPremium.apply(this,args);
      const u = currentUser();
      if (u) updateNextLabel("premiumNextLevel",u.xp,"premiumXpBar");
      return result;
    };
  }
  if (typeof renderPublicProfile === "function") {
    const prevPublic = renderPublicProfile;
    renderPublicProfile = function(...args) {
      const result = prevPublic.apply(this,args);
      const key = typeof publicProfileSelectedKey !== "undefined" ? publicProfileSelectedKey : null;
      const u = key && typeof users !== "undefined" ? users[key] : null;
      if (u && !u._deleted) updateNextLabel("publicProfileNextLevel",u.xp,"publicProfileXpBar");
      return result;
    };
  }
  function renderStats(id) {
    const root=byId(id);
    if (!root) return;
    root.replaceChildren();
    const user=currentUser(), xp=readXp(user?.xp), info=getInfo(xp);
    const metrics = user ? [
      ["Seu nível",`${info.level} / ${MAX_LEVEL}`],
      ["XP preservado",`${fmt(xp)} XP`],
      [info.level===MAX_LEVEL?"Conquista final":"Próximo nível",info.level===MAX_LEVEL?"Máximo 🏆":`${fmt(info.max-xp)} XP`]
    ] : [["Níveis disponíveis","27"],["Novos níveis","20"],["Sua evolução","Entre na sua conta"]];
    metrics.forEach(([label,value])=>{
      const card=document.createElement("div");card.className="venture-levels-metric";
      const small=document.createElement("small");small.textContent=label;
      const strong=document.createElement("strong");strong.textContent=value;
      card.append(small,strong);root.appendChild(card);
    });
  }
  function renderGrid(id) {
    const root=byId(id);
    if (!root) return;
    const user=currentUser(), xp=readXp(user?.xp), now=getInfo(xp);
    root.replaceChildren();
    tiers.forEach((tier,i)=>{
      const info=getInfo(tier.min),next=tiers[i+1];
      const unlocked=Boolean(user)&&xp>=tier.min;
      const active=Boolean(user)&&now.level===tier.level;
      const item=document.createElement("article");
      item.className="venture-level-item"+(unlocked?" is-unlocked":"")+(active?" is-current":"")+(tier.level>7?" is-new":"");
      if (active) item.setAttribute("aria-current","step");
      const no=document.createElement("div");no.className="venture-level-item-index";
      no.textContent=String(tier.level);
      const body=document.createElement("div");body.className="venture-level-item-body";
      const name=document.createElement("strong");name.textContent=info.title;
      const meta=document.createElement("small");
      meta.textContent=next?`${fmt(tier.min)} a ${fmt(next.min-1)} XP`:`${fmt(tier.min)}+ XP`;
      body.append(name,meta);
      const tag=document.createElement("span");tag.className="venture-level-item-status";
      tag.textContent=active?"ATUAL":unlocked?"✓":tier.level>7?"🔒 NOVO":"🔒";
      item.append(no,body,tag);root.appendChild(item);
    });
  }
  function renderAll() {
    renderStats("ventureLevelsModalStats");renderStats("ventureLevelsRankStats");
    renderGrid("ventureLevelsModalGrid");renderGrid("ventureLevelsRankGrid");
  }
  let previousFocus=null;
  window.openVentureLevels = function() {
    const modal=byId("ventureLevelsModal");if (!modal) return;
    renderAll();previousFocus=document.activeElement;
    modal.classList.remove("hidden");modal.setAttribute("aria-hidden","false");
    const close=byId("ventureLevelsClose");if (close) close.focus();
  };
  window.closeVentureLevels = function() {
    const modal=byId("ventureLevelsModal");if (!modal) return;
    modal.classList.add("hidden");modal.setAttribute("aria-hidden","true");
    if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus==="function") previousFocus.focus();
  };
  const wireUI = () => {
    const details=byId("ventureLevelsDetails");
    if (details) details.addEventListener("toggle",()=>{if(details.open)renderAll();});
    const modal=byId("ventureLevelsModal");
    if (modal) modal.addEventListener("click",e=>{if(e.target===modal)window.closeVentureLevels();});
    document.addEventListener("keydown",e=>{
      if(e.key==="Escape"&&modal&&!modal.classList.contains("hidden"))window.closeVentureLevels();
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",wireUI,{once:true});
  else wireUI();
})();
