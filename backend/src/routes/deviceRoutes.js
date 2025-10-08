const express = require('express');
const router = express.Router();
const DeviceController = require('../controllers/deviceController');
const Device = require('../models/Device');

// ensure DB init
Device.init();

router.post('/', DeviceController.postSensorData);
router.get('/', DeviceController.listDevices);

module.exports = router;
