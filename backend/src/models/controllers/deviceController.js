const Device = require('../models/Device');

async function postSensorData(req, res) {
  try {
    const payload = req.body; // e.g. { deviceId, temperature, humidity, soilMoisture }
    const saved = await Device.add(payload);
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save sensor data' });
  }
}

async function listDevices(req, res) {
  try {
    const devices = await Device.getLatest(100);
    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list devices' });
  }
}

module.exports = { postSensorData, listDevices };
