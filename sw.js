/* Venture 9.2.1 · service worker para notificações push. Requer backend de envio. */
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch (_) { payload = { body: event.data ? event.data.text() : '' }; }
  const title = String(payload.title || 'Venture · Novidade');
  const options = {
    body: String(payload.body || 'Há uma nova atualização nas Olimpíadas do Básico.'),
    icon: './icons/venture-192.png', badge: './icons/venture-192.png',
    tag: String(payload.tag || payload.id || 'venture-push'), renotify: false,
    data: { url: payload.url || './', type: payload.type || 'info' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = new URL(data.url || './', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    for (const client of clients) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        return client.focus().then(focused => client.navigate ? client.navigate(target).then(() => focused) : focused);
      }
    }
    return self.clients.openWindow ? self.clients.openWindow(target) : undefined;
  }));
});
