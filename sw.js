/* Venture 9.2.0 · receptor de notificações push. A entrega exige backend e chaves VAPID configurados. */
self.addEventListener("install", function (event) { self.skipWaiting(); });
self.addEventListener("activate", function (event) { event.waitUntil(self.clients.claim()); });
self.addEventListener("push", function (event) {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch (_) { payload = { body: event.data ? event.data.text() : "" }; }
  const title = String(payload.title || "Venture · Novidade");
  const options = {
    body: String(payload.body || "Há uma nova atualização nas Olimpíadas do Básico."),
    icon: "./icons/venture-192.svg",
    badge: "./icons/venture-192.svg",
    tag: String(payload.tag || payload.id || "venture-push"),
    renotify: false,
    data: { url: payload.url || "./", type: payload.type || "info" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const data = event.notification.data || {};
  const target = new URL(data.url || "./", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clients) {
    for (const client of clients) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        return client.focus().then(function (focused) {
          if (client.navigate) return client.navigate(target).then(function () { return focused; });
          return focused;
        });
      }
    }
    return self.clients.openWindow ? self.clients.openWindow(target) : undefined;
  }));
});
