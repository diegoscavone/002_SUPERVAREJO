// web/public/sw.js

self.addEventListener('push', event => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch (err) {
    data = { 
      title: 'Super Varejo', 
      body: event.data.text() 
    };
  }

  const options = {
    body: data.body || 'Alerta de validade de produto!',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    image: data.image || undefined,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/productsValidity'
    },
    tag: data.tag || 'product-validity-alert',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Super Varejo', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/productsValidity';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Se a aba já estiver aberta, foca nela e redireciona
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não estiver aberta, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});