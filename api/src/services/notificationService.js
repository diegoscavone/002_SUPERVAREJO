const webpush = require('web-push');
const knex = require('../database/knex');

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@supervarejo.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPushToUnit(unit, payload) {
  try {
    const subscriptions = await knex('push_subscriptions').where({ unit });

    const notifications = subscriptions.map(sub => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      return webpush.sendNotification(pushConfig, JSON.stringify(payload)).catch(async err => {
        // Se a assinatura expirou ou o usuário desinstalou, limpa do banco
        if (err.statusCode === 404 || err.statusCode === 410) {
          await knex('push_subscriptions').where({ id: sub.id }).delete();
        }
      });
    });

    await Promise.allSettled(notifications);
  } catch (error) {
    console.error('Erro ao enviar WebPush:', error);
  }
}

module.exports = { sendPushToUnit };