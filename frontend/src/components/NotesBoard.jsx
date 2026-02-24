import React from "react";
import NoteCard from "./NoteCard";

function NotesBoard(props) {
  const { notes } = props;

  return (
    <div className="p-8 flex flex-wrap gap-8 justify-start relative z-10">
      {notes.length === 0 ? (
        <p>No notes in this room.</p>
      ) : (
        notes.map(note => (
          <NoteCard key={note._id} note={note} {...props} />
        ))
      )}
    </div>
  );
}

export default NotesBoard;
