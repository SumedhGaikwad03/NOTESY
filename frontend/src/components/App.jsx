// src/components/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NoteMain from './NoteMain';
import AllNotes from './allNotes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NoteMain />} />
        <Route path="/all-notes" element={<AllNotes />} />
      </Routes>
    </Router>
  );
}

export default App;
