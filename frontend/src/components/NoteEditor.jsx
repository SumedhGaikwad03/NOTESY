// this component provides an editor interface for creating and editing notes,
// including fields for the note title and content, as well as displaying the last updated date. 

import { Calendar, Edit3 } from 'lucide-react';
import React, { useEffect, useState } from 'react';


function NoteEditor({ title, content, setTitle, setContent }) {

  const [lastupdated, setLastUpdated] = useState();

   useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    setLastUpdated(formatted);
  }, []);
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 border-b border-yellow-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold text-amber-900 bg-transparent border-none outline-none focus:bg-yellow-50 px-2 py-1 rounded transition-colors duration-200"
          />
          <div className="flex items-center gap-3">
            <div className="text-sm text-amber-600 opacity-75 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Last updated: {lastupdated}
            </div>
            <button className="p-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-105 bg-amber-500 hover:bg-amber-600 text-white">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 bg-gradient-to-br from-yellow-25 to-amber-25">
        <textarea
          placeholder="Start writing your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full resize-none border-none outline-none text-amber-900 text-lg leading-relaxed bg-transparent placeholder-amber-400"
        />
      </div>
    </div>
  );
}

export default NoteEditor;
