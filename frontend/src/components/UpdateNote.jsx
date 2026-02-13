// this is the component for updating an existing note in the note-taking application. 
import React, { useState } from 'react';
import { handleUpdateNote } from '../utils/noteHandlers';

function UpdateNote({ note, setNotes, closeForm }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedNote = { ...note, title, content };
    handleUpdateNote(note._id, updatedNote, setNotes);
    closeForm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4">Edit Note</h2>

        <input
          className="w-full mb-3 p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full mb-3 p-2 border rounded"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={closeForm}
            className="text-gray-600 hover:text-black"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateNote;
