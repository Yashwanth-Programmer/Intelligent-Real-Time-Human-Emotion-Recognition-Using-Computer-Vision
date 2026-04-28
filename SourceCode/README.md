# NOA — Emotion Detector (React + Flask)

```
noa_app/
├── backend/
│   ├── app.py              ← Flask REST API
│   ├── train.py            ← Train CNN on FER-2013
│   ├── webcam.py           ← Standalone OpenCV webcam
│   ├── config.json         ← Shared config
│   ├── emotion_model.h5    ← Place your trained model here
│   └── requirements.txt
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js / index.css
        ├── constants.js
        ├── components/
        │   ├── Navbar.js
        │   ├── DemoCard.js
        │   ├── EmotionBars.js
        │   └── UploadZone.js
        └── pages/
            ├── Home.js     ← Landing + hero demo
            ├── Demo.js     ← Full upload page
            ├── Webcam.js   ← Live webcam detection
            └── Models.js   ← Model comparison
```

---

## Setup

### 1. Backend (Flask)
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt

# Train model (if not already done)
python train.py --zip "C:/path/to/archive.zip" --out . --epochs 25

# Start server
python app.py
# → http://localhost:5000
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

Both must run simultaneously. The React app proxies API calls to Flask at port 5000.

---

## API Endpoints

| Method | Endpoint        | Description                        |
|--------|-----------------|------------------------------------|
| GET    | /health         | Server status + model info         |
| GET    | /labels         | Returns emotion label list         |
| POST   | /predict        | Analyse uploaded image             |
| POST   | /webcam_frame   | Process base64 webcam frame        |

---

## Pages
- `/`        — Landing page with hero demo
- `/demo`    — Full image upload & analyze
- `/webcam`  — Live webcam streaming detection  
- `/models`  — Model architecture comparison
