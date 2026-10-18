/* Venture 8.8 · js/08-comunidade-adm.js · arquivo carregado na ordem indicada no HTML. */
let publicProfileSelectedKey = null;
let publicProfileReturnFocus = null;
function escapePublicHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function safePublicAvatarValue(value) {
  if (typeof value === 'string' && value.length < 160000 && /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value)) return value;
  return AVATAR_LIST.includes(value) ? value : '🍔';
}
function openPublicProfile(key) {
  const user = Object.prototype.hasOwnProperty.call(users,key) ? users[key] : null;
  if (!user || !user.name || user._deleted) return;
  if (key === currentUserKey) {switchMainTab('profile');return;}
  const modal = $('publicProfileModal');
  if (!modal) return;
  if (typeof playTabClickSound === 'function') playTabClickSound();
  publicProfileReturnFocus = document.activeElement;
  publicProfileSelectedKey = key;
  renderPublicProfile();
  modal.classList.remove('hidden');
  document.body.classList.add('public-profile-open');
  $('publicProfileClose').focus();
}
function closePublicProfile() {
  const modal = $('publicProfileModal');
  if (!modal || modal.classList.contains('hidden')) return;
  modal.classList.add('hidden');
  publicProfileSelectedKey = null;
  document.body.classList.remove('public-profile-open');
  if (publicProfileReturnFocus && publicProfileReturnFocus.isConnected) publicProfileReturnFocus.focus();
  publicProfileReturnFocus = null;
}
function publicProfileSetText(id,value) { const el=$(id); if (el) el.textContent=String(value); }
function renderPublicProfile() {
  const key = publicProfileSelectedKey;
  const user = key && Object.prototype.hasOwnProperty.call(users,key) ? users[key] : null;
  if (!user || user._deleted) {closePublicProfile();return;}
  const progress = ensureMissionProgress(user);
  const saved = ensurePremiumProfile(user);
  const xp = Math.max(0,Number(user.xp)||0);
  const level = getLevelInfo(xp);
  const frame = PREMIUM_FRAMES.find(f=>f.id===saved.frameId && xp>=f.minXp) || PREMIUM_FRAMES[0];
  const title = PREMIUM_TITLES.find(t=>t.id===saved.titleId && t.available(user,progress)) || PREMIUM_TITLES[0];
  const portrait = $('publicProfileAvatar');
  portrait.replaceChildren();
  const avatar = safePublicAvatarValue(user.avatar);
  if (avatar.startsWith('data:image/')) {
    const img=document.createElement('img'); img.src=avatar; img.alt='Foto do jogador'; portrait.appendChild(img);
  } else portrait.textContent=avatar;
  $('publicProfileFrame').className = `premium-avatar-frame frame-${frame.id}`;
  publicProfileSetText('publicProfileName',user.name);
  publicProfileSetText('publicProfileRole',user.role||user.station||'Atendente');
  publicProfileSetText('publicProfileTitle',`${title.icon} ${title.label}`);
  publicProfileSetText('publicProfileLevel',`Nível ${level.level}`);
  publicProfileSetText('publicProfileXp',`${xp.toLocaleString('pt-BR')} XP`);
  $('publicProfileXpBar').style.width = `${Math.max(0,Math.min(100,100*(xp-level.min)/(level.max-level.min)))}%`;
  publicProfileSetText('publicProfileNextLevel',level.level<7?`Faltam ${(level.max-xp).toLocaleString('pt-BR')} XP para o nível ${level.level+1}`:'Patente máxima alcançada! 👑');
  publicProfileSetText('publicProfileStatXp',xp.toLocaleString('pt-BR'));
  publicProfileSetText('publicProfileStatHits',Math.max(0,Number(user.correctAnswers)||0).toLocaleString('pt-BR'));
  publicProfileSetText('publicProfileStatRecipes',progress.lifetime.kitchenRecipes.length);
  publicProfileSetText('publicProfileStatMissions',Object.keys(progress.claims).length);
  const earned = MEDAL_DEFINITIONS.filter(m=>Boolean(progress.badges[m.id]));
  const selected = saved.featuredBadges.filter(id=>progress.badges[id]);
  const featured = selected.length?selected:earned.slice(0,3).map(m=>m.id);
  const featuredBox=$('publicProfileFeatured'); featuredBox.replaceChildren();
  for(let i=0;i<3;i++){
    const medal=MEDAL_DEFINITIONS.find(m=>m.id===featured[i]);
    const cell=document.createElement('div'); cell.className='premium-featured-item';
    const ico=document.createElement('span'); ico.setAttribute('aria-hidden','true'); ico.textContent=medal?medal.icon:'🔒';
    cell.append(ico,document.createTextNode(medal?medal.title:'Vazio'));featuredBox.appendChild(cell);
  }
  publicProfileSetText('publicProfileMedalCount',`${earned.length}/${MEDAL_DEFINITIONS.length}`);
  renderPracticalInProfiles(user,true);
  const medalsBox=$('publicProfileMedals');medalsBox.replaceChildren();
  MEDAL_DEFINITIONS.forEach(m=>{
    const unlocked=Boolean(progress.badges[m.id]);
    const item=document.createElement('div');item.className=`public-medal ${unlocked?'is-earned':'is-locked'}`;
    const icon=document.createElement('span');icon.textContent=unlocked?m.icon:'🔒';icon.setAttribute('aria-hidden','true');
    const name=document.createElement('strong');name.textContent=m.title;
    const hint=document.createElement('small');hint.textContent=unlocked?`Conquistada · ${premiumDate(progress.badges[m.id])}`:m.detail;
    item.append(icon,name,hint);medalsBox.appendChild(item);
  });
  const online=(Date.now()-(Number(user.lastSeen)||0)) < 25000;
  publicProfileSetText('publicProfileDuelHint',online?'🟢 Jogador online: você pode enviar um desafio agora.':'⚪ Jogador offline: o convite só chega quando ambos estiverem com o site aberto.');
  $('publicProfileChallenge').disabled=Boolean(activeDuel);
  $('publicProfileChallenge').textContent=activeDuel?'⚔️ Termine seu duelo atual':'⚔️ Desafiar para duelo';
}
function challengeFromPublicProfile() {
  const key=publicProfileSelectedKey;
  if (!key || !users[key] || users[key]._deleted || key===currentUserKey) return;
  if (activeDuel) return alert('Finalize o duelo atual antes de iniciar outro.');
  if (!currentUserKey || !users[currentUserKey]) return alert('Entre em sua conta para desafiar um colega.');
  const select=$('duelOpponentSelect');
  if (!select) return;
  populateDuelOpponentList();
  select.value=key;
  if (select.value!==key) return alert('Não foi possível selecionar o colega. Atualize o Ranking.');
  closePublicProfile();
  sendLiveDuelInvite(); // usa o motor do duelo existente, inclusive o convite no WhatsApp
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-open-profile]');
  if (button) {event.preventDefault();openPublicProfile(button.dataset.profileKey);}
});
document.addEventListener('keydown',event=>{
  const modal=$('publicProfileModal');
  if (!modal || modal.classList.contains('hidden')) return;
  if(event.key==='Escape'){event.preventDefault();closePublicProfile();return;}
  if(event.key==='Tab'){
    const focusable=[...modal.querySelectorAll('button:not(:disabled)')].filter(el=>el.offsetParent!==null);
    if (!focusable.length) return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  }
});
function renderLeaderboard() {
  const podiumContainer = $("podiumTop3Container");
  const container = $("leaderboardContainer");
  const rows = Object.entries(users).filter(([key,u]) => u && u.name && !u._deleted).sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0));
  const list = rows.map(([,u]) => u);
  if (list.length === 0) {
    if (podiumContainer) podiumContainer.innerHTML = "";
    if (container) container.innerHTML = `<div class="p-6 text-center text-xs font-bold text-muted-pro subtle-box rounded-2xl border-dashed">Nenhum colaborador cadastrado ainda. Crie sua conta para estrear o Pódio!</div>`;
    return;
  }
  const first = list[0];
  const second = list[1] || null;
  const third = list[2] || null;
  if (podiumContainer) {
    podiumContainer.innerHTML = `
      <div class="flex flex-col items-center">
        ${second ? `
          <div class="mb-1">${renderAvatarBadge(safePublicAvatarValue(second.avatar), "w-11 h-11", "text-xl", "subtle-box border-2 border-slate-300")}</div>
          <p class="font-black text-[10px] text-center truncate w-full px-1">${escapePublicHtml(second.name)}</p>
          <span class="text-[10px] font-extrabold text-red-500">${second.xp || 0} XP</span>
          <button type="button" class="podium-profile-link" data-open-profile data-profile-key="${escapePublicHtml(rows[1][0])}" data-html2canvas-ignore="true">Ver perfil ↗</button>
          <div class="w-full h-16 mt-2 rounded-t-2xl bg-gradient-to-b from-slate-300 to-slate-400 text-slate-900 flex flex-col items-center justify-center font-black shadow-inner">
            <span class="text-lg">🥈</span>
            <span class="text-[10px]">2º Lugar</span>
          </div>
        ` : `<div class="w-full h-16 mt-10 rounded-t-2xl subtle-box opacity-40 flex items-center justify-center text-xs font-bold">2º</div>`}
      </div>
      <div class="flex flex-col items-center">
        <span class="text-lg mb-0.5 float-slow">👑 ☕</span>
        <div class="mb-1">${renderAvatarBadge(safePublicAvatarValue(first.avatar), "w-14 h-14", "text-2xl", "gold-gradient text-slate-950 border-2 border-white shadow-lg")}</div>
        <p class="font-black text-xs text-center truncate w-full px-1">${escapePublicHtml(first.name)}</p>
        <span class="text-[11px] font-black text-amber-500">${first.xp || 0} XP</span>
          <button type="button" class="podium-profile-link" data-open-profile data-profile-key="${escapePublicHtml(rows[0][0])}" data-html2canvas-ignore="true">Ver perfil ↗</button>
        <div class="w-full h-24 mt-2 rounded-t-2xl gold-gradient text-slate-950 flex flex-col items-center justify-center font-black shadow-lg border-t-2 border-white">
          <span class="text-2xl">🥇</span>
          <span class="text-[11px] uppercase tracking-wider">1º Lugar</span>
        </div>
      </div>
      <div class="flex flex-col items-center">
        ${third ? `
          <div class="mb-1">${renderAvatarBadge(safePublicAvatarValue(third.avatar), "w-11 h-11", "text-xl", "subtle-box border-2 border-amber-700/50")}</div>
          <p class="font-black text-[10px] text-center truncate w-full px-1">${escapePublicHtml(third.name)}</p>
          <span class="text-[10px] font-extrabold text-red-500">${third.xp || 0} XP</span>
          <button type="button" class="podium-profile-link" data-open-profile data-profile-key="${escapePublicHtml(rows[2][0])}" data-html2canvas-ignore="true">Ver perfil ↗</button>
          <div class="w-full h-14 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-600 to-amber-800 text-white flex flex-col items-center justify-center font-black shadow-inner">
            <span class="text-base">🥉</span>
            <span class="text-[10px]">3º Lugar</span>
          </div>
        ` : `<div class="w-full h-14 mt-12 rounded-t-2xl subtle-box opacity-40 flex items-center justify-center text-xs font-bold">3º</div>`}
      </div>
    `;
  }
  if (container) {
    const now = Date.now();
    container.innerHTML = list.map((u, idx) => {
      const medal = idx === 0 ? "🥇 ☕" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}º`;
      const info = getLevelInfo(u.xp || 0);
      const role = u.role || u.station || "Atendente";
      const isOnline = (now - (u.lastSeen || 0)) < 25000;
      const onlineDot = isOnline
        ? `<span class="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block ml-1 shadow-sm" title="Online agora"></span>`
        : `<span class="w-2.5 h-2.5 bg-slate-400/50 rounded-full inline-block ml-1" title="Offline"></span>`;
      return `
        <div class="rank-player-row flex items-center justify-between p-3.5 rounded-2xl ${idx === 0 ? 'bg-amber-500/15 border-2 border-amber-500/50 shadow-sm' : 'subtle-box'}">
          <div class="flex items-center gap-3">
            <span class="font-black text-xs w-7 text-center">${medal}</span>
            ${renderAvatarBadge(safePublicAvatarValue(u.avatar), "w-10 h-10", "text-xl", "pro-card")}
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <p class="font-black text-xs">${escapePublicHtml(u.name)} ${onlineDot}</p>
                <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 uppercase">${escapePublicHtml(role)}</span>
              </div>
              <p class="text-[10px] text-muted-pro font-bold mt-0.5">${info.title}</p>
            </div>
          </div>
          <div class="rank-player-actions">
            <span class="font-black text-xs text-red-500">${u.xp || 0} XP</span>
            <span class="block text-[10px] text-muted-pro font-semibold">${u.correctAnswers || 0} acertos</span>
            <button type="button" class="rank-profile-button" data-open-profile data-profile-key="${escapePublicHtml(rows[idx][0])}" data-html2canvas-ignore="true" aria-label="Ver perfil de ${escapePublicHtml(u.name)}">👁 Ver perfil</button>
          </div>
        </div>
      `;
    }).join("");
  }
}
function shareMyScoreWhatsApp() {
  playTabClickSound();
  if (!currentUserKey || !users[currentUserKey]) return;
  const u = users[currentUserKey];
  const info = getLevelInfo(u.xp || 0);
  const copyUser = { ...u, avatar: isPhotoAvatar(u.avatar) ? "🍔" : (u.avatar || "🍔") };
  const encodedUser = btoa(encodeURIComponent(JSON.stringify(copyUser)));
  const syncUrl = `${window.location.origin}${window.location.pathname}?syncUser=${encodeURIComponent(encodedUser)}`;
  const text = `🏆 *OLIMPÍADAS DO BÁSICO — VENTURE (FINALIZA 25/10)*\n👤 Colaborador: *${u.name}*\n🎖️ Cargo: ${u.role || 'Atendente'}\n⚡ Pontuação: *${u.xp || 0} XP* (${info.title})\n✅ Acertos: ${u.correctAnswers || 0}\n\n🔗 *Link de Sincronia no Ranking:* ${syncUrl}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}
// =========================================================================
// PAINEL ADM (SENHA: 342005)
// =========================================================================
function unlockAdminPanel() {
  const pass = $("adminPassInput").value.trim();
  const err = $("adminAuthError");
  if (pass === ADMIN_SECRET_PASS) {
    isAdminUnlocked = true;
    playHitSuccessSound();
    err.classList.add("hidden");
    $("adminLockScreen").classList.add("hidden");
    $("adminDashboard").classList.remove("hidden");
    renderAdminUsersList();
    renderXpModeStatus();
    fetchTrainerHistory(true);
    fetchCloudHistorySafe(true);
  } else {
    playWrongAnswerSound();
    err.classList.remove("hidden");
  }
}
function lockAdminPanel() {
  playTabClickSound();
  isAdminUnlocked = false;
  $("adminPassInput").value = "";
  $("adminDashboard").classList.add("hidden");
  $("adminLockScreen").classList.remove("hidden");
}
function renderAdminUsersList() {
  const container = $("adminUsersList");
  const entries = Object.entries(users).filter(([k, u]) => u && u.name && !u._deleted).sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0));
  $("adminStatsSummary").textContent = `Total: ${entries.length} colaborador(es) cadastrado(s)`;
  if (entries.length === 0) {
    container.innerHTML = `<p class="text-xs text-muted-pro text-center py-4 font-bold">Nenhum colaborador cadastrado.</p>`;
    return;
  }
  const now = Date.now();
  container.innerHTML = entries.map(([key, u], index) => {
    const lvl = getLevelInfo(u.xp || 0).level;
    const role = u.role || u.station || "Atendente";
    const isLocked = (u.heartsLockUntil || 0) > now;
    const heartsBadge = isLocked
      ? `<span class="text-[10px] font-bold text-red-500">⏳ Bloqueado (${formatTimeRemaining(u.heartsLockUntil - now)})</span>`
      : `<span class="text-[10px] font-bold text-emerald-500">${u.hearts !== undefined ? u.hearts : 5} ❤️ disponíveis</span>`;
    return `
      <div class="p-4 rounded-2xl subtle-box space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            ${renderAvatarBadge(u.avatar, "w-11 h-11", "text-2xl", "pro-card")}
            <div>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-[#FFC72C]">#${index + 1} • Nível ${lvl} • ${role}</span>
              <h4 class="font-black text-xs mt-1">${u.name}</h4>
              <p class="text-[11px] text-muted-pro font-semibold">🔑 Senha: <span class="font-extrabold">${u.password || '1234'}</span> • ${heartsBadge}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-sm font-black text-red-500">${u.xp || 0} XP</span>
            <span class="block text-[10px] text-muted-pro font-bold">${u.correctAnswers || 0} acertos</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-500/20">
          <button onclick="adminAdjustXp('${key}', 100)" class="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[10px] btn-tap">+100 XP</button>
          <button onclick="adminAdjustXp('${key}', 500)" class="px-2.5 py-1.5 rounded-xl bg-emerald-800 text-white font-black text-[10px] btn-tap">+500 XP</button>
          <button onclick="adminAdjustXp('${key}', -100)" class="px-2.5 py-1.5 rounded-xl bg-amber-600 text-white font-black text-[10px] btn-tap">-100 XP</button>
          <button onclick="adminSetCustomXp('${key}')" class="px-2.5 py-1.5 rounded-xl bg-blue-600 text-white font-black text-[10px] btn-tap">✏️ Definir XP</button>
          <button onclick="adminRestoreHearts('${key}')" class="px-2.5 py-1.5 rounded-xl bg-pink-600 text-white font-black text-[10px] btn-tap">❤️ Restaurar Vidas</button>
          <button onclick="adminResetUser('${key}')" class="px-2.5 py-1.5 rounded-xl bg-slate-500/20 font-bold text-[10px] btn-tap">Zerar</button>
          <button onclick="adminDeleteUser('${key}')" class="px-2.5 py-1.5 rounded-xl bg-red-500/20 text-red-500 font-bold text-[10px] ml-auto btn-tap">🗑️ Excluir</button>
        </div>
      </div>
    `;
  }).join("");
}
function adminRestoreHearts(key) {
  playHitSuccessSound();
  if (!users[key]) return;
  users[key].hearts = 5;
  users[key].heartsLockUntil = 0;
  users[key].updatedAt = Date.now();
  users[key].adminOverrideAt = Date.now();
  if (key === currentUserKey) {
    setActiveHeartsState(5, 0);
    checkAndRenderCooldownScreen();
    loadNextQuizQuestion();
  }
  scheduleCloudSync(key, true);
  renderAdminUsersList();
}
function adminAdjustXp(key, delta) {
  if (!users[key]) return;
  const oldLevel = getLevelInfo(users[key].xp || 0).level;
  users[key].xp = Math.max(0, (users[key].xp || 0) + delta);
  const newLevel = getLevelInfo(users[key].xp || 0).level;
  users[key].updatedAt = Date.now();
  users[key].adminOverrideAt = Date.now();
  if (newLevel > oldLevel) {
    playMcDonaldsJingle();
  } else if (delta > 0) {
    playHitSuccessSound();
  } else {
    playTabClickSound();
  }
  scheduleCloudSync(key, true);
}
function adminSetCustomXp(key) {
  playTabClickSound();
  if (!users[key]) return;
  const val = prompt(`Digite o novo valor exato de XP para ${users[key].name}:`, users[key].xp || 0);
  if (val === null) return;
  const parsed = parseInt(val, 10);
  if (!isNaN(parsed)) {
    const oldLevel = getLevelInfo(users[key].xp || 0).level;
    users[key].xp = Math.max(0, parsed);
    const newLevel = getLevelInfo(users[key].xp || 0).level;
    users[key].updatedAt = Date.now();
    users[key].adminOverrideAt = Date.now();
    if (newLevel > oldLevel) {
      playMcDonaldsJingle();
    } else {
      playHitSuccessSound();
    }
    scheduleCloudSync(key, true);
  }
}
function adminResetUser(key) {
  playTabClickSound();
  if (!users[key]) return;
  if (!confirm(`Zerar o XP e os acertos de ${users[key].name}?`)) return;
  users[key].xp = 0;
  users[key].correctAnswers = 0;
  users[key].quizStreak = 0;
  users[key].quizStreakUpdatedAt = Date.now();
  users[key].hearts = 5;
  users[key].heartsLockUntil = 0;
  users[key].updatedAt = Date.now();
  users[key].adminOverrideAt = Date.now();
  scheduleCloudSync(key, true);
}
function adminDeleteUser(key) {
  playTabClickSound();
  if (!users[key]) return;
  if (!confirm(`Excluir permanentemente ${users[key].name} do Ranking?`)) return;
  users[key]._deleted = true;
  users[key].updatedAt = Date.now();
  users[key].adminOverrideAt = Date.now();
  scheduleCloudSync(key, true);
}
function adminSaveMember() {
  const name = $("admNewName").value.trim().toUpperCase();
  const role = $("admNewRole").value;
  const pass = $("admNewPass").value.trim() || "1234";
  const xp = parseInt($("admNewXp").value || "0", 10);
  const hits = parseInt($("admNewHits").value || "0", 10);
  if (!name) return alert("Digite o nome do colaborador!");
  const key = name.toLowerCase();
  users[key] = {
    name: name,
    role: role,
    _deleted: false,
    avatar: users[key]?.avatar || "🍔",
    password: pass,
    xp: Math.max(0, xp),
    correctAnswers: Math.max(0, hits),
    hearts: 5,
    heartsLockUntil: 0,
    mistakes: users[key]?.mistakes || [],
    quizStreak: users[key]?.quizStreak || 0,
    quizStreakUpdatedAt: users[key]?.quizStreakUpdatedAt || 0,
    missionProgress:users[key]?.missionProgress,
    profilePremium:users[key]?.profilePremium,
    trainerChallenges:users[key]?.trainerChallenges,
    duelRewards:users[key]?.duelRewards,
    practicalAssessments:users[key]?.practicalAssessments,
    lastSeen: Date.now(),
    updatedAt: Date.now(),
    adminOverrideAt: Date.now()
  };
  playHitSuccessSound();
  scheduleCloudSync(key, true);
  $("admNewName").value = "";
  $("admNewPass").value = "";
  $("admNewXp").value = "";
  $("admNewHits").value = "";
  alert(`Colaborador ${name} (${role}) salvo com sucesso!`);
}
