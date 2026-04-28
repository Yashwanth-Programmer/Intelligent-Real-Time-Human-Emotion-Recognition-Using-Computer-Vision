export const API_BASE = 'http://localhost:5000';

export const EMOTION_COLORS = {
  Angry:    '#c1121f',
  Disgust:  '#6c584c',
  Fear:     '#7b5ea7',
  Happy:    '#2d6a4f',
  Sad:      '#457b9d',
  Surprise: '#f4a261',
  Neutral:  '#8a8880',
};

export const EMOTION_EMOJIS = {
  Angry:    '😠',
  Disgust:  '🤢',
  Fear:     '😨',
  Happy:    '😊',
  Sad:      '😢',
  Surprise: '😲',
  Neutral:  '😐',
};

// Offline demo fallback samples
export const DEMO_SAMPLES = {
  Happy:    { Happy:84, Neutral:7,  Surprise:4, Sad:2,  Fear:1,  Angry:1,  Disgust:1 },
  Angry:    { Angry:76, Disgust:10, Neutral:6,  Fear:4, Sad:3,   Surprise:1,Happy:0  },
  Sad:      { Sad:80,   Neutral:10, Fear:5,     Angry:2,Disgust:1,Surprise:1,Happy:1 },
  Surprise: { Surprise:78,Fear:10, Happy:6,    Neutral:3,Angry:1,Sad:1,   Disgust:1 },
  Fear:     { Fear:72,  Surprise:12,Neutral:7, Sad:5,  Angry:2, Happy:1,  Disgust:1 },
  Neutral:  { Neutral:68,Happy:12, Sad:8,      Fear:4, Angry:4, Surprise:3,Disgust:1},
  Disgust:  { Disgust:70,Angry:14, Neutral:8,  Sad:4,  Fear:2,  Surprise:1,Happy:1  },
};

function svgDataUrl(emoji, label) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='520'>` +
    `<rect width='100%' height='100%' fill='%23f6f4f0'/>` +
    `<text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-size='120'>${emoji}</text>` +
    `<text x='50%' y='75%' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='%238a8880' font-family='DM Sans, sans-serif'>${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_IMAGES = {
  Happy:    svgDataUrl('😊','Happy'),
  Angry:    svgDataUrl('😠','Angry'),
  Sad:      svgDataUrl('😢','Sad'),
  Surprise: svgDataUrl('😲','Surprise'),
  Fear:     svgDataUrl('😨','Fear'),
  Neutral:  svgDataUrl('😐','Neutral'),
  Disgust:  svgDataUrl('🤢','Disgust'),
};

export function addNoise(scores) {
  const result = {};
  let total = 0;
  for (const k in scores) {
    result[k] = Math.max(0.1, scores[k] + (Math.random() - 0.5) * 4);
    total += result[k];
  }
  for (const k in result) result[k] = parseFloat((result[k] / total * 100).toFixed(1));
  return result;
}
