import React, { useRef, useState } from 'react';

export default function UploadZone({ onFile, preview, annotated }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleFile = (file) => { if (file) onFile(file); };

  return (
    <div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${drag ? '#0f0f0f' : 'rgba(0,0,0,0.15)'}`,
          borderRadius: 16, padding: '28px 16px', textAlign: 'center',
          cursor: 'pointer', background: drag ? 'rgba(0,0,0,0.02)' : '#f0efea',
          minHeight: 240, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s', overflow: 'hidden',
        }}
      >
        {annotated ? (
          <img
            src={annotated} alt="Annotated"
            style={{ maxWidth: '100%', maxHeight: 220, width: 'auto', height: 'auto', borderRadius: 12, objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
        ) : preview ? (
          <img
            src={preview} alt="Preview"
            style={{ maxWidth: '100%', maxHeight: 220, width: 'auto', height: 'auto', borderRadius: 12, objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
        ) : (
          <>
            <div style={{
              width: 52, height: 52, background: '#0f0f0f', borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 14,
            }}>📷</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 5 }}>
              Drop a face image
            </div>
            <div style={{ fontSize: 12, color: '#8a8880', lineHeight: 1.5 }}>
              PNG / JPG · drag & drop or click
            </div>
            <button style={{
              marginTop: 16, background: '#0f0f0f', color: '#fafaf8',
              border: 'none', padding: '9px 22px', borderRadius: 100,
              fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer',
            }}>Browse File</button>
          </>
        )}
      </div>
      <input
        ref={inputRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
