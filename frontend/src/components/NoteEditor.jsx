import React from "react";

function NoteEditor({ title, content, setTitle, setContent }) {
  return (
    <div className="flex-1 flex flex-col p-6">

      {/* Title */}
      <input
        type="text"
        placeholder="Note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-2xl font-bold mb-4 border-b border-yellow-300 outline-none focus:border-amber-500 transition-colors"
      />

      {/* Content */}
      <textarea
        placeholder="Start writing your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 resize-none outline-none text-lg leading-relaxed"
      />

    </div>
  );
}

export default NoteEditor;
