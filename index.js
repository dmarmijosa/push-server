/**
 * =======================================

Public Key:
BFaNfESrwd7UjKt6SyUEBJu2tC_UvD3tvNcOnb7M5W8XzpcPG_FZD1pFouEr4Y4NMlMQZCvmKYTCZa4l058p5AI

Private Key:
VKqkou84q39z8ygk-5lzmJfHKDoa5urbCPNCmMb-HP0

=======================================
 */
const express = require('express');
const webPush = require('web-push');
const cors = require('cors');
const schedule = require('node-schedule');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Configurar VAPID
const vapidKeys = {
  publicKey: 'BFaNfESrwd7UjKt6SyUEBJu2tC_UvD3tvNcOnb7M5W8XzpcPG_FZD1pFouEr4Y4NMlMQZCvmKYTCZa4l058p5AI',
  privateKey: 'VKqkou84q39z8ygk-5lzmJfHKDoa5urbCPNCmMb-HP0'
};

webPush.setVapidDetails(
  'mailto:tu-email@dominio.com', // Info de contacto
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 2. Guardar suscripciones en memoria (o en DB)
let subscriptions = [];

// 3. Endpoint para recibir suscripciones desde el frontend
app.post('/subscribe', (req, res) => {
  const { subscription } = req.body;
  // Almacenar la suscripción
  subscriptions.push(subscription);
  console.log('Nueva suscripción agregada:', subscription);
  res.status(201).json({});
});

// 4. Función para enviar notificaciones a TODAS las suscripciones
function sendPushNotification(title, body) {
  const payload = JSON.stringify({ title, body });

  subscriptions.forEach((sub, index) => {
    webPush.sendNotification(sub, payload)
      .then(() => console.log('Notificación enviada'))
      .catch(err => {
        console.error('Error al enviar la notificación', err);
        // Si hay error 410, significa que la suscripción ya no es válida
        if (err.statusCode === 410) {
          subscriptions.splice(index, 1); // Eliminar suscripción inválida
        }
      });
  });
}

// 5. Programar notificaciones (ejemplo: todos los días a las 10:00)
// Programación de notificaciones diarias a las 22:37
schedule.scheduleJob('45 23 * * *', () => {
  console.log('Enviando notificaciones todos los días a las 23:15...');
  sendPushNotification(
    '¡Buenas noches!',
    'Esta es una notificación programada a las 22:37.'
  );
});

// 6. Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor de notificaciones escuchando en http://localhost:${PORT}`);
});