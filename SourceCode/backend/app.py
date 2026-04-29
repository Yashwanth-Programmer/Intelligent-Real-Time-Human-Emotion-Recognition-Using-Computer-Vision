import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import cv2
import json
import numpy as np
import base64
from flask import Flask, request, jsonify
from    flask_cors import CORS
from tensorflow import keras
from tensorflow.keras.layers import Dense as KerasDense


with open("config.json") as f:
    config = json.load(f)

image_size     = tuple(config["image_size"])
emotion_labels = config["emotion_labels"]
model_path     = config["model_path"]

print("⏳ Loading model …")
model = None
model_load_error = None


class CompatibleDense(KerasDense):
    @classmethod
    def from_config(cls, config):
        # Models saved with newer Keras may include this key.
        config.pop("quantization_config", None)
        return super().from_config(config)


try:
    model = keras.models.load_model(
        model_path,
        compile=False,
        custom_objects={"Dense": CompatibleDense},
    )
    print("✅ Model loaded")
except Exception as exc:
    model_load_error = str(exc)
    print(f"❌ Model failed to load: {model_load_error}")

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

app = Flask(__name__)
# Allow frontend calls from any deployed domain (Vercel, localhost, etc.).
CORS(app)


def preprocess_face(roi_gray):
    roi = cv2.resize(roi_gray, image_size, interpolation=cv2.INTER_AREA)
    roi = roi.astype("float32") / 255.0
    roi = keras.preprocessing.image.img_to_array(roi)
    return np.expand_dims(roi, axis=0)

def decode_image(source):
    if isinstance(source, (bytes, bytearray)):
        npimg = np.frombuffer(source, np.uint8)
    else:
        b64 = source.split(",", 1)[1] if "," in source else source
        npimg = np.frombuffer(base64.b64decode(b64), np.uint8)
    return cv2.imdecode(npimg, cv2.IMREAD_COLOR)

def run_inference(frame):
    if model is None:
        raise RuntimeError("Model is not loaded")
    gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.3, minNeighbors=5, minSize=(30, 30)
    )
    results = []
    for (x, y, w, h) in faces:
        roi   = preprocess_face(gray[y:y+h, x:x+w])
        preds = model.predict(roi, verbose=0)[0]
        idx   = int(np.argmax(preds))
        label = emotion_labels[idx]
        conf  = float(round(float(preds[idx]) * 100, 2))
        scores = {emotion_labels[i]: float(round(float(preds[i]) * 100, 2))
                  for i in range(len(emotion_labels))}

        color = (0, 200, 80)
        cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
        text = f"{label} {conf:.1f}%"
        (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
        cv2.rectangle(frame, (x, y-th-14), (x+tw+8, y), color, -1)
        cv2.putText(frame, text, (x+4, y-6),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        results.append({
            "dominant":   label,
            "confidence": conf,
            "scores":     scores,
            "bbox":       {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}
        })

    _, buf  = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
    b64_out = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8")
    return results, b64_out


# ── Routes ───────────────────────────────────────────────────────────────────
@app.route("/health")
def health():
    ready = model is not None
    return jsonify({
        "status": "ok" if ready else "degraded",
        "model": model_path,
        "model_ready": ready,
        "model_load_error": model_load_error,
        "labels": emotion_labels
    })

@app.route("/labels")
def labels():
    return jsonify({"labels": emotion_labels})

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({
            "error": "Model is not loaded on server",
            "model": model_path,
            "details": model_load_error
        }), 503

    if "image" in request.files:
        frame = decode_image(request.files["image"].read())
    else:
        data  = request.get_json(force=True)
        frame = decode_image(data.get("image", ""))

    if frame is None:
        return jsonify({"error": "Could not decode image"}), 400

    results, annotated = run_inference(frame)

    if not results:
        return jsonify({
            "faces_found":     0,
            "results":         [],
            "annotated_image": annotated,
            "message":         "No face detected. Try a clearer front-facing photo."
        })

    return jsonify({
        "faces_found":     len(results),
        "results":         results,
        "annotated_image": annotated
    })

@app.route("/webcam_frame", methods=["POST"])
def webcam_frame():
    if model is None:
        return jsonify({
            "error": "Model is not loaded on server",
            "model": model_path,
            "details": model_load_error
        }), 503

    data  = request.get_json(force=True)
    frame = decode_image(data.get("frame", ""))
    if frame is None:
        return jsonify({"error": "bad frame"}), 400
    results, annotated = run_inference(frame)
    return jsonify({
        "faces_found":     len(results),
        "results":         results,
        "annotated_frame": annotated
    })


if __name__ == "__main__":
    print("🚀 Intelligent Real-Time Human Emotion Recognition Using Computer Vision API running at http://localhost:5000")
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
