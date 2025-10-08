const Device = require('../models/Device');

/**
 * POST /api/devices
 * Save incoming sensor data (IoT device data)
 */
async function postSensorData(req, res) {
  try {
    const payload = req.body;

    // Validate incoming data
    if (!payload.deviceId) {
      return res.status(400).json({ error: 'Missing deviceId' });
    }

    const saved = await Device.add(payload);
    res.status(201).json({
      message: 'Sensor data saved successfully',
      data: saved
    });
  } catch (err) {
    console.error('Error in postSensorData:', err);
    res.status(500).json({ error: 'Failed to save sensor data' });
  }
}

/**
 * GET /api/devices
 * List all recorded devices or recent sensor readings
 */
async function listDevices(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50; // optional query param
    const devices = await Device.getLatest(limit);
    res.json({
      count: devices.length,
      data: devices
    });
  } catch (err) {
    console.error('Error in listDevices:', err);
    res.status(500).json({ error: 'Failed to list devices' });
  }
}

/**
 * GET /api/devices/all
 * Fetch the entire data collection (no limit)
 */
async function getAllDevices(req, res) {
  try {
    const devices = await Device.getAll();
    res.json({
      total: devices.length,
      data: devices
    });
  } catch (err) {
    console.error('Error in getAllDevices:', err);
    res.status(500).json({ error: 'Failed to fetch all devices' });
  }
}

/**
 * DELETE /api/devices/clear
 * Clears all saved device data (for testing)
 */
async function clearDevices(req, res) {
  try {
    const db = require('../models/Device');
    await db.init();
    db.data.devices = [];
    await db.write();
    res.json({ message: 'All device data cleared' });
  } catch (err) {
    console.error('Error in clearDevices:', err);
    res.status(500).json({ error: 'Failed to clear devices' });
  }
}

module.exports = {
  postSensorData,
  listDevices,
  getAllDevices,
  clearDevices
};
  
