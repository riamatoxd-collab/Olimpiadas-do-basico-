/* Venture 9.2.0 · centro de notificações e preparação para Web Push. */
(function () {
  "use strict";
  const byId = function (id) { return document.getElementById(id); };
  const currentUser = function () {
    if (typeof currentUserKey === "undefined" || typeof users === "undefined" || !currentUserKey) return null;
    const user = users[currentUserKey];
    return user && user.name && !user._deleted ? user : null;
  };
  const escapeTime = function (timestamp) {
    const date = new Date(Number(timestamp) || Date.now());
    try { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date); }
    catch (_) { return date.toLocaleString("pt-BR"); }
  };
  const makeId = function () {
    try { return "notice:" + crypto.randomUUID(); }
    catch (_) { return "notice:" + Date.now().toString(36) + ":" + Math.random().toString(36).slice(2); }
  };
  function listFor(user) {
    if (!user.ventureNotifications || !Array.isArray(user.ventureNotifications)) user.ventureNotifications = [];
    return user.ventureNotifications;
  }
  function persist(sync) {
    try { localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users)); } catch (_) {}
    if (sync && currentUser() && typeof scheduleCloudSync === "function") scheduleCloudSync(currentUserKey, false);
  }
  function isAdmin() {
    return typeof isAdminUnlocked !== "undefined" && Boolean(isAdminUnlocked);
  }
  function browserNotify(item) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted" || !document.hidden) return;
    try {
      const notification = new Notification(item.title || "Venture", {
        body: item.body || "",
        icon: "icons/venture-192.svg",
        tag: item.id || "venture-notification",
        data: { url: item.url || "./" }
      });
      notification.onclick = function () {
        try { window.focus(); } catch (_) {}
        if (item.type === "season" || item.type === "league" || item.type === "promotion") {
          if (typeof switchMainTab === "function") switchMainTab("prizes");
        } else if (item.type === "allstar" && typeof switchMainTab === "function") switchMainTab("training");
        notification.close();
      };
    } catch (_) {}
  }
  function addForUser(userKey, title, body, type, id, sync) {
    const user = typeof users !== "undefined" && users ? users[userKey] : null;
    if (!user || user._deleted) return null;
    const items = listFor(user);
    const itemId = String(id || makeId());
    const existing = items.find(function (item) { return item && item.id === itemId; });
    if (existing) return existing;
    const item = {
      id: itemId,
      title: String(title || "Aviso do Venture").slice(0, 120),
      body: String(body || "").slice(0, 500),
      type: String(type || "info"),
      createdAt: Date.now(),
      readAt: null
    };
    items.unshift(item);
    user.ventureNotifications = items.slice(0, 100);
    persist(sync !== false && userKey === currentUserKey);
    if (userKey === currentUserKey) {
      render();
      browserNotify(item);
    }
    return item;
  }
  function markRead(id) {
    const user = currentUser();
    if (!user) return;
    const item = listFor(user).find(function (entry) { return entry && entry.id === id; });
    if (item && !item.readAt) item.readAt = Date.now();
    persist(true);
    render();
  }
  function markAllRead() {
    const user = currentUser();
    if (!user) return;
    const now = Date.now();
    listFor(user).forEach(function (item) { if (item && !item.readAt) item.readAt = now; });
    persist(true);
    render();
  }
  function createText(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }
  function render() {
    const user = currentUser();
    const items = user ? listFor(user) : [];
    const unread = items.filter(function (item) { return item && !item.readAt; }).length;
    const count = byId("ventureNotificationCount");
    const list = byId("ventureNotificationList");
    const empty = byId("ventureNotificationEmpty");
    const adminPanel = byId("ventureNotificationAdmin");
    if (count) {
      count.textContent = unread > 99 ? "99+" : String(unread);
      count.classList.toggle("hidden", unread === 0);
      count.setAttribute("aria-label", unread + " notificações não lidas");
    }
    if (list) {
      list.replaceChildren();
      if (!user) {
        list.appendChild(createText("div", "vn-empty", "Entre na sua conta para ver suas notificações."));
      } else if (!items.length) {
        list.appendChild(createText("div", "vn-empty", "Tudo em dia! Quando houver novidades, elas aparecerão aqui."));
      } else {
        items.slice(0, 50).forEach(function (item) {
          const card = createText("article", "vn-item" + (item.readAt ? "" : " is-unread"));
          const top = createText("div", "vn-item-top");
          const title = createText("strong", "vn-item-title", item.title);
          const time = createText("time", "vn-item-time", escapeTime(item.createdAt));
          time.dateTime = new Date(Number(item.createdAt) || Date.now()).toISOString();
          top.append(title, time);
          const body = createText("p", "vn-item-body", item.body);
          const footer = createText("div", "vn-item-footer");
          const typeLabel = createText("span", "vn-type vn-type-" + String(item.type || "info").replace(/[^a-z0-9_-]/gi, ""), ({
            season: "Temporada", promotion: "Promoção", league: "Liga", allstar: "All Star", admin: "Treinador", achievement: "Conquista"
          })[item.type] || "Venture");
          footer.appendChild(typeLabel);
          if (!item.readAt) {
            const button = createText("button", "vn-read-button", "Marcar como lida");
            button.type = "button";
            button.addEventListener("click", function () { markRead(item.id); });
            footer.appendChild(button);
          } else footer.appendChild(createText("span", "vn-read-label", "Lida"));
          card.append(top, body, footer);
          card.addEventListener("click", function (event) {
            if (event.target.closest("button")) return;
            if (!item.readAt) markRead(item.id);
            if (item.type === "season" || item.type === "league" || item.type === "promotion") {
              if (typeof switchMainTab === "function") switchMainTab("prizes");
              close();
            } else if (item.type === "allstar" && typeof switchMainTab === "function") {
              switchMainTab("training");
              close();
            }
          });
          list.appendChild(card);
        });
      }
    }
    if (empty) empty.classList.toggle("hidden", Boolean(user && items.length));
    if (adminPanel) adminPanel.classList.toggle("hidden", !isAdmin());
    const pushStatus = byId("venturePushStatus");
    const pushButton = byId("ventureEnablePushBtn");
    if (pushStatus && typeof Notification !== "undefined") {
      pushStatus.textContent = Notification.permission === "granted"
        ? "Permissão do navegador concedida neste aparelho."
        : Notification.permission === "denied"
          ? "Notificações bloqueadas no navegador. Altere a permissão nas configurações do site."
          : "Ative os alertas deste aparelho. O envio push com o site fechado precisa de um servidor configurado.";
    }
    if (pushButton) {
      pushButton.disabled = typeof Notification === "undefined" || !("serviceWorker" in navigator);
      pushButton.textContent = typeof Notification !== "undefined" && Notification.permission === "granted" ? "Permissão concedida ✓" : "Ativar alertas neste aparelho";
    }
  }
  function open() {
    const modal = byId("ventureNotificationsModal");
    if (!modal) return;
    render();
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    const closeButton = byId("ventureNotificationsClose");
    if (closeButton) closeButton.focus();
  }
  function close() {
    const modal = byId("ventureNotificationsModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    const bell = byId("ventureNotificationBell");
    if (bell) bell.focus();
  }
  async function enableBrowserNotifications() {
    const status = byId("venturePushStatus");
    if (typeof Notification === "undefined" || !("serviceWorker" in navigator)) {
      if (status) status.textContent = "Este navegador não oferece suporte a notificações do sistema.";
      return;
    }
    if (!window.isSecureContext) {
      if (status) status.textContent = "Abra o Venture por HTTPS para ativar notificações do navegador.";
      return;
    }
    try {
      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (permission !== "granted") {
        if (status) status.textContent = "Permissão não concedida. Você ainda pode consultar os avisos dentro do Venture.";
        render();
        return;
      }
      await navigator.serviceWorker.register("./sw.js");
      const publicKey = String(window.VENTURE_PUSH_PUBLIC_KEY || "");
      const subscribeUrl = String(window.VENTURE_PUSH_SUBSCRIBE_URL || "");
      if (publicKey && subscribeUrl && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
          });
        }
        const response = await fetch(subscribeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription, playerKey: currentUserKey || null })
        });
        if (!response.ok) throw new Error("Não foi possível registrar a inscrição push no servidor.");
        if (status) status.textContent = "Alertas push ativados neste aparelho.";
      } else {
        if (status) status.textContent = "Permissão concedida e service worker instalado. Para receber push com o site fechado, falta configurar a chave VAPID e o servidor de envio. Os avisos internos já funcionam.";
      }
    } catch (error) {
      if (status) status.textContent = "Não foi possível ativar agora. Verifique a permissão do navegador e tente novamente.";
    }
    render();
  }
  function urlBase64ToUint8Array(value) {
    const padding = "=".repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
    return output;
  }
  function sendAnnouncement() {
    if (!isAdmin()) { alert("Somente o administrador pode enviar avisos globais."); return; }
    const titleEl = byId("ventureAnnouncementTitle");
    const bodyEl = byId("ventureAnnouncementBody");
    const status = byId("ventureAnnouncementStatus");
    const title = titleEl ? titleEl.value.trim() : "";
    const body = bodyEl ? bodyEl.value.trim() : "";
    if (title.length < 3 || body.length < 3) {
      if (status) status.textContent = "Informe um título e uma mensagem.";
      return;
    }
    const id = "announcement:" + Date.now() + ":" + Math.random().toString(36).slice(2, 8);
    let sent = 0;
    Object.keys(users || {}).forEach(function (key) {
      if (!users[key] || !users[key].name || users[key]._deleted) return;
      addForUser(key, title, body, "admin", id, false);
      sent += 1;
    });
    persist(false);
    if (typeof currentUserKey !== "undefined" && currentUserKey && typeof scheduleCloudSync === "function") scheduleCloudSync(currentUserKey, true);
    if (titleEl) titleEl.value = "";
    if (bodyEl) bodyEl.value = "";
    if (status) status.textContent = "Aviso preparado para " + sent + " cadastro(s). A entrega a outros aparelhos depende da sincronização atual.";
    render();
  }
  function onCurrentUserReady() {
    const user = currentUser();
    if (user) {
      listFor(user);
      persist(false);
    }
    render();
  }
  const originalLogin = typeof handleLogin === "function" ? handleLogin : null;
  if (originalLogin && !originalLogin.__ventureNotificationsWrapped) {
    const wrapped = async function () {
      const result = await originalLogin.apply(this, arguments);
      setTimeout(onCurrentUserReady, 0);
      return result;
    };
    wrapped.__ventureNotificationsWrapped = true;
    handleLogin = wrapped;
  }
  const originalRegister = typeof handleRegister === "function" ? handleRegister : null;
  if (originalRegister && !originalRegister.__ventureNotificationsWrapped) {
    const wrapped = function () {
      const result = originalRegister.apply(this, arguments);
      setTimeout(onCurrentUserReady, 0);
      return result;
    };
    wrapped.__ventureNotificationsWrapped = true;
    handleRegister = wrapped;
  }
  const originalLogout = typeof logoutUser === "function" ? logoutUser : null;
  if (originalLogout && !originalLogout.__ventureNotificationsWrapped) {
    const wrapped = function () {
      const result = originalLogout.apply(this, arguments);
      render();
      return result;
    };
    wrapped.__ventureNotificationsWrapped = true;
    logoutUser = wrapped;
  }
  function init() {
    const bell = byId("ventureNotificationBell");
    const closeButton = byId("ventureNotificationsClose");
    const modal = byId("ventureNotificationsModal");
    const markAll = byId("ventureMarkAllReadBtn");
    const enablePush = byId("ventureEnablePushBtn");
    const send = byId("ventureAnnouncementSendBtn");
    if (bell) bell.addEventListener("click", open);
    if (closeButton) closeButton.addEventListener("click", close);
    if (modal) modal.addEventListener("click", function (event) { if (event.target === modal) close(); });
    if (markAll) markAll.addEventListener("click", markAllRead);
    if (enablePush) enablePush.addEventListener("click", enableBrowserNotifications);
    if (send) send.addEventListener("click", sendAnnouncement);
    document.addEventListener("keydown", function (event) { if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) close(); });
    if ("serviceWorker" in navigator && window.isSecureContext) navigator.serviceWorker.register("./sw.js").catch(function () {});
    onCurrentUserReady();
  }
  window.VentureNotifications = {
    addForUser: addForUser,
    render: render,
    open: open,
    markAllRead: markAllRead,
    sendAnnouncement: sendAnnouncement
  };
  window.openVentureNotifications = open;
  window.sendVentureAnnouncement = sendAnnouncement;
  window.enableVentureBrowserNotifications = enableBrowserNotifications;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();