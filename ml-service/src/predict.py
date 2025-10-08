import numpy as np
import json
from pathlib import Path
from tensorflow import keras

BASE = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE / 'model' / 'irrigation_model'
META = json.loads((BASE / 'model' / 'meta.json').read_text())
_model = None

def load_model():
    global _model
    if _model is None:
        _model = keras.models.load_model(MODEL_DIR)
    return _model

def predict_one(sample: dict):
    # sample: { soilMoisture, humidity, temperature }
    model = load_model()
    arr = np.array([[ sample.get('soilMoisture',0), sample.get('humidity',0), sample.get('temperature',0) ]], dtype=float)
    prob = float(model.predict(arr)[0][0])
    return {'irrigation_probability': prob}
  
