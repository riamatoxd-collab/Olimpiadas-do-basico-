/* Venture 8.8 · js/07-jogos.js · arquivo carregado na ordem indicada no HTML. */
function getActiveUserMistakes() {
  if (currentUserKey && users[currentUserKey]) {
    if (!Array.isArray(users[currentUserKey].mistakes)) users[currentUserKey].mistakes = [];
    return users[currentUserKey].mistakes;
  }
  return JSON.parse(localStorage.getItem("mequi_guest_mistakes") || "[]");
}
function recordMistakeQuestion(qId) {
  const list = getActiveUserMistakes();
  if (!list.includes(qId)) {
    list.push(qId);
    saveMistakesList(list);
  }
}
function removeMistakeQuestion(qId) {
  const list = getActiveUserMistakes().filter(id => id !== qId);
  saveMistakesList(list);
}
function saveMistakesList(list) {
  if (currentUserKey && users[currentUserKey]) {
    users[currentUserKey].mistakes = list;
    users[currentUserKey].updatedAt = Date.now();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } else {
    localStorage.setItem("mequi_guest_mistakes", JSON.stringify(list));
  }
  updateMistakesBadge();
}
function updateMistakesBadge() {
  const badge = $("mistakesCountBadge");
  if (!badge) return;
  const existingIds = new Set(getQuestionBank().map(q=>q.id));
  const count = getActiveUserMistakes().filter(id=>existingIds.has(id)).length;
  badge.textContent = `${count} pendente${count === 1 ? "" : "s"}`;
  badge.className = count > 0
    ? "text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white"
    : "text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500";
}
function openReviewModal() {
  playTabClickSound();
  const existingIds = new Set(getQuestionBank().map(q=>q.id));
  const mistakes = getActiveUserMistakes().filter(id=>existingIds.has(id));
  if (mistakes.length === 0) {
    return alert("🎉 Parabéns! Você não tem nenhuma dúvida pendente. Quando errar alguma questão no Simulado, ela ficará salva aqui para revisão!");
  }
  $("reviewMistakesModal").classList.remove("hidden");
  loadNextReviewQuestion();
}
function closeReviewModal() {
  playTabClickSound();
  $("reviewMistakesModal").classList.add("hidden");
}
function loadNextReviewQuestion() {
  playTabClickSound();
  const existingIds = new Set(getQuestionBank().map(q=>q.id));
  const mistakes = getActiveUserMistakes().filter(id=>existingIds.has(id));
  if (mistakes.length === 0) {
    playMcDonaldsJingle();
    alert("✅ Sensacional! Você revisou e zerou todas as suas dúvidas pendentes!");
    closeReviewModal();
    return;
  }
  const randomId = mistakes[Math.floor(Math.random() * mistakes.length)];
  const item = getQuestionBank().find(q => q.id === randomId) || getQuestionBank()[0];
  currentReviewItem = item;
  $("reviewMetaBadge").textContent = `Questão #${item.id} • ${item.level}`;
  $("reviewRemainingBadge").textContent = `Faltam zerar: ${mistakes.length}`;
  $("reviewQuestionText").textContent = item.q;
  $("reviewFeedbackBox").classList.add("hidden");
  $("nextReviewBtn").classList.add("hidden");
  const shuffled = [...item.w, item.a].sort(() => 0.5 - Math.random());
  const letters = ["A", "B", "C", "D"];
  const container = $("reviewOptionsContainer");
  container.innerHTML = "";
  shuffled.forEach((optText, idx) => {
    const letter = letters[idx];
    const btn = document.createElement("button");
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `
      <span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${letter}</span>
      <span class="flex-1 leading-snug">${trainerSafeHtml(optText)}</span>
    `;
    btn.onclick = () => checkReviewAnswer(btn, optText, item.a, item.id);
    container.appendChild(btn);
  });
}
function checkReviewAnswer(selectedBtn, chosen, correct, qId) {
  const allBtns = document.querySelectorAll("#reviewOptionsContainer button");
  allBtns.forEach(b => b.disabled = true);
  const fb = $("reviewFeedbackBox");
  fb.classList.remove("hidden");
  if (chosen === correct) {
    selectedBtn.className = "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3";
    removeMistakeQuestion(qId);
    recordMissionActivity("review_correct");
    playHitSuccessSound();
    fb.className = "p-3 rounded-2xl text-xs font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30";
    fb.textContent = "✅ Aprendido! Essa questão saiu da sua lista de dúvidas!";
  } else {
    selectedBtn.className = "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
    playWrongAnswerSound();
    fb.className = "p-3 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500 border border-red-500/30";
    fb.innerHTML = `❌ O gabarito oficial é:<br><span class="underline mt-1 inline-block">${correct}</span>`;
  }
  $("nextReviewBtn").classList.remove("hidden");
}
// =========================================================================
// DUELO ONLINE 1 vs 1 COM STATUS ONLINE E HISTÓRICO DE VENCEDORES
// =========================================================================
function populateDuelOpponentList() {
  const select = $("duelOpponentSelect");
  if (!select) return;
  const currentVal = select.value;
  const now = Date.now();
  const list = Object.entries(users)
    .filter(([k, u]) => u && u.name && !u._deleted && k !== currentUserKey)
    .sort((a, b) => a[1].name.localeCompare(b[1].name));
  // Evita interpretar como HTML os nomes/cargos recebidos de outros celulares.
  select.replaceChildren(new Option("Selecione quem você quer desafiar...", ""));
  list.forEach(([k, u]) => {
    const isOnline = (now - (u.lastSeen || 0)) < 25000;
    const indicator = isOnline ? "🟢 [Online]" : "⚪ [Offline]";
    select.add(new Option(`${indicator} ${u.name} (${u.role || 'Atendente'})`, k));
  });
  if (currentVal && users[currentVal]) select.value = currentVal;
}
function sendLiveDuelInvite() {
  playTabClickSound();
  if (!currentUserKey || !users[currentUserKey]) {
    return alert("Faça login na sua conta antes de desafiar alguém!");
  }
  const targetKey = $("duelOpponentSelect").value;
  if (!targetKey || !users[targetKey]) {
    return alert("Selecione na lista qual colega da loja você quer convidar para o duelo!");
  }
  const me = users[currentUserKey];
  const opp = users[targetKey];
  const duelId = "duel_" + Date.now() + "_" + Math.random().toString(16).substring(2, 6);
  activeDuel = {
    duelId: duelId,
    isHost: true,
    hostKey: currentUserKey,
    hostName: me.name,
    hostAvatar: me.avatar || "🍔",
    guestKey: targetKey,
    guestName: opp.name,
    guestAvatar: opp.avatar || "🍟",
    scoreHost: 0,
    scoreGuest: 0,
    round: 0,
    status: "waiting"
  };
  openDuelArenaUI();
  $("duelWaitingBox").classList.remove("hidden");
  $("duelQuestionArea").classList.add("hidden");
  $("duelWinnerBox").classList.add("hidden");
  $("duelWaitingText").textContent = `Convite enviado! Aguardando ${opp.name} aceitar no celular dele(a)...`;
  publishDuelPacket({
    type: "invite",
    duelId: duelId,
    hostKey: currentUserKey,
    hostName: me.name,
    hostAvatar: me.avatar || "🍔",
    guestKey: targetKey,
    guestName: opp.name,
    guestAvatar: opp.avatar || "🍟"
  });
}
function sendDuelInviteWhatsApp() {
  playTabClickSound();
  if (!activeDuel) return;
  const link = `${window.location.origin}${window.location.pathname}`;
  const text = `⚔️ *DESAFIO 1 vs 1 — OLIMPÍADAS DO BÁSICO*\n🔥 *${activeDuel.hostName}* está te chamando para um Duelo ao vivo agora!\n\n📲 Abra o aplicativo para aceitar o convite: ${link}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}
function handleIncomingDuelPacket(pkt) {
  if (!pkt || !pkt.type) return;
  if (pkt.type === "invite" && pkt.guestKey === currentUserKey) {
    if (activeDuel) return;
    pendingDuelInvite = pkt;
    playHitSuccessSound();
    $("inviteFromNameDisplay").textContent = pkt.hostName;
    $("duelInvitePopup").classList.remove("hidden");
    return;
  }
  if (!activeDuel || pkt.duelId !== activeDuel.duelId) return;
  if (activeDuel.status === "finished") return;
  if (pkt.type === "decline") {
    playWrongAnswerSound();
    alert(`❌ ${activeDuel.guestName} recusou o convite de duelo no momento.`);
    leaveActiveDuel(false);
    return;
  }
  if (pkt.type === "accept" && activeDuel.isHost && activeDuel.status === "waiting") {
    activeDuel.status = "playing";
    hostStartNextDuelRound();
    return;
  }
  if (pkt.type === "question") {
    if (Number(pkt.round) <= Number(activeDuel.round || 0)) return;
    activeDuel.status = "playing";
    activeDuel.round = pkt.round;
    activeDuel.scoreHost = pkt.scoreHost;
    activeDuel.scoreGuest = pkt.scoreGuest;
    activeDuel.currentQuestion = pkt.question;
    activeDuel.roundResolved = false;
    activeDuel.lockedPlayers = {};
    playCardFlipSound();
    renderDuelRoundUI();
    return;
  }
  if (pkt.type === "answer" && activeDuel.status === "playing" && !activeDuel.roundResolved && pkt.round === activeDuel.round && [activeDuel.hostKey,activeDuel.guestKey].includes(pkt.playerKey)) {
    if (activeDuel.lockedPlayers?.[pkt.playerKey]) return;
    if (pkt.isCorrect) {
      activeDuel.roundResolved = true;
      if (pkt.playerKey === activeDuel.hostKey) activeDuel.scoreHost++;
      else activeDuel.scoreGuest++;
      updateDuelScoreboardUI();
      playHitSuccessSound();
      showDuelBanner(`⚡ ${pkt.playerName} acertou primeiro e marcou +1 ponto!`, "emerald");
      if (activeDuel.isHost) {
        setTimeout(() => {
          if (!activeDuel) return;
          if (activeDuel.scoreHost >= 5 || activeDuel.scoreGuest >= 5) {
            const winnerName = activeDuel.scoreHost >= 5 ? activeDuel.hostName : activeDuel.guestName;
            const winnerKey = activeDuel.scoreHost >= 5 ? activeDuel.hostKey : activeDuel.guestKey;
            publishDuelPacket({
              type: "finish",
              duelId: activeDuel.duelId,
              winnerName: winnerName,
              winnerKey: winnerKey,
              scoreHost: activeDuel.scoreHost,
              scoreGuest: activeDuel.scoreGuest
            });
          } else {
            hostStartNextDuelRound();
          }
        }, 1900);
      }
    } else {
      activeDuel.lockedPlayers[pkt.playerKey] = true;
      playWrongAnswerSound();
      if (pkt.playerKey === currentUserKey) {
        showDuelBanner(`❌ Você errou! Aguardando tentativa do oponente...`, "red");
      } else {
        showDuelBanner(`🔥 ${pkt.playerName} errou! Responda com calma para ganhar o ponto!`, "amber");
      }
      if (activeDuel.lockedPlayers[activeDuel.hostKey] && activeDuel.lockedPlayers[activeDuel.guestKey]) {
        activeDuel.roundResolved = true;
        showDuelBanner(`😅 Nenhum dos dois acertou! Próxima pergunta...`, "red");
        if (activeDuel.isHost) {
          setTimeout(() => { if (activeDuel) hostStartNextDuelRound(); }, 1900);
        }
      }
    }
    return;
  }
  if (pkt.type === "finish") {
    // A partida só encerra ao alcançar 5 pontos. Legado sem winnerKey não pontua.
    const winnerKey = pkt.scoreHost >= 5 && pkt.scoreHost > pkt.scoreGuest ? activeDuel.hostKey
      : pkt.scoreGuest >= 5 && pkt.scoreGuest > pkt.scoreHost ? activeDuel.guestKey : null;
    if (!winnerKey || pkt.winnerKey !== winnerKey || activeDuel.status === 'finished') return;
    activeDuel.status = 'finished';
    const eligibleWinner = winnerKey === currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted;
    let xpAwarded=false;
    if (eligibleWinner) {
      const user=users[currentUserKey];
      user.duelRewards=user.duelRewards && typeof user.duelRewards==='object'?user.duelRewards:{};
      if(!user.duelRewards[activeDuel.duelId]) {
        user.duelRewards[activeDuel.duelId]=Date.now();
        user.updatedAt=Date.now();
        const xpAmount=addXp(DUEL_WIN_XP); activeDuel.xpWon=xpAmount; xpAwarded=true;
      }
    }
    activeDuel.scoreHost = pkt.scoreHost;
    activeDuel.scoreGuest = pkt.scoreGuest;
    updateDuelScoreboardUI();
    playMcDonaldsJingle();
    $("duelQuestionArea").classList.add("hidden");
    $("duelWinnerBox").classList.remove("hidden");
    $("duelWinnerTitle").textContent = `🏆 ${pkt.winnerName} Venceu!`;
    $("duelWinnerSub").textContent = `Placar final: ${activeDuel.hostName} (${pkt.scoreHost}) x (${pkt.scoreGuest}) ${activeDuel.guestName}. ${eligibleWinner?(xpAwarded?`🏆 Você ganhou +${activeDuel.xpWon || xpForReward(DUEL_WIN_XP)} XP!`:'Recompensa já registrada.'):`O vencedor ganha +${xpForReward(DUEL_WIN_XP)} XP.`}`;
    saveDuelHistoryRecord({
      p1: activeDuel.hostName,
      p2: activeDuel.guestName,
      score1: pkt.scoreHost,
      score2: pkt.scoreGuest,
      winner: pkt.winnerName,
      duelId:activeDuel.duelId, rewardXp:DUEL_WIN_XP,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    return;
  }
  if (pkt.type === "leave" && pkt.playerKey !== currentUserKey) {
    alert("O seu oponente saiu da Arena de Duelo.");
    leaveActiveDuel(false);
  }
}
function saveDuelHistoryRecord(record) {
  if(record.duelId && duelHistoryList.some(h=>h.duelId===record.duelId))return;
  duelHistoryList.unshift(record);
  if (duelHistoryList.length > 5) duelHistoryList.pop();
  localStorage.setItem(STORAGE_DUEL_HISTORY, JSON.stringify(duelHistoryList));
  renderDuelHistory();
}
function renderDuelHistory() {
  const container = $("duelHistoryContainer");
  if (!container) return;
  if (duelHistoryList.length === 0) {
    container.innerHTML = `<div class="p-3 rounded-xl subtle-box text-xs text-center text-muted-pro">Nenhum duelo finalizado recentemente. Desafie alguém na aba Simulado!</div>`;
    return;
  }
  container.innerHTML = duelHistoryList.map(h => `
    <div class="flex items-center justify-between p-2.5 rounded-xl subtle-box text-xs font-bold">
      <div class="flex items-center gap-2">
        <span>⚔️</span>
        <span><strong>${h.p1}</strong> (${h.score1}) x (${h.score2}) <strong>${h.p2}</strong></span>
      </div>
      <div class="text-right">
        <span class="text-amber-500 font-black">🏆 ${h.winner}</span>
        <span class="block text-[9px] text-muted-pro">${h.date}</span>
      </div>
    </div>
  `).join("");
}
function acceptDuelInvite() {
  playTabClickSound();
  if (!pendingDuelInvite) return;
  $("duelInvitePopup").classList.add("hidden");
  activeDuel = {
    duelId: pendingDuelInvite.duelId,
    isHost: false,
    hostKey: pendingDuelInvite.hostKey,
    hostName: pendingDuelInvite.hostName,
    hostAvatar: pendingDuelInvite.hostAvatar || "🍔",
    guestKey: pendingDuelInvite.guestKey,
    guestName: pendingDuelInvite.guestName,
    guestAvatar: pendingDuelInvite.guestAvatar || "🍟",
    scoreHost: 0,
    scoreGuest: 0,
    round: 0,
    status: "playing"
  };
  pendingDuelInvite = null;
  openDuelArenaUI();
  $("duelWaitingBox").classList.remove("hidden");
  $("duelWaitingText").textContent = "Conectando e sorteando a 1ª pergunta...";
  publishDuelPacket({ type: "accept", duelId: activeDuel.duelId });
}
function declineDuelInvite() {
  playTabClickSound();
  if (!pendingDuelInvite) return;
  $("duelInvitePopup").classList.add("hidden");
  publishDuelPacket({ type: "decline", duelId: pendingDuelInvite.duelId });
  pendingDuelInvite = null;
}
function openDuelArenaUI() {
  if (!activeDuel) return;
  $("duelArenaModal").classList.remove("hidden");
  updateDuelScoreboardUI();
}
function updateDuelScoreboardUI() {
  if (!activeDuel) return;
  const p1Av = $("duelP1Avatar");
  const p2Av = $("duelP2Avatar");
  if (p1Av) p1Av.innerHTML = isPhotoAvatar(activeDuel.hostAvatar) ? `<img src="${activeDuel.hostAvatar}" class="w-9 h-9 rounded-xl object-cover border border-[#FFC72C] mx-auto" />` : activeDuel.hostAvatar;
  if (p2Av) p2Av.innerHTML = isPhotoAvatar(activeDuel.guestAvatar) ? `<img src="${activeDuel.guestAvatar}" class="w-9 h-9 rounded-xl object-cover border border-[#FFC72C] mx-auto" />` : activeDuel.guestAvatar;
  $("duelP1Name").textContent = activeDuel.hostName;
  $("duelP1Score").textContent = activeDuel.scoreHost;
  $("duelP2Name").textContent = activeDuel.guestName;
  $("duelP2Score").textContent = activeDuel.scoreGuest;
  $("duelRoundBadge").textContent = `Rodada #${activeDuel.round || 1}`;
}
function hostStartNextDuelRound() {
  if (!activeDuel || !activeDuel.isHost) return;
  const nextRound = (activeDuel.round || 0) + 1;
  const bank=getQuestionBank();
  const randomItem=bank[Math.floor(Math.random()*bank.length)];
  const shuffledOptions = [...randomItem.w, randomItem.a].sort(() => 0.5 - Math.random());
  publishDuelPacket({
    type: "question",
    duelId: activeDuel.duelId,
    round: nextRound,
    scoreHost: activeDuel.scoreHost,
    scoreGuest: activeDuel.scoreGuest,
    question: { id: randomItem.id, level: randomItem.level, q: randomItem.q, a: randomItem.a, options: shuffledOptions }
  });
}
function renderDuelRoundUI() {
  if (!activeDuel || !activeDuel.currentQuestion) return;
  $("duelWaitingBox").classList.add("hidden");
  $("duelWinnerBox").classList.add("hidden");
  $("duelQuestionArea").classList.remove("hidden");
  $("duelStatusBanner").classList.add("hidden");
  updateDuelScoreboardUI();
  const qObj = activeDuel.currentQuestion;
  $("duelQuestionText").textContent = `(#${qObj.id}) ${qObj.q}`;
  const letters = ["A", "B", "C", "D"];
  const container = $("duelOptionsContainer");
  container.innerHTML = "";
  qObj.options.forEach((optText, idx) => {
    const letter = letters[idx];
    const btn = document.createElement("button");
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `
      <span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${letter}</span>
      <span class="flex-1 leading-snug">${trainerSafeHtml(optText)}</span>
    `;
    btn.onclick = () => submitDuelAnswer(btn, optText, qObj.a);
    container.appendChild(btn);
  });
}
function submitDuelAnswer(selectedBtn, chosen, correct) {
  if (!activeDuel || activeDuel.roundResolved) return;
  if (activeDuel.lockedPlayers && activeDuel.lockedPlayers[currentUserKey]) return;
  const allBtns = document.querySelectorAll("#duelOptionsContainer button");
  allBtns.forEach(b => b.disabled = true);
  const isCorrect = (chosen === correct);
  selectedBtn.className = isCorrect
    ? "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3"
    : "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
  const myName = (users[currentUserKey] && users[currentUserKey].name) || "Jogador";
  publishDuelPacket({
    type: "answer",
    duelId: activeDuel.duelId,
    playerKey: currentUserKey,
    playerName: myName,
    isCorrect: isCorrect,
    round: activeDuel.round
  });
}
function showDuelBanner(msg, color) {
  const banner = $("duelStatusBanner");
  banner.classList.remove("hidden");
  banner.className = color === "emerald"
    ? "p-3 rounded-2xl text-xs font-extrabold text-center bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
    : color === "amber"
      ? "p-3 rounded-2xl text-xs font-extrabold text-center bg-amber-500/20 text-amber-500 border border-amber-500/40"
      : "p-3 rounded-2xl text-xs font-extrabold text-center bg-red-500/20 text-red-500 border border-red-500/40";
  banner.textContent = msg;
}
function leaveActiveDuel(notifyOther = true) {
  playTabClickSound();
  if (activeDuel && notifyOther) {
    publishDuelPacket({ type: "leave", duelId: activeDuel.duelId, playerKey: currentUserKey });
  }
  activeDuel = null;
  $("duelArenaModal").classList.add("hidden");
}
// =========================================================================
// CORAÇÕES E RECARGA DE 10 MINUTOS
// =========================================================================
function getActiveHeartsLockUntil() {
  if (currentUserKey && users[currentUserKey]) return users[currentUserKey].heartsLockUntil || 0;
  return parseInt(localStorage.getItem("mequi_guest_hearts_lock") || "0", 10);
}
function setActiveHeartsState(heartsVal, lockUntilVal) {
  currentHearts = heartsVal;
  if (currentUserKey && users[currentUserKey]) {
    users[currentUserKey].hearts = heartsVal;
    users[currentUserKey].heartsLockUntil = lockUntilVal;
    users[currentUserKey].updatedAt = Date.now();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } else {
    localStorage.setItem("mequi_guest_hearts", String(heartsVal));
    localStorage.setItem("mequi_guest_hearts_lock", String(lockUntilVal));
  }
  updateHeartsDisplay();
}
function syncActiveUserHeartsState() {
  const now = Date.now();
  let lockUntil = getActiveHeartsLockUntil();
  if (currentUserKey && users[currentUserKey]) {
    currentHearts = users[currentUserKey].hearts !== undefined ? users[currentUserKey].hearts : 5;
  } else {
    currentHearts = parseInt(localStorage.getItem("mequi_guest_hearts") || "5", 10);
  }
  if (lockUntil > 0 && now >= lockUntil) {
    setActiveHeartsState(5, 0);
    lockUntil = 0;
  }
  updateHeartsDisplay();
  checkAndRenderCooldownScreen();
}
function formatTimeRemaining(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function checkAndRenderCooldownScreen() {
  const lockUntil = getActiveHeartsLockUntil();
  const now = Date.now();
  const cooldownBox = $("quizCooldownBox");
  const activeArea = $("quizActiveArea");
  const timerDisplay = $("cooldownTimerDisplay");
  if (lockUntil > now) {
    cooldownBox.classList.remove("hidden");
    activeArea.classList.add("hidden");
    timerDisplay.textContent = formatTimeRemaining(lockUntil - now);
    if (!cooldownIntervalId) {
      cooldownIntervalId = setInterval(() => {
        const rem = getActiveHeartsLockUntil() - Date.now();
        if (rem <= 0) {
          clearInterval(cooldownIntervalId);
          cooldownIntervalId = null;
          setActiveHeartsState(5, 0);
          cooldownBox.classList.add("hidden");
          activeArea.classList.remove("hidden");
          loadNextQuizQuestion();
          if (currentUserKey) scheduleCloudSync(currentUserKey, true);
        } else {
          timerDisplay.textContent = formatTimeRemaining(rem);
        }
      }, 1000);
    }
    return true;
  } else {
    if (cooldownIntervalId) {
      clearInterval(cooldownIntervalId);
      cooldownIntervalId = null;
    }
    if (currentHearts <= 0) setActiveHeartsState(5, 0);
    cooldownBox.classList.add("hidden");
    activeArea.classList.remove("hidden");
    return false;
  }
}
function changeQuizLevelFilter() {
  playTabClickSound();
  loadNextQuizQuestion();
}
function updateHeartsDisplay() {
  const safeHearts = Math.max(0, Math.min(5, currentHearts));
  const el = $("quizHeartsInfo");
  if (el) el.textContent = "❤️".repeat(safeHearts) + "🖤".repeat(5 - safeHearts);
  renderDailyChest();
}
// Sorteio sem reposição. A lista de questões vistas fica na conta;
// ao esgotar o filtro ativo, só as questões daquele filtro são reiniciadas.
// Assim, trocar de nível não reapresenta questões já vistas no ciclo.
const GUEST_QUIZ_ROTATION_KEY="mequi_venture_quiz_rotation_guest_v89";
function quizRotationForCurrentUser() {
  const user=currentUserKey&&users[currentUserKey];
  if(user){
    if(!user.quizRotation||typeof user.quizRotation!=="object") user.quizRotation={seen:[],updatedAt:0,lastId:null};
    return user.quizRotation;
  }
  try {
    const data=JSON.parse(localStorage.getItem(GUEST_QUIZ_ROTATION_KEY)||"null");
    return data&&typeof data==="object"?data:{seen:[],updatedAt:0,lastId:null};
  } catch(e){return {seen:[],updatedAt:0,lastId:null};}
}
function drawUnseenQuizQuestion(pool) {
  const rotation=quizRotationForCurrentUser();
  const allowed=new Set(pool.map(q=>String(q.id)));
  const valid=new Set(getQuestionBank().map(q=>String(q.id)));
  rotation.seen=Array.isArray(rotation.seen)?[...new Set(rotation.seen.map(String).filter(id=>valid.has(id)))]:[];
  let seen=new Set(rotation.seen);
  let remaining=pool.filter(q=>!seen.has(String(q.id)));
  let newRound=false;
  if(!remaining.length){
    // Reinicia somente depois de mostrar todas as questões do filtro.
    rotation.seen=rotation.seen.filter(id=>!allowed.has(id));
    remaining=pool;
    newRound=true;
  }
  let choices=remaining;
  if(newRound&&remaining.length>1){
    choices=remaining.filter(q=>String(q.id)!==String(rotation.lastId));
    if(!choices.length) choices=remaining;
  }
  const item=choices[Math.floor(Math.random()*choices.length)];
  rotation.seen.push(String(item.id));
  rotation.lastId=String(item.id);
  rotation.updatedAt=Date.now();
  if(currentUserKey&&users[currentUserKey]){
    users[currentUserKey].updatedAt=Math.max(Number(users[currentUserKey].updatedAt)||0,rotation.updatedAt);
    localStorage.setItem(STORAGE_USERS_KEY,JSON.stringify(users));
    scheduleCloudSync(currentUserKey,false);
  }else{
    localStorage.setItem(GUEST_QUIZ_ROTATION_KEY,JSON.stringify(rotation));
  }
  return {item,position:pool.length-remaining.length+1,total:pool.length,newRound};
}
function loadNextQuizQuestion() {
  playTabClickSound();
  syncActiveUserHeartsState();
  if (checkAndRenderCooldownScreen()) return;
  const levelFilter = $("quizLevelFilter").value;
  const pool = levelFilter === "ALL" ? getQuestionBank() : getQuestionBank().filter(item => item.level === levelFilter);
  if (!pool.length) {
    $("quizQuestionMeta").textContent = "Sem questões neste nível";
    $("quizQuestionText").textContent = "Ainda não há perguntas cadastradas para esta dificuldade.";
    $("quizOptions").replaceChildren();
    currentQuizQuestionId=null;
    return;
  }
  const {item:randomItem,position,total,newRound}=drawUnseenQuizQuestion(pool);
  currentQuizQuestionId = randomItem.id;
  $("quizQuestionMeta").textContent = `Questão #${randomItem.id} • ${randomItem.level} • ${position}/${total}${newRound?" 🔄 Nova rodada":""}`;
  $("statStreakDisplay").textContent = `${currentStreak} 🔥`;
  $("quizQuestionText").textContent = randomItem.q;
  $("quizFeedback").classList.add("hidden");
  $("nextQuizBtn").classList.add("hidden");
  const wrongChoices = (randomItem.w && randomItem.w.length === 3)
    ? [...randomItem.w]
    : getQuestionBank().filter(item => item.id !== randomItem.id).sort(() => 0.5 - Math.random()).slice(0, 3).map(item => item.a);
  const shuffledOptions = [...wrongChoices, randomItem.a].sort(() => 0.5 - Math.random());
  const letters = ["A", "B", "C", "D"];
  const container = $("quizOptions");
  container.innerHTML = "";
  shuffledOptions.forEach((optText, idx) => {
    const letter = letters[idx];
    const btn = document.createElement("button");
    btn.style.animationDelay = `${idx * 40}ms`;
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `
      <span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${letter}</span>
      <span class="flex-1 leading-snug">${trainerSafeHtml(optText)}</span>
    `;
    btn.onclick = () => checkQuizAnswer(btn, optText, randomItem.a, letter);
    container.appendChild(btn);
  });
}
function checkQuizAnswer(selectedBtn, chosen, correct, letter) {
  const allBtns = document.querySelectorAll("#quizOptions button");
  allBtns.forEach(b => {
    b.disabled = true;
    if (b.innerText.includes(correct) && chosen !== correct) {
      b.className = "w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/15 font-extrabold text-xs flex items-center gap-3";
    }
  });
  const fb = $("quizFeedback");
  fb.classList.remove("hidden");
  if (chosen === correct) {
    selectedBtn.className = "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3 shadow-md";
    currentStreak++;
    saveQuizStreak();
    if (currentUserKey && users[currentUserKey]) {
      users[currentUserKey].correctAnswers = (users[currentUserKey].correctAnswers || 0) + 1;
    }
    const earnedQuizXp = addXp(25);
    recordMissionActivity("quiz_correct");
    recordTrainerChallengeCorrect();
    fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30";
    fb.textContent = `✅ Alternativa ${letter} Correta! Você ganhou +${earnedQuizXp} XP!`;
    $("nextQuizBtn").textContent = "PRÓXIMA PERGUNTA ➡️";
    $("nextQuizBtn").classList.remove("hidden");
  } else {
    selectedBtn.className = "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
    currentStreak = 0;
    saveQuizStreak();
    playWrongAnswerSound();
    if (currentQuizQuestionId) recordMistakeQuestion(currentQuizQuestionId);
    const newHearts = Math.max(0, currentHearts - 1);
    if (newHearts <= 0) {
      const lockUntil = Date.now() + HEARTS_COOLDOWN_MS;
      setActiveHeartsState(0, lockUntil);
      if (currentUserKey) scheduleCloudSync(currentUserKey, true);
      fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500 border border-red-500/30";
      fb.innerHTML = `💔 <strong>Você perdeu todos os seus 5 corações!</strong><br>Gabarito: <span class="underline">${correct}</span>.<br><span class="mt-1 inline-block">⏳ Aguarde 10 minutos (ou abra a Bancada Monta-Lanche na aba Treinos)!</span>`;
      $("nextQuizBtn").textContent = "VER CRONÔMETRO DE RECARGA (10 MIN) ⏳";
      $("nextQuizBtn").classList.remove("hidden");
    } else {
      setActiveHeartsState(newHearts, 0);
      if (currentUserKey) scheduleCloudSync(currentUserKey, false);
      fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500 border border-red-500/30";
      fb.innerHTML = `❌ Quase! Você perdeu 1 coração (Restam ${newHearts} ❤️) e a questão foi salva em <strong>Minhas Dúvidas</strong>.<br>Gabarito: <span class="underline mt-1 inline-block">${correct}</span>`;
      $("nextQuizBtn").textContent = "PRÓXIMA PERGUNTA ➡️";
      $("nextQuizBtn").classList.remove("hidden");
    }
  }
  $("statStreakDisplay").textContent = `${currentStreak} 🔥`;
}
// =========================================================================
// FLASHCARDS 3D, BOOK E RANKING
// =========================================================================
function loadRandomFlashcard() {
  playCardFlipSound();
  const inner = $("fcFlipInner");
  if (!inner) return;
  inner.classList.remove("is-flipped");
  setTimeout(() => {
    const bank=getQuestionBank();
    const item=bank[Math.floor(Math.random()*bank.length)];
    $("fcMeta").textContent = `Questão #${item.id} (${item.level}) • Toque para girar 3D 🔄`;
    $("fcQuestion").textContent = item.q;
    $("fcAnswer").textContent = item.a;
  }, 150);
}
function flipFlashcard() {
  playCardFlipSound();
  const inner = $("fcFlipInner");
  if (inner) inner.classList.toggle("is-flipped");
}
let bookVisibleCount = 20;
function debouncedBookSearch() {
  bookVisibleCount = 20;
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => { renderBookList(); }, 150);
}
function setBookFilter(level) {
  playTabClickSound();
  currentBookFilter = level;
  bookVisibleCount = 20;
  ["ALL", "Básico", "Intermediário", "Avançado"].forEach(lvl => {
    const btn = $(`filter-${lvl}`);
    if (btn) {
      btn.className = lvl === level
        ? "px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-red-600 text-white shadow-sm shrink-0 btn-tap"
        : "px-3.5 py-1.5 rounded-xl text-xs font-extrabold subtle-box shrink-0 btn-tap";
    }
  });
  renderBookList();
}
function renderBookList() {
  const search = $("searchBookInput").value.toLowerCase();
  const container = $("bookQuestionsContainer");
  const filtered = getQuestionBank().filter(item => {
    const matchesLevel = currentBookFilter === "ALL" || item.level === currentBookFilter;
    const matchesText = !search || item.q.toLowerCase().includes(search) || item.a.toLowerCase().includes(search) || String(item.id).includes(search);
    return matchesLevel && matchesText;
  });
  $("bookCountBadge").textContent = `${filtered.length} questões`;
  container.innerHTML = filtered.slice(0, bookVisibleCount).map(item => `
    <div class="pro-card rounded-2xl p-4">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">Questão #${item.id} • ${item.level}</span>
        <button onclick="revealBookAnswer(this)" class="text-[11px] font-extrabold text-amber-500 hover:underline btn-tap">Ver Resposta</button>
      </div>
      <p class="font-extrabold text-xs leading-relaxed">${trainerSafeHtml(item.q)}</p>
      <p class="hidden mt-2.5 pt-2.5 border-t border-slate-500/20 text-xs font-bold text-emerald-500">✅ ${trainerSafeHtml(item.a)}</p>
    </div>
  `).join("") + (filtered.length > bookVisibleCount ?
    `<button class="book-load-more" type="button" onclick="loadMoreBookQuestions()">Mostrar mais questões (${Math.min(20, filtered.length-bookVisibleCount)} de ${filtered.length-bookVisibleCount} restantes) ↓</button>` : "");
}
function loadMoreBookQuestions() {
  bookVisibleCount += 20;
  renderBookList();
}
function revealBookAnswer(btn) {
  playCardFlipSound();
  const answerEl = btn.parentElement.nextElementSibling.nextElementSibling;
  if (answerEl.classList.contains("hidden")) {
    answerEl.classList.remove("hidden");
    btn.textContent = "Ocultar";
  } else {
    answerEl.classList.add("hidden");
    btn.textContent = "Ver Resposta";
  }
}
// ============================================================================
// 👥 V8.2 — PERFIS PÚBLICOS SOMENTE LEITURA
// O modal lê os dados sincronizados que já existem em users. NÃO grava nos
// perfis dos colegas e não mostra senha, identificadores internos ou dados de login.
// ============================================================================
