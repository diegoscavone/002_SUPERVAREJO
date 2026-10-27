const knex = require('../database/knex');

class NotificationController {
  async subscribe(request, response) {
    const { endpoint, keys, unit } = request.body;
    const user_id = request.user.id;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return response.status(400).json({ error: 'Assinatura Push inválida' });
    }

    const existing = await knex('push_subscriptions').where({ endpoint }).first();

    if (existing) {
      await knex('push_subscriptions').where({ endpoint }).update({
        user_id,
        unit,
        p256dh: keys.p256dh,
        auth: keys.auth
      });
    } else {
      await knex('push_subscriptions').insert({
        user_id,
        unit,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      });
    }

    return response.status(201).json({});
  }

  getPublicKey(request, response) {
    return response.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
  }
}

module.exports = NotificationController;