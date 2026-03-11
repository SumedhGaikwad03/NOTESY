import React from "react";
import NoteCard from "./NoteCard";

function NotesBoard(props) {
  const { notes } = props;

  return (
    <div className="p-4 md:p-8 flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start relative z-10">
      {notes.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-24 text-center select-none">
          <div className="text-5xl mb-4 opacity-30">📝</div>
          <p className="text-amber-700 font-semibold text-lg opacity-40">No notes yet</p>
          <p className="text-amber-500 text-sm mt-1 opacity-30">Hit the + button to create the first one</p>
        </div>
      ) : (
        notes.map(note => (
          <NoteCard key={note._id} note={note} {...props} />
        ))
      )}
    </div>
  );
}

export default NotesBoard;