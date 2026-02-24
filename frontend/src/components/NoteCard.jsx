import React from "react";
import { motion } from "framer-motion";

function NoteCard({
  note,
  editingId,
  setEditingId,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  saveEdit,
  deleteNote,
  getRotation,
  roomId,
  editingUsers,
  socket,
  currentUserId
}) {
  const isEditing = editingId === note._id;

  const editingUserId = editingUsers[note._id];
  const isBeingEditedByOther =
    editingUserId && editingUserId !== currentUserId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.25 }}
      onDoubleClick={() => {
        setEditingId(note._id);
        setEditTitle(note.title);
        setEditContent(note.content);

        socket.emit("note_editing_start", {
          roomId,
          noteId: note._id
        });
      }}
      className={`relative w-64 bg-white p-5 rounded-md border transition-all duration-300
        ${
          isBeingEditedByOther
            ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-200"
            : "border-yellow-200 shadow-[6px_6px_12px_rgba(0,0,0,0.15)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.25)]"
        }
      `}
      style={{ rotate: `${getRotation(note._id)}deg` }}
    >
      {/* Tape strip */}
      <div className="absolute -top-3 left-6 w-10 h-4 bg-gray-300 rounded-sm shadow-md rotate-3"></div>

      {/* Editing indicator */}
      {isBeingEditedByOther && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 right-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full"
        >
          Editing...
        </motion.div>
      )}

      {isEditing ? (
        <>
          <input
            className="w-full border p-1 mb-2 rounded"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />

          <textarea
            className="w-full border p-1 rounded"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />

          <div className="flex justify-between mt-3">
            <button
              className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 transition"
              onClick={() => {
                saveEdit(note._id);

                socket.emit("note_editing_stop", {
                  roomId,
                  noteId: note._id
                });
              }}
            >
              Save
            </button>

            <button
              className="text-red-500 font-bold"
              onClick={() => {
                socket.emit("note_editing_stop", {
                  roomId,
                  noteId: note._id
                });

                deleteNote(note._id);
              }}
            >
              ×
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-bold text-lg">{note.title}</h3>
          <p className="mt-2 text-gray-700">{note.content}</p>
        </>
      )}
    </motion.div>
  );
}

export default NoteCard;
