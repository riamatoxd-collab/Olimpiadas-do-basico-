/* Venture 9.2.0 · notificações internas e preparação segura para Web Push.
   Push com o site fechado exige backend autenticado, chaves VAPID e gestão de inscrições.
   Os comunicados locais continuam sujeitos às limitações da sincronização legada.
*/
(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const currentUser = () => {
    if (typeof currentUserKey === 'undefined' || typeof users === 'undefined' || !currentUserKey) return null;
    const user = users[currentUserKey];
    return user && user.name && !user._deleted ? user : null;
  };
  const storageKey = () => typeof STORAGE_USERS_KEY === 'string' ? STORAGE_USERS_KEY : 'mequi_olimpiadas_users_v6';
  const createId = () => {
    try { return 'notice:' + crypto.randomUUID(); }
    catch (_) { return 'notice:' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2); }
  };
  const safeDate = value => {
    const date = new Date(Number(value) || Date.now());
    try { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date); }
    catch (_) { return date.toLocaleString('pt-BR'); }
  };
  const currentIsAdmin = () => typeof isAdminUnlocked !== 'undefined' && Boolean(isAdminUnlocked);
  function listFor(user) {
    if (!Array.isArray(user.ventureNotifications)) user.ventureNotifications = [];
    return user.ventureNotifications;
  }
  function persist(sync) {
    try { localStorage.setItem(storageKey(), JSON.stringify(users)); } catch (error) { console.warn('Venture: não foi possível persistir notificações.', error); }
    if (sync && currentUser() && typeof scheduleCloudSync === 'function') scheduleCloudSync(currentUserKey, false);
  }
  function browserNotify(item) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted' || !document.hidden) return;
    try {
      const notification = new Notification(item.title || 'Venture', {
        body: item.body || '', icon: 'icons/venture-192.png', tag: item.id || 'venture-notification',
        data: { url: item.url || './', type: item.type || 'info' }
      });
      notification.onclick = function () {
        try { window.focus(); } catch (_) {}
        if (item.type === 'season' || item.type === 'league' || item.type === 'promotion') {
          if (typeof switchMainTab === 'function') switchMainTab('prizes');
        } else if (item.type === 'allstar' && typeof switchMainTab === 'function') switchMainTab('training');
        notification.close();
      };
    } catch (_) { /* Navegadores podem bloquear notificações criadas pela página. */ }
  }
  function addForUser(userKey, title, body, type, id, sync, deferPersist) {
    const user = typeof users !== 'undefined' && users ? users[userKey] : null;
    if (!user || !user.name || user._deleted) return null;
    const items = listFor(user);
    const itemId = String(id || createId());
    const existing = items.find(item => item && item.id === itemId);
    if (existing) return existing;
    const item = {
      id: itemId, title: String(title || 'Aviso do Venture').slice(0, 120),
      body: String(body || '').slice(0, 500), type: String(type || 'info').slice(0, 30),
      createdAt: Date.now(), readAt: null
    };
    user.ventureNotifications = [item, ...items].slice(0, 100);
    if (!deferPersist) persist(sync !== false && userKey === currentUserKey);
    if (userKey === currentUserKey) { render(); browserNotify(item); }
    return item;
  }
  function markRead(id) {
    const user = currentUser(); if (!user) return;
    const item = listFor(user).find(entry => entry && entry.id === id);
    if (item && !item.readAt) item.readAt = Date.now();
    persist(true); render();
  }
  function markAllRead() {
    const user = currentUser(); if (!user) return;
    const now = Date.now(); listFor(user).forEach(item => { if (item && !item.readAt) item.readAt = now; });
    persist(true); render();
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }
  function render() {
    const user = currentUser();
    const items = user ? listFor(user) : [];
    const unread = items.filter(item => item && !item.readAt).length;
    const count = byId('ventureNotificationCount');
    const list = byId('ventureNotificationList');
    const admin = byId('ventureNotificationAdmin');
    if (count) {
      count.textContent = unread > 99 ? '99+' : String(unread);
      count.classList.toggle('hidden', unread === 0);
      count.setAttribute('aria-label', unread + ' notificações não lidas');
    }
    if (list) {
      list.replaceChildren();
      if (!user) list.appendChild(el('div', 'vn-empty', 'Entre na sua conta para ver suas notificações.'));
      else if (!items.length) list.appendChild(el('div', 'vn-empty', 'Tudo em dia! Quando houver novidades, elas aparecerão aqui.'));
      else items.slice(0, 50).forEach(item => {
        const card = el('article', 'vn-item' + (item.readAt ? '' : ' is-unread'));
        const top = el('div', 'vn-item-top');
        const title = el('strong', 'vn-item-title', item.title);
        const time = el('time', 'vn-item-time', safeDate(item.createdAt));
        time.dateTime = new Date(Number(item.createdAt) || Date.now()).toISOString();
        top.append(title, time);
        const body = el('p', 'vn-item-body', item.body);
        const footer = el('div', 'vn-item-footer');
        const labels = { season: 'Temporada', promotion: 'Promoção', league: 'Liga', allstar: 'All Star', admin: 'Treinador', achievement: 'Conquista' };
        footer.appendChild(el('span', 'vn-type vn-type-' + String(item.type || 'info').replace(/[^a-z0-9_-]/gi, ''), labels[item.type] || 'Venture'));
        if (!item.readAt) {
          const button = el('button', 'vn-read-button', 'Marcar como lida'); button.type = 'button';
          button.addEventListener('click', () => markRead(item.id)); footer.appendChild(button);
        } else footer.appendChild(el('span', 'vn-read-label', 'Lida'));
        card.append(top, body, footer);
        card.addEventListener('click', event => {
          if (event.target.closest('button')) return;
          if (!item.readAt) markRead(item.id);
          if (item.type === 'season' || item.type === 'league' || item.type === 'promotion') { if (typeof switchMainTab === 'function') switchMainTab('prizes'); close(); }
          else if (item.type === 'allstar') { if (typeof switchMainTab === 'function') switchMainTab('training'); close(); }
        });
        list.appendChild(card);
      });
    }
    if (admin) admin.classList.toggle('hidden', !currentIsAdmin());
    const status = byId('venturePushStatus');
    const button = byId('ventureEnablePushBtn');
    if (status) {
      if (typeof Notification === 'undefined') status.textContent = 'Este navegador não oferece suporte a notificações do sistema. Os avisos internos continuam disponíveis.';
      else if (Notification.permission === 'granted') status.textContent = 'Permissão concedida. Toque no botão abaixo para confirmar a inscrição diária às 10h.';
      else if (Notification.permission === 'denied') status.textContent = 'Alertas bloqueados no navegador. Altere a permissão nas configurações do site.';
      else status.textContent = 'Ative os alertas deste aparelho. O envio push com o site fechado exige um servidor configurado.';
    }
    if (button) {
      button.disabled = typeof Notification === 'undefined' || !('serviceWorker' in navigator);
      button.textContent = typeof Notification !== 'undefined' && Notification.permission === 'granted' ? '🔔 Confirmar inscrição diária' : '🔔 Ativar notificações motivacionais';
    }
  }
  function open() {
    const modal = byId('ventureNotificationsModal'); if (!modal) return;
    render(); modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false');
    const closeButton = byId('ventureNotificationsClose'); if (closeButton) closeButton.focus();
  }
  function close() {
    const modal = byId('ventureNotificationsModal'); if (!modal) return;
    modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true');
    const bell = byId('ventureNotificationBell'); if (bell) bell.focus();
  }
  function urlBase64ToUint8Array(value) {
    const padding = '='.repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64); const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
    return output;
  }
  async function enableBrowserNotifications() {
    const status = byId('venturePushStatus');
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) { if (status) status.textContent = 'Este navegador não oferece suporte a notificações do sistema.'; return; }
    if (!window.isSecureContext) { if (status) status.textContent = 'Abra o Venture por HTTPS para ativar notificações do navegador.'; return; }
    try {
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (permission !== 'granted') { if (status) status.textContent = 'Permissão não concedida. Você ainda pode consultar os avisos dentro do Venture.'; render(); return; }
      await navigator.serviceWorker.register('./sw.js');
      const publicKey = String(window.VENTURE_PUSH_PUBLIC_KEY || '');
      const subscribeUrl = String(window.VENTURE_PUSH_SUBSCRIBE_URL || '');
      if (publicKey && subscribeUrl) {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
        const response = await fetch(subscribeUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription, playerKey: currentUserKey || null }) });
        if (!response.ok) throw new Error('Falha ao registrar inscrição push.');
        if (status) status.textContent = '✅ Pronto! Este aparelho está inscrito para receber mensagens diárias às 10h.';
      } else if (status) status.textContent = 'Servidor de notificações ainda não está configurado.';
    } catch (error) {
      if (status) status.textContent = 'Não foi possível ativar agora. Verifique a permissão e a configuração do site.';
    }
    // Não redesenhar agora: mantém a confirmação ou o erro de inscrição visível.
  }
  function sendAnnouncement() {
    if (!currentIsAdmin()) { alert('Somente o administrador pode enviar avisos globais.'); return; }
    const titleEl = byId('ventureAnnouncementTitle'), bodyEl = byId('ventureAnnouncementBody'), status = byId('ventureAnnouncementStatus');
    const title = titleEl ? titleEl.value.trim() : '', body = bodyEl ? bodyEl.value.trim() : '';
    if (title.length < 3 || body.length < 3) { if (status) status.textContent = 'Informe um título e uma mensagem.'; return; }
    const id = 'announcement:' + Date.now() + ':' + Math.random().toString(36).slice(2, 8);
    let sent = 0;
    Object.keys(users || {}).forEach(key => {
      const user = users[key]; if (!user || !user.name || user._deleted) return;
      addForUser(key, title, body, 'admin', id, false, true); sent++;
    });
    persist(false);
    if (typeof currentUserKey !== 'undefined' && currentUserKey && typeof scheduleCloudSync === 'function') scheduleCloudSync(currentUserKey, true);
    if (titleEl) titleEl.value = ''; if (bodyEl) bodyEl.value = '';
    if (status) status.textContent = 'Aviso salvo para ' + sent + ' cadastro(s) disponíveis neste aparelho. A entrega depende da sincronização legada; não use para conteúdo sensível.';
    render();
  }
  function currentUserReady() {
    const user = currentUser(); if (user && !Array.isArray(user.ventureNotifications)) { user.ventureNotifications = []; persist(false); }
    render();
  }
  const oldLogin = typeof handleLogin === 'function' ? handleLogin : null;
  if (oldLogin && !oldLogin.__ventureNotificationsWrapped) {
    const wrapped = async function () { const result = await oldLogin.apply(this, arguments); setTimeout(currentUserReady, 0); return result; };
    wrapped.__ventureNotificationsWrapped = true; handleLogin = wrapped;
  }
  const oldRegister = typeof handleRegister === 'function' ? handleRegister : null;
  if (oldRegister && !oldRegister.__ventureNotificationsWrapped) {
    const wrapped = function () { const result = oldRegister.apply(this, arguments); setTimeout(currentUserReady, 0); return result; };
    wrapped.__ventureNotificationsWrapped = true; handleRegister = wrapped;
  }
  const oldLogout = typeof logoutUser === 'function' ? logoutUser : null;
  if (oldLogout && !oldLogout.__ventureNotificationsWrapped) {
    const wrapped = function () { const result = oldLogout.apply(this, arguments); render(); return result; };
    wrapped.__ventureNotificationsWrapped = true; logoutUser = wrapped;
  }
  function installSeasonNotifications() {
    if (typeof ventureMonthlyCloseSeason !== 'function' || ventureMonthlyCloseSeason.__ventureNotificationsWrapped) return;
    const originalClose = ventureMonthlyCloseSeason;
    const wrappedClose = function (monthKey) {
      const result = originalClose.apply(this, arguments);
      if (result && typeof users !== 'undefined' && users) {
        Object.keys(users).forEach(key => {
          const user = users[key]; if (!user || !user.name || user._deleted) return;
          const state = typeof ventureMonthlyNormalizeState === 'function' ? ventureMonthlyNormalizeState(user.ventureMonthlyLeague) : null;
          const history = state && state.history ? state.history[monthKey] : null;
          if (!history) return;
          const division = typeof VENTURE_MONTHLY_LEAGUE_DIVISIONS !== 'undefined' ? VENTURE_MONTHLY_LEAGUE_DIVISIONS[history.divisionAfter] : null;
          const leagueName = division ? division.name : 'atual';
          let title = 'Temporada encerrada', body = 'Você permaneceu na Liga ' + leagueName + '.', type = 'league';
          if (history.outcome === 'promoted') { title = 'Você subiu de liga!'; body = 'Parabéns! Você avançou para a Liga ' + leagueName + '.'; type = 'promotion'; }
          else if (history.outcome === 'demoted') body = 'Nesta temporada você ficou na Liga ' + leagueName + '. Continue treinando para voltar a subir.';
          else if (history.outcome === 'inactive') body = 'Não houve XP registrado nesta temporada. Sua Liga ' + leagueName + ' foi mantida.';
          addForUser(key, title, body, type, 'league-result:' + monthKey + ':' + key, false, true);
        });
        persist(false);
        if (typeof currentUserKey !== 'undefined' && currentUserKey && typeof scheduleCloudSync === 'function') scheduleCloudSync(currentUserKey, true);
      }
      return result;
    };
    wrappedClose.__ventureNotificationsWrapped = true;
    ventureMonthlyCloseSeason = wrappedClose;
  }
  function init() {
    const bell = byId('ventureNotificationBell'), closeButton = byId('ventureNotificationsClose'), modal = byId('ventureNotificationsModal');
    if (bell) bell.addEventListener('click', open);
    if (closeButton) closeButton.addEventListener('click', close);
    if (modal) modal.addEventListener('click', event => { if (event.target === modal) close(); });
    const markAll = byId('ventureMarkAllReadBtn'); if (markAll) markAll.addEventListener('click', markAllRead);
    const push = byId('ventureEnablePushBtn'); if (push) push.addEventListener('click', enableBrowserNotifications);
    const send = byId('ventureAnnouncementSendBtn'); if (send) send.addEventListener('click', sendAnnouncement);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) close(); });
    if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('./sw.js').catch(() => {});
    installSeasonNotifications(); currentUserReady();
  }
  window.VentureNotifications = { addForUser, render, open, markAllRead, sendAnnouncement };
  window.openVentureNotifications = open;
  window.sendVentureAnnouncement = sendAnnouncement;
  window.enableVentureBrowserNotifications = enableBrowserNotifications;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
