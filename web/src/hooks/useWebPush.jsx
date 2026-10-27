import { useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './auth';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useWebPush() {
  const { user } = useAuth();
  const unit = user?.unit || user?.unidade || user?.unid_codigo;

  useEffect(() => {
    async function registerServiceWorkerAndPush() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !user) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }
        if (permission !== 'granted') return;

        const { data } = await api.get('/notifications/push/public-key');
        if (!data.publicKey) return;

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(data.publicKey)
          });
        }

        const subJSON = subscription.toJSON();
        await api.post('/notifications/push/subscribe', {
          endpoint: subJSON.endpoint,
          keys: subJSON.keys,
          unit
        });
      } catch (err) {
        console.warn('Registro de Push falhou ou foi bloqueado:', err);
      }
    }

    registerServiceWorkerAndPush();
  }, [user, unit]);
}