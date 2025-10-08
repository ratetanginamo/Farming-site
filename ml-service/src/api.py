from flask import Flask, request, jsonify
from flask_cors import CORS
import src.predict as predict

app = Flask(__name__)
CORS(app)

@app.route('/')
def root():
    return jsonify({"service": "ml-service", "status": "ok"})

@app.route('/predict', methods=['POST'])
def predict_route():
    data = request.get_json()
    if not data:
        return jsonify({'error':'no json body'}), 400
    # Accept single sample or list
    if isinstance(data, dict):
        out = predict.predict_one(data)
        return jsonify(out)
    elif isinstance(data, list):
        results = [predict.predict_one(d) for d in data]
        return jsonify(results)
    else:
        return jsonify({'error':'invalid payload'}), 400

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
