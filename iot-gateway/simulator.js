const axios = require('axios');

const BACKEND = process.env.BACKEND_URL || 'http://localhost:3001/api/devices';
const DEVICE_ID = process.env.DEVICE_ID || 'sim-01';

function rand(min, max) { return Math.random() * (max - min) + min; }

async function send() {
  const payload = {
    deviceId: DEVICE_ID,
    soilMoisture: parseFloat(rand(10, 80).toFixed(1)),
    humidity: parseFloat(rand(30, 90).toFixed(1)),
    temperature: parseFloat(rand(15, 35).toFixed(1))
  };
  try {
    await axios.post(BACKEND, payload);
    console.log('Sent', payload);
  } catch (err) {
    console.error('Send failed', err.message);
  }
}

setInterval(send, 5000);
send();
