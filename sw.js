const CACHE = 'farmacia-v2';
const ASSETS = ['/farmacia/', '/farmacia/index.html', '/farmacia/manifest.json'];

// Alarms store: { key: "{nome}-{time}", nome, time, dettaglio }
let scheduledAlarms = {};

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('googleapis.com') ||
      e.request.url.includes('gstatic.com') ||
      e.request.url.includes('accounts.google.com') ||
      e.request.url.includes('firebaseapp.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Ricevi messaggi dall'app per programmare sveglie
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_ALARM') {
    const { nome, time, dettaglio } = e.data;
    const key = `${nome}-${time}`;
    if (scheduledAlarms[key]) return; // già programmato
    scheduledAlarms[key] = true;
    scheduleDaily(nome, time, dettaglio);
  }
  if (e.data?.type === 'CLEAR_ALARMS') {
    scheduledAlarms = {};
  }
});

function scheduleDaily(nome, time, dettaglio) {
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next - now;

  setTimeout(() => {
    fireNotification(nome, dettaglio);
    // Ripeti ogni 24h
    setInterval(() => fireNotification(nome, dettaglio), 24 * 60 * 60 * 1000);
  }, delay);
}

function fireNotification(nome, dettaglio) {
  self.registration.showNotification(`💊 ${nome}`, {
    body: dettaglio || 'È ora di prendere il medicinale',
    icon: '/farmacia/icon-192.png',
    badge: '/farmacia/icon-192.png',
    tag: nome,
    renotify: true,
    requireInteraction: false,
    actions: [{ action: 'ok', title: '✓ Preso' }]
  });
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'ok') return;
  e.waitUntil(clients.openWindow('/farmacia/'));
});
