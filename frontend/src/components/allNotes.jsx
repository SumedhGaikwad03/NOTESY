// this is the component that displays all notes and allows editing and deleting them via buttons 
import React, { useEffect, useState } from 'react';
import { handleGetAllNotes , handleDeleteNote , handleUpdateNote } from '../utils/noteHandlers';
import UpdateNote from './UpdateNote';

function AllNotes() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    handleGetAllNotes(setNotes);
  }, []);

  const handleEditClick = (note) => {
    setEditingNote(note);
   
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100">
      <h2 className="text-3xl font-bold text-amber-700 mb-6">All Notes</h2>
      {/* this section only  renders when we are trying to update a note  or when editingNote is set */}
      {editingNote && (
        <UpdateNote
    note={editingNote}
    setNotes={setNotes}
    closeForm={() => setEditingNote(null)}
          />
)}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note._id}
            className="relative bg-white p-4 rounded-xl shadow-md border border-yellow-200"
          >
            <h3 className="text-xl font-semibold text-amber-800">{note.title}</h3>
            <p className="text-amber-700 mt-2 whitespace-pre-wrap">{note.content}</p>
            <button
              onClick={() => handleDeleteNote(note._id, setNotes)} // gives a call to delete note function from noteHandlers 
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Delete Note"
            >
              🗑️
            </button>
            <button
            onClick={() => handleEditClick(note)} // calls in notehandlers update note function 
            className="absolute top-2 right-10 text-blue-500 hover:text-blue-700"
             title="Edit Note"
             >
              ✏️
           </button>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-amber-600">No notes found in database.</p>
        )}
      </div>
    </div>
  );
}

export default AllNotes;
