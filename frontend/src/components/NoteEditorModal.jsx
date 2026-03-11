import React from "react";
import NoteEditor from "./NoteEditor";

function NoteEditorModal({
  show,
  title,
  content,
  setTitle,
  setContent,
  onClose,
  onSave
}) {
  if (!show) return null; // 🔥 this prevents rendering completely

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-[700px] h-[500px] bg-white rounded-lg shadow-2xl flex flex-col">


        <NoteEditor
          title={title}
          content={content}
          setTitle={setTitle}
          setContent={setContent}
        />

        {/* Bottom Action Bar */}
        <div className="p-4 border-t flex justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onSave();
              setShowEditor(false);
            }}
            className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-600 text-white"
          >
            Add Note

          </button>
        </div>

      </div>
    </div>
  );
}

export default NoteEditorModal;
