import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Demo from './pages/Demo';
import Webcam from './pages/Webcam';
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/demo"    element={<Demo />} />
        <Route path="/webcam"  element={<Webcam />} />
      </Routes>
    </BrowserRouter>
  );
}
