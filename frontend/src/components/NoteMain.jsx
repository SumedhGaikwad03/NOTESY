// src/components/NoteMain.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';
import '../index.css';

function NoteMain() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-amber-100">
      <Sidebar
        title={title}
        content={content}
        setTitle={setTitle}
        setContent={setContent}
      />
      <NoteEditor
        title={title}
        content={content}
        setTitle={setTitle}
        setContent={setContent}
      />
    </div>
  );
}

export default NoteMain;
