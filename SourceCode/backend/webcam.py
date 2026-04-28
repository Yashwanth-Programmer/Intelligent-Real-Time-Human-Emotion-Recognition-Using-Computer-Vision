"""
webcam.py — Standalone real-time webcam emotion detection (OpenCV window)
Run: python webcam.py
Press Q to quit.
"""
import os, json
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

with open("config.json") as f:
    config = json.load(f)

IMAGE_SIZE     = tuple(config["image_size"])
EMOTION_LABELS = config["emotion_labels"]
MODEL_PATH     = config["model_path"]

COLORS = {
    "Happy":"(0,210,80)", "Sad":"(200,80,30)", "Angry":"(30,30,220)",
    "Fear":"(160,50,160)", "Surprise":"(0,180,230)",
    "Disgust":"(40,120,40)", "Neutral":"(180,180,180)"
}
COLOR_MAP = {
    "Happy":(0,210,80), "Sad":(200,80,30), "Angry":(30,30,220),
    "Fear":(160,50,160), "Surprise":(0,180,230),
    "Disgust":(40,120,40), "Neutral":(180,180,180)
}

print("⏳ Loading model …")
model = load_model(MODEL_PATH)
print("✅ Ready")

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

cap = cv2.VideoCapture(0)
print("📷 Press Q to quit.")

while True:
    ret, frame = cap.read()
    if not ret: break

    gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5, minSize=(40,40))

    for (x, y, w, h) in faces:
        roi   = cv2.resize(gray[y:y+h, x:x+w], IMAGE_SIZE)
        arr   = img_to_array(roi.astype("float32") / 255.0)
        preds = model.predict(np.expand_dims(arr, axis=0), verbose=0)[0]
        idx   = int(np.argmax(preds))
        label = EMOTION_LABELS[idx]
        conf  = preds[idx] * 100
        color = COLOR_MAP.get(label, (255,255,255))

        cv2.rectangle(frame, (x,y), (x+w,y+h), color, 2)
        text = f"{label}  {conf:.1f}%"
        (tw,th),_ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.75, 2)
        cv2.rectangle(frame, (x, y-th-14), (x+tw+10, y), color, -1)
        cv2.putText(frame, text, (x+5,y-6), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255,255,255), 2)

    cv2.imshow("NOA — Emotion Detection  [Q to quit]", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cap.release()
cv2.destroyAllWindows()
