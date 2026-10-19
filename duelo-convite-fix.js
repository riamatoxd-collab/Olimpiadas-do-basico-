/*
 * Venture 8.9.1 — correção isolada dos convites 1v1 (visual/transporte).
 * NÃO modifica usuários, credenciais, XP, histórico, armazenamento ou sincronização de ranking.
 * Carregar DEPOIS de js/07-jogos.js e script.js.
 * MQTT não oferece notificações push se o site estiver fechado: ambos devem estar online.
 */
(function ventureDuelInviteFix() {
  'use strict';
  if (window.__ventureDuelInviteFixInstalled) return;
  window.__ventureDuelInviteFixInstalled = true;

  const originalSend = window.sendLiveDuelInvite;
  const originalReceive = window.handleIncomingDuelPacket;
  if (typeof originalSend !== 'function' || typeof originalReceive !== 'function') {
    console.warn('[Venture 1v1] Arquivos originais indisponíveis. Correção não aplicada.');
    return;
  }

  const RETRY_EVERY_MS = 4500;
  const MAX_ATTEMPTS = 12; // inclui envio original; nunca publicar indefinidamente
  let pendingId = '';
  let retries = 0;
  let deliveryConfirmed = false;
  let earlyConfirmationId = '';
  let retryTimer = null;

  const elt = id => document.getElementById(id);
  const connected = () => {
    try { return typeof mqttClients !== 'undefined' && Array.isArray(mqttClients) && mqttClients.some(c => c && c.connected); }
    catch (_) { return false; }
  };
  const isMe = key => {
    try { return String(key) === String(currentUserKey) && !!currentUserKey; }
    catch (_) { return false; }
  };
  const runningDuel = () => {
    try { return typeof activeDuel !== 'undefined' ? activeDuel : null; }
    catch (_) { return null; }
  };
  const incomingInvitation = () => {
    try { return typeof pendingDuelInvite !== 'undefined' ? pendingDuelInvite : null; }
    catch (_) { return null; }
  };
  const publish = packet => {
    if (!connected()) return false;
    try { publishDuelPacket(packet); return true; }
    catch (err) { console.warn('[Venture 1v1] Mensagem não enviada:', err); return false; }
  };
  const waitText = value => { const node = elt('duelWaitingText'); if (node) node.textContent = value; };
  const safeName = (value, fallback='Colega') => typeof value === 'string' && value.trim() ? value.trim().slice(0, 110) : fallback;

  function stopRetries() {
    if (retryTimer !== null) clearInterval(retryTimer);
    retryTimer = null;
    pendingId = '';
    retries = 0;
    deliveryConfirmed = false;
  }

  function connectionBadge() {
    let label = elt('ventureDuelConnectionStatus');
    if (!label) {
      const select = elt('duelOpponentSelect');
      const area = select && select.parentElement;
      if (!area) return;
      label = document.createElement('p');
      label.id = 'ventureDuelConnectionStatus';
      label.setAttribute('role', 'status');
      label.style.cssText = 'flex-basis:100%;font-size:11px;font-weight:750;line-height:1.45;margin:5px 2px 0;';
      area.appendChild(label);
    }
    if (connected()) {
      label.textContent = '🟢 1v1 conectado. O colega precisa estar com o site aberto para receber o convite.';
      label.style.color = '#15956c';
    } else {
      label.textContent = '🔴 1v1 sem conexão ao servidor de duelos. Verifique a internet e aguarde.';
      label.style.color = '#c43c34';
    }
  }

  function packetFromDuel(duel) {
    return {
      type: 'invite', duelId: duel.duelId,
      hostKey: duel.hostKey, hostName: duel.hostName,
      hostAvatar: duel.hostAvatar || '🍔',
      guestKey: duel.guestKey, guestName: duel.guestName,
      guestAvatar: duel.guestAvatar || '🍟'
    };
  }

  function startConfirmations(duel) {
    stopRetries();
    pendingId = duel.duelId;
    retries = 1; // envio original já ocorreu
    const who = safeName(duel.guestName);
    waitText(`📡 Chamando ${who}... aguardando confirmação de recebimento no outro celular.`);
    if (earlyConfirmationId === duel.duelId) {
      deliveryConfirmed = true;
      waitText(`✅ ${who} recebeu o convite! Aguardando aceitar ou recusar no celular.`);
      return;
    }
    retryTimer = setInterval(() => {
      const now = runningDuel();
      if (!now || now.duelId !== pendingId || now.status !== 'waiting' || deliveryConfirmed) {
        stopRetries();
        return;
      }
      if (retries >= MAX_ATTEMPTS) {
        clearInterval(retryTimer);
        retryTimer = null;
        waitText(`⚠️ ${who} não confirmou o recebimento. Peça para abrir o jogo, verificar a internet e enviar um novo desafio. O duelo NÃO começou.`);
        return;
      }
      if (!connected()) {
        waitText(`🔴 Sem conexão. Tentaremos reenviar a ${who} quando o servidor voltar.`);
        return;
      }
      if (publish(packetFromDuel(now))) {
        retries++;
        waitText(`📡 Chamando ${who}... esperando o outro celular confirmar (${retries}/${MAX_ATTEMPTS}).`);
      }
    }, RETRY_EVERY_MS);
  }

  window.sendLiveDuelInvite = function sendLiveDuelInviteWithConfirmation() {
    connectionBadge();
    if (!connected()) {
      alert('O 1v1 ainda não está conectado. Verifique a internet, espere aparecer 🟢 1v1 conectado e tente novamente. Nenhum XP foi alterado.');
      return;
    }
    const previous = runningDuel();
    if (previous && previous.status !== 'finished') {
      alert('Já existe um duelo em andamento ou aguardando resposta. Saia dele antes de enviar outro convite.');
      return;
    }
    originalSend.apply(this, arguments);
    const current = runningDuel();
    if (current && current.isHost && current.status === 'waiting' && current.duelId !== previous?.duelId) {
      startConfirmations(current);
    }
  };

  window.handleIncomingDuelPacket = function handleIncomingDuelPacketWithConfirmation(pkt) {
    if (!pkt || typeof pkt !== 'object') return;
    const duel = runningDuel();
    if (pkt.type === 'invite_received') {
      if (duel && duel.isHost && duel.duelId === pkt.duelId && String(pkt.guestKey) === String(duel.guestKey)) {
        earlyConfirmationId = duel.duelId;
        if (pendingId === duel.duelId) {
          deliveryConfirmed = true;
          if (retryTimer !== null) clearInterval(retryTimer);
          retryTimer = null;
          waitText(`✅ ${safeName(duel.guestName)} recebeu o convite! Aguardando aceitar ou recusar no celular.`);
        }
      }
      return;
    }
    if (pkt.type === 'invite_busy') {
      if (duel && duel.isHost && duel.duelId === pkt.duelId && String(pkt.guestKey) === String(duel.guestKey)) {
        stopRetries();
        waitText(`⚠️ ${safeName(duel.guestName)} está em outro duelo ou já tem um convite pendente. Aguarde e tente novamente.`);
      }
      return;
    }
    if (pkt.type === 'invite' && isMe(pkt.guestKey)) {
      if (typeof pkt.duelId !== 'string' || !pkt.duelId || typeof pkt.hostKey !== 'string' || !pkt.hostKey || isMe(pkt.hostKey)) return;
      // Se está jogando ou já recebeu outro convite, não substituir a arena atual.
      const existing = incomingInvitation();
      if (runningDuel() || (existing && existing.duelId !== pkt.duelId)) {
        publish({ type: 'invite_busy', duelId: pkt.duelId, guestKey: pkt.guestKey });
        return;
      }
      // Convites chegam duplicados quando ambos os brokers MQTT estão conectados.
      if (!existing) {
        const name = safeName(pkt.hostName, 'Colega');
        const corrected = { ...pkt, hostName: name };
        originalReceive(corrected);
        if (elt('inviteFromNameDisplay')) elt('inviteFromNameDisplay').textContent = name;
        // Mostrar claramente, inclusive se outra área adicionou estilos ao site.
        const popup = elt('duelInvitePopup');
        if (popup) popup.style.zIndex = '10010';
      }
      if (incomingInvitation()?.duelId === pkt.duelId) {
        publish({ type: 'invite_received', duelId: pkt.duelId, guestKey: pkt.guestKey });
      }
      return;
    }
    if (duel && pkt.duelId === duel.duelId && ['accept', 'decline', 'question', 'finish', 'leave'].includes(pkt.type)) {
      // Não interromper a pontuação, respostas ou desfecho: apenas encerrar a tentativa de convite.
      if (pkt.type === 'accept' || pkt.type === 'decline') stopRetries();
    }
    return originalReceive.apply(this, arguments);
  };

  document.addEventListener('DOMContentLoaded', () => {
    connectionBadge();
    setInterval(connectionBadge, 5000);
  });
  if (document.readyState !== 'loading') {
    connectionBadge();
    setInterval(connectionBadge, 5000);
  }
})();
