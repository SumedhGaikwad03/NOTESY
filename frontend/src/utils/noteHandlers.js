
import { addNote ,getAllNotes,deleteNote , updateNote } from '../api';


export const handleAddNote = async (title, content, setTitle, setContent) => {
  if (!title.trim() || !content.trim()) return;

  try {
    const newNote = { title: title.trim(), content: content.trim() };
    const res = await addNote(newNote);
    console.log("Note added:", res.data);

    setTitle("");
    setContent("");
  } catch (error) {
    console.error("Error adding note:", error);
  }
};
// const handleAddNote = async () => {
//   if (!title.trim() || !content.trim()) 
//     return;

//   try {
//     const newNote = { title, content };
//     const res = await addNote(newNote);

//     console.log("Note added:", res.data);

//     // Optional: clear inputs after adding
//     setTitle("");
//     setContent("");

//     // Optional: Show success toast or update notes list
//   } catch (error) {
//     console.error("Error adding note:", error);
//   }
// }; 

export const handleGetAllNotes = async (setNotes) => {
  try {
    const res = await getAllNotes();
    setNotes(res.data);
    console.log("All notes fetched:", res.data);
  } catch (error) {
    console.error("Error fetching notes:", error);
  }
};

export const handleDeleteNote = async (id, setNotes) => {
  try {
    console.log("Deleting note with ID:", id);
    await deleteNote(id);
    setNotes((prevNotes) => prevNotes.filter(note => note._id !== id));
    console.log("Note deleted:", id);
  } catch (error) {
    console.error("Error deleting note:", error);
  }
};

export const handleUpdateNote = async (id, updatedNote, setNotes) => {
  try {
    console.log("Updating note with ID:", id);
    await updateNote(id, updatedNote);
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note._id === id ? updatedNote : note))
    );
    console.log("Note updated:", id);
  } catch (error) {
    console.error("Error updating note:", error);
  }
};

// export const handleEditClick = (note) => {
//   setEditingNote(note);
//   setTitle(note.title);
//   setContent(note.content);
// };