const webpush = require('web-push');
const knex = require('../database/knex');

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@supermercadosprincesa.com';

// 🛡️ Inicializa APENAS se as duas chaves estiverem presentes
if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    console.log('[WebPush] Chaves VAPID carregadas com sucesso.');
  } catch (err) {
    console.error('[WebPush] Erro ao configurar VAPID:', err.message);
  }
} else {
  console.warn('⚠️ [WebPush] VAPID_PUBLIC_KEY ou VAPID_PRIVATE_KEY ausentes no .env. Notificações Push desabilitadas.');
}

async function sendPushToUnit(unit, payload) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[WebPush] Disparo cancelado: chaves VAPID ausentes.');
    return;
  }

  try {
    const subscriptions = await knex('push_subscriptions').where({ unit: String(unit) });

    const notifications = subscriptions.map(sub => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      return webpush.sendNotification(pushConfig, JSON.stringify(payload)).catch(async err => {
        // Se a inscrição expirou ou o usuário desinstalou, limpa do banco
        if (err.statusCode === 404 || err.statusCode === 410) {
          await knex('push_subscriptions').where({ id: sub.id }).delete();
        }
      });
    });

    await Promise.allSettled(notifications);
  } catch (error) {
    console.error('[WebPush] Erro ao enviar notificações:', error);
  }
}

module.exports = { sendPushToUnit };