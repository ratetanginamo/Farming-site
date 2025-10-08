# Smart Farming Automation — Project Scaffold

**Title:** Smart Farming Automation using IoT and Machine Learning for Crop Yield Prediction

**Tech stack:** React.js (frontend), Node.js + Express (API), MongoDB (database), Python + TensorFlow (ML), MQTT/HTTP for IoT ingestion, optional Docker.

**Target users:** Agricultural farmers and stakeholders

**Key features:**

* Real-time Weather Monitoring
* Soil Moisture Analysis
* Crop Health Monitoring (NDVI / camera imagery)
* Predictive Analytics (crop yield prediction)
* Automated Irrigation System (actuator control)

---

## Project overview

This project demonstrates a full-stack smart farming system. The flow:

1. **IoT sensors** (soil moisture, temperature, humidity, light) publish data via MQTT/HTTP to the backend gateway.
2. **Backend (Node.js/Express)** receives sensor telemetry, stores raw data in MongoDB, forwards time-series to a message queue, and exposes REST APIs for the frontend and actuators.
3. **Python ML service** periodically trains/predicts crop yield using historical sensor data + weather + satellite indices and exposes a prediction API (Flask/FastAPI).
4. **React frontend** visualizes farm conditions, charts telemetry, displays predictions, and allows manual/automatic control of actuators (irrigation valves).
5. **Automation engine** runs rules (e.g., soil moisture threshold) that trigger actuators via secured endpoints or MQTT commands.

---

## Repository structure (suggested)

```
smart-farming/
├─ backend/                  # Node.js + Express API
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ models/
│  │  ├─ routes/
│  │  └─ index.js
│  ├─ package.json
│  └─ Dockerfile
├─ ml-service/               # Python + TensorFlow model / API
│  ├─ model/
│  ├─ src/
│  │  ├─ train.py
│  │  ├─ predict.py
│  │  └─ api.py
│  ├─ requirements.txt
│  └─ Dockerfile
├─ frontend/                 # React app
│  ├─ src/
│  ├─ public/
│  └─ package.json
├─ iot-gateway/              # lightweight gateway or simulator (optional)
├─ docs/
└─ README.md
```

---

## Quickstart (development)

Prerequisites: Node.js (16+), Python 3.8+, MongoDB, MQTT broker (e.g., Mosquitto), npm/yarn.

1. **Start MongoDB** (or use MongoDB Atlas)
2. **Run backend**

```bash
cd backend
npm install
# create .env with MONGO_URI, MQTT config, JWT_SECRET
npm run dev
```

3. **Run ML service**

```bash
cd ml-service
python -m venv venv
source venv/bin/activate    # on Windows: venv\Scripts\activate
pip install -r requirements.txt
# train or start API
python src/api.py
```

4. **Run frontend**

```bash
cd frontend
npm install
npm start
```

---

## Backend (Node.js) — key snippets

### package.json (minimal)

```json
{
  "name": "sf-backend",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.x",
    "mqtt": "^4.x",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5"
  }
}
```

### index.js (Express + basic endpoints)

```js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sensor = require('./models/Sensor'); // mongoose model

require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=>console.log('Mongo connected'))
  .catch(err=>console.error(err));

app.post('/api/telemetry', async (req,res)=>{
  // payload: { deviceId, timestamp, readings: {soilMoisture, temp, humidity, light} }
  const data = req.body;
  try{
    const doc = await Sensor.create(data);
    // optionally forward to processing queue or MQTT topic
    res.status(201).json(doc);
  }catch(e){ res.status(500).json({error:e.message}); }
});

// actuator endpoint
app.post('/api/actuate', async (req,res)=>{
  // { deviceId, command: 'OPEN'|'CLOSE' }
  // send MQTT message to device or store command
  res.json({status:'sent'});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log(`Backend listening ${PORT}`));
```

### Mongoose model (models/Sensor.js)

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sensorSchema = new Schema({
  deviceId: String,
  timestamp: { type: Date, default: Date.now },
  readings: {
    soilMoisture: Number,
    temperature: Number,
    humidity: Number,
    light: Number
  }
});
module.exports = mongoose.model('Sensor', sensorSchema);
```

---

## ML Service (Python + TensorFlow) — outline

`ml-service/src/train.py` — script to train a regression model (example uses TensorFlow Keras with tabular inputs).

```py
# train.py (simplified)
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models

