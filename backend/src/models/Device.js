const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const { nanoid } = require('nanoid');

const file = path.join(__dirname, '../../db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function init() {
  await db.read();
  db.data ||= { devices: [] };
  await db.write();
}

async function getAll() {
  await db.read();
  return db.data.devices;
}

async function add(sensorData) {
  await db.read();
  const device = { id: nanoid(), timestamp: new Date().toISOString(), ...sensorData };
  db.data.devices.push(device);
  await db.write();
  return device;
}

async function getLatest(limit = 50) {
  await db.read();
  return db.data.devices.slice(-limit);
}

module.exports = { init, getAll, add, getLatest };
