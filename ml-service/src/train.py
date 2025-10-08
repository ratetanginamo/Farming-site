import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from pathlib import Path
import json

def make_dummy_dataset(n=1000):
    np.random.seed(0)
    soil = np.random.uniform(0, 100, size=n)  # soil moisture %
    hum = np.random.uniform(20, 100, size=n)  # humidity %
    temp = np.random.uniform(10, 40, size=n)  # C
    # simple rule: irrigation needed more when soil low and temp high
    irrigation = (soil < 30).astype(float) * (1 + (temp - 20)/20)  # 0..~2
    irrigation = np.clip(irrigation, 0, 1)
    X = np.vstack([soil, hum, temp]).T
    y = irrigation
    return X, y

def train_and_save(model_dir='..//model'):
    X, y = make_dummy_dataset(2000)
    from sklearn.model_selection import train_test_split
    X_train, X_val, y_train, y_val = train_test_split(X,y,test_size=0.2, random_state=42)

    model = keras.Sequential([
        keras.layers.Input(shape=(3,)),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dense(16, activation='relu'),
        keras.layers.Dense(1, activation='sigmoid')  # probability irrigation needed
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_val,y_val))

    model_path = Path(__file__).resolve().parent.parent / 'model' / 'irrigation_model'
    model_path.parent.mkdir(parents=True, exist_ok=True)
    model.save(model_path)
    # save metadata
    meta = {'input_order': ['soilMoisture','humidity','temperature']}
    with open(model_path.parent / 'meta.json', 'w') as f:
        json.dump(meta, f)
    print('Model saved to', model_path)

if __name__ == '__main__':
    train_and_save()
  