# load data from CSV or MongoDB export
# expected columns: soilMoisture, temperature, humidity, light, rainfall, historical_yield

df = pd.read_csv('data/dataset.csv')
X = df[['soilMoisture','temperature','humidity','light','rainfall']].values
y = df['historical_yield'].values

model = models.Sequential([
    layers.Input(shape=(X.shape[1],)),
    layers.Dense(64, activation='relu'),
    layers.Dense(32, activation='relu'),
    layers.Dense(1)  # regression output
])
model.compile(optimizer='adam', loss='mse', metrics=['mae'])
model.fit(X, y, epochs=50, batch_size=32, validation_split=0.2)
model.save('model/crop_yield_model')
```

### Prediction API (src/api.py using FastAPI)

```py
from fastapi import FastAPI
import uvicorn
import tensorflow as tf
import numpy as np

app = FastAPI()
model = tf.keras.models.load_model('model/crop_yield_model')

@app.post('/predict')
def predict(payload: dict):
    features = np.array([[
        payload.get('soilMoisture',0),
        payload.get('temperature',0),
        payload.get('humidity',0),
        payload.get('light',0),
        payload.get('rainfall',0)
    ]])
    pred = model.predict(features)[0][0]
    return {'predicted_yield': float(pred)}

if __name__=='__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
```

---

## Frontend (React) — key ideas

* Use Create React App or Vite.
* Pages/components:

  * Dashboard (real-time charts using charting library)
  * Device list (display device status)
  * Prediction view (input date/range and show predicted yield)
  * Automation settings (thresholds for irrigation)

### Example fetch telemetry

```js
// src/services/api.js
export async function postTelemetry(data){
  return fetch(process.env.REACT_APP_API + '/api/telemetry', {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)
  }).then(r=>r.json());
}
```

---

## IoT & Automation

* Use MQTT for device-to-gateway communication (topic per device): `farm/{farmId}/device/{deviceId}/telemetry`
* Gateway can be a Raspberry Pi running a small Node or Python script that bridges sensor data to the backend.
* Actuators (valves, relays) subscribe to command topics: `farm/{farmId}/device/{deviceId}/commands`
* Automation rules engine in backend: evaluate sensor trends and predicted yield to decide irrigation schedules. Use simple cron or Node.js `node-schedule`.

Example automation rule (pseudo):

```
if (soilMoisture < threshold && predicted_yield_improvement > minBenefit) {
  sendActuation(deviceId, 'OPEN');
  schedule close after X minutes
}
```

Security: Use JWT for API, TLS for MQTT (if public), and device auth tokens.

---

## Data schema (MongoDB) suggestions

* `sensors` collection: deviceId, timestamp, readings
* `devices` collection: device metadata, location, type
* `predictions` collection: model, date, predicted_yield, input_features
* `actions` collection: logged actuations, status, response

---

## UI/UX and Charts

* Use lightweight charting like Chart.js or Recharts for React.
* Show alerts when sensors cross thresholds.
* Offer manual override for automations with safety confirmation.

---

## Deployment suggestions

* Containerize services with Docker.
* Use Docker Compose for local orchestration (backend, ml-service, mongodb, frontend reverse proxy).
* For production, deploy backend and ml-service to cloud (Heroku, AWS ECS, GCP Cloud Run) and MongoDB Atlas.

---

## Deliverables I can produce next (pick any)

* Full starter repo with working Node backend + React frontend + simple ML model and seed data.
* Docker Compose file for local dev.
* Raspberry Pi gateway script for MQTT publishing (Python).
* Complete UI mockups or code for the React Dashboard.
* A formal capstone proposal document and Gantt chart.

---

If you want, I can now: **generate the starter repo files** (backend, frontend, ml-service) in the chat right away — tell me which parts you want first and I'll create them here. If you want the full repo scaffold, I'll generate the essential files (package.json, index.js, models, React App skeleton, train.py, predict API, and Docker Compose) in this document.
